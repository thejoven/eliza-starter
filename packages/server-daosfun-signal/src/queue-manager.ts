import { QueueItem } from './types';

export class QueueManager {
  private tweetQueue: QueueItem[] = [];
  private telegramQueue: QueueItem[] = [];
  private tweetSet: Set<string> = new Set();
  private telegramSet: Set<string> = new Set();

  addToTweetQueue(item: QueueItem): void {
    if (!this.tweetSet.has(item.names)) {
      this.tweetQueue.push(item);
      this.tweetSet.add(item.names);
      console.log(`${new Date().toISOString()} [加入tweet发送队列]: ${item.daoMint}`);
    }
  }

  addToTelegramQueue(item: QueueItem): void {
    if (!this.telegramSet.has(item.names)) {
      this.telegramQueue.push(item);
      this.telegramSet.add(item.names);
      console.log(`${new Date().toISOString()} [加入telegram发送队列]: ${item.daoMint}`);
    }
  }

  getTweetQueueItem(): QueueItem | undefined {
    return this.tweetQueue.shift();
  }

  getTelegramQueueItem(): QueueItem | undefined {
    return this.telegramQueue.shift();
  }

  removeTweetItem(names: string): void {
    this.tweetSet.delete(names);
  }

  removeTelegramItem(names: string): void {
    this.telegramSet.delete(names);
  }
}