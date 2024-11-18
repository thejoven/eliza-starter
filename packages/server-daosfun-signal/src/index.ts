import { existsSync, writeFileSync } from 'fs';
import { DaoDatabase } from './database';
import { API } from './daos-api';
import { QueueManager } from './queue-manager';
import { MessageProcessor } from './message-processor';
import { sleep } from './utils';
import { IAgentRuntime } from "@ai16z/eliza";
// import { TwitterService } from './twitter';

export class DaosFunSignalServer {
  private readonly db: DaoDatabase;
  private readonly queueManager: QueueManager;
  private readonly messageProcessor: MessageProcessor;
//   private readonly twitterService: TwitterService;
  private isRunning: boolean = false;

  constructor(runtime: IAgentRuntime, dbPath?: string) {
    this.db = new DaoDatabase(dbPath);
    this.queueManager = new QueueManager();
    this.messageProcessor = new MessageProcessor(this.db, this.queueManager);
    // this.twitterService = new TwitterService(runtime);
  }

  async start(): Promise<void> {
    this.isRunning = true;
    
    // 启动所有处理循环
    await Promise.all([
      this.daoMintLoop(),
      this.processLoop(),
      this.tweetQueueLoop()
    //   this.telegramQueueLoop()
    ]);
  }

  private async daoMintLoop(): Promise<void> {
    console.log("Starting daoMintLoop...==========================================================");
    const lockFile = 'lock.txt';
    let isFirst = !existsSync(lockFile);
    
    if (isFirst) {
      writeFileSync(lockFile, '');
    }

    let lastDaoMint = this.db.getLastDaoMint();

    while (this.isRunning) {
      const startTime = Date.now();
      
      try {
        const daos = await API.getDaos();
        if (daos) {
          const newDaos = [];
          
          if (!isFirst) {
            for (const dao of daos) {
              if (dao.dao_mint !== lastDaoMint) {
                newDaos.unshift(dao);
              } else {
                break;
              }
            }
          } else {
            newDaos.push(...daos.reverse());
          }

          for (const dao of newDaos) {
            const daoMint = dao.dao_mint;
            const createdAt = dao.created_at || '';
            
            if (!this.db.getDaoMint(daoMint)) {
              this.db.insertDao(daoMint, dao.wallet, createdAt, isFirst);
            } else {
              this.db.updateSent(daoMint);
            }

            lastDaoMint = daoMint;
          }

          if (isFirst) {
            isFirst = false;
          }
        }
      } catch (error) {
        console.error('Error in daoMintLoop:', error);
      }

      const processingTime = Date.now() - startTime;
      if (processingTime < 5000) {
        await sleep(5000 - processingTime);
      }
    }
  }

  private async processLoop(): Promise<void> {
    while (this.isRunning) {
      const startTime = Date.now();
      
      try {
        const unsendingDaos = this.db.getUnsendDaos();
        for (const dao of unsendingDaos) {
          await this.messageProcessor.processSend(dao);
        }
      } catch (error) {
        console.error('Error in processLoop:', error);
      }

      const processingTime = Date.now() - startTime;
      if (processingTime < 5000) {
        await sleep(5000 - processingTime);
      }
    }
  }

  private async tweetQueueLoop(): Promise<void> {
    console.log('Starting tweet queue processing...');
    
    while (this.isRunning) {
      const startTime = Date.now();
      
      try {
        const queueItem = this.queueManager.getTweetQueueItem();
        
        if (queueItem) {
          const { names, type, date, message, daoMint } = queueItem;
          
          console.log(`Processing tweet for DAO: ${daoMint}`);
          
        //   if (await this.twitterService.sendTweet(message)) {
        //     // 发送成功，更新数据库状态
        //     this.db.updateStatus(daoMint, [
        //       { [type]: 2 },
        //       { [date]: 'CURRENT_TIMESTAMP' }
        //     ]);
        //     this.queueManager.removeTweetItem(names);
        //     console.log(`Successfully sent tweet for DAO: ${daoMint}`);
            
        //     // 发送成功后等待一段时间
        //     await sleep(500);
        //   } else {
        //     // 发送失败，重置状态
        //     this.db.updateStatus(daoMint, [{ [type]: 0 }]);
        //     console.log(`Failed to send tweet for DAO: ${daoMint}`);
        //   }
        }
      } catch (error) {
        console.error('Error in tweetQueueLoop:', error);
      }

      const processingTime = Date.now() - startTime;
      if (processingTime < 5000) {
        await sleep(5000 - processingTime);
      }
    }
  }

  stop(): void {
    this.isRunning = false;
    this.db.close();
  }
}

// 导出 Client 接口实现
export const DaosFunSignalClient = {
  async start(runtime: IAgentRuntime) {
    console.log("DaosFun Signal client started");
    const server = new DaosFunSignalServer(runtime);
    await server.start();
    return server;
  },
  
  async stop(runtime: IAgentRuntime) {
    console.warn("DaosFun Signal client stopping...");
  },
};

export default DaosFunSignalClient;