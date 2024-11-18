export interface QueueItem {
    names: string;
    type: string;
    date: string;
    message: string;
    daoMint: string;
  }
  
  export interface DaoItem {
    dao_mint: string;
    wallet: string;
    tw_sent: number;
    tw_funded_sent: number;
    tg_sent: number;
    tg_funded_sent: number;
    created_at?: string;
  }