import { DaoDatabase } from './database';
import { API } from './daos-api';
import { QueueManager } from './queue-manager';
import { formatMarketCap } from './utils';
import { DaoItem } from './types';

export class MessageProcessor {
  constructor(
    private readonly db: DaoDatabase,
    private readonly queueManager: QueueManager
  ) {}

  async processSend(item: DaoItem): Promise<void> {
    const { dao_mint, wallet } = item;

    if (item.tw_sent === 0 || item.tg_sent === 0) {
      const [creator, fundraise, ipfs, daoV1] = await Promise.all([
        API.getCreatorContent(wallet),
        API.getFundraiseContent(dao_mint),
        API.getIpfsContent(dao_mint),
        API.getDaoV1Content(dao_mint)
      ]);

      if (creator && fundraise && ipfs && daoV1) {
        const fundingGoalConverted = Number(fundraise.fundingGoal) / 1e9;
        const expirationDate = new Date(Number(fundraise.expirationTimestamp) * 1000)
          .toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

        const updates: Record<string, any>[] = [];

        if (item.tw_sent === 0) {
          const tweetMessage = this.formatTweetMessage(ipfs, dao_mint, creator, fundingGoalConverted, expirationDate, daoV1);
          updates.push({ tw_sent: 1 });
          
          this.queueManager.addToTweetQueue({
            names: `tw_s_${dao_mint}`,
            type: 'tw_sent',
            date: 'tw_sent_at',
            message: tweetMessage,
            daoMint: dao_mint
          });
        }

        if (item.tg_sent === 0) {
          const telegramMessage = this.formatTelegramMessage(ipfs, dao_mint, creator, fundingGoalConverted, expirationDate, daoV1);
          updates.push({ tg_sent: 1 });

          this.queueManager.addToTelegramQueue({
            names: `tg_s_${dao_mint}`,
            type: 'tg_sent',
            date: 'tg_sent_at',
            message: telegramMessage,
            daoMint: dao_mint
          });
        }

        if (updates.length > 0) {
          this.db.updateStatus(dao_mint, updates);
        }
      }
    }

    // 处理 funded 消息
    if (item.tw_funded_sent === 0 || item.tg_funded_sent === 0) {
      // 类似的逻辑处理 funded 消息...
    }
  }

  private formatTweetMessage(ipfs: any, daoMint: string, creator: any, fundingGoal: number, expirationDate: string, daoV1: any): string {
    return [
      'New Daos Fun Fund Created\n',
      `💹 ${ipfs.name} ($${ipfs.symbol})`,
      `#️⃣ ${daoMint}`,
      `👨‍💻 Created by @${creator.twitter_username}`,
      `🤑 Raising ${fundingGoal}Sol`,
      `📆 Expires on ${expirationDate}`,
      `🏧 Creator Carry ${daoV1.carryBasis / 100}%\n`,
      `https://dexscreener.com/solana/${daoMint}`
    ].join('\n');
  }

  private formatTelegramMessage(ipfs: any, daoMint: string, creator: any, fundingGoal: number, expirationDate: string, daoV1: any): string {
    return [
      '<b>New Daos Fun Fund Created</b>\n',
      `💹 <b>${ipfs.name} ($${ipfs.symbol})</b>`,
      `#️⃣ <b>${daoMint}</b>`,
      `👨‍💻 Created by @${creator.twitter_username}`,
      `🤑 Raising ${fundingGoal}Sol`,
      `📆 Expires on ${expirationDate}`,
      `🏧 Creator Carry ${daoV1.carryBasis / 100}%\n`
    ].join('\n');
  }
}