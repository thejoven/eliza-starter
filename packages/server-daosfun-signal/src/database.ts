import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';

interface DaoRecord {
    dao_mint: string;
    wallet: string;
    tw_sent: number;
    tw_funded_sent: number;
    tg_sent: number;
    tg_funded_sent: number;
    dao_mint_at: string;
    tw_sent_at: string;
    tw_funded_at: string;
    tg_sent_at: string;
    tg_funded_at: string;
    created_at: string;
}

export class DaoDatabase {
    private db: DatabaseType;

    constructor(dbName: string = 'daos.db') {
        this.db = new Database(dbName);
        this._initializeDb();
    }

    private _initializeDb(): void {
        const sql = `CREATE TABLE IF NOT EXISTS daos (
            dao_mint TEXT PRIMARY KEY,       
            wallet TEXT DEFAULT '',
            tw_sent INTEGER DEFAULT 0,
            tw_funded_sent INTEGER DEFAULT 0,                
            tg_sent INTEGER DEFAULT 0,
            tg_funded_sent INTEGER DEFAULT 0,                
            dao_mint_at TIMESTAMP,
            tw_sent_at TIMESTAMP,
            tw_funded_at TIMESTAMP,
            tg_sent_at TIMESTAMP,
            tg_funded_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        
        this.db.exec(sql);
    }

    getDaoMint(daoMint: string): DaoRecord | undefined {
        return this.db.prepare('SELECT * FROM daos WHERE dao_mint = ?')
            .get(daoMint) as DaoRecord | undefined;
    }

    getLastDaoMint(): string {
        const result = this.db.prepare('SELECT dao_mint FROM daos ORDER BY ROWID DESC LIMIT 1')
            .get() as { dao_mint: string } | undefined;
        return result?.dao_mint || '';
    }

    updateTwSent(daoMint: string): void {
        this.db.prepare('UPDATE daos SET tw_sent = 2, tw_sent_at = CURRENT_TIMESTAMP WHERE dao_mint = ?')
            .run(daoMint);
    }

    updateTwFundedSent(daoMint: string): void {
        this.db.prepare('UPDATE daos SET tw_funded_sent = 2, tw_funded_at = CURRENT_TIMESTAMP WHERE dao_mint = ?')
            .run(daoMint);
    }

    updateTgSent(daoMint: string): void {
        this.db.prepare('UPDATE daos SET tg_sent = 2, tg_sent_at = CURRENT_TIMESTAMP WHERE dao_mint = ?')
            .run(daoMint);
    }

    updateTgFundedSent(daoMint: string): void {
        this.db.prepare('UPDATE daos SET tg_funded_sent = 2, tg_funded_at = CURRENT_TIMESTAMP WHERE dao_mint = ?')
            .run(daoMint);
    }

    updateSent(daoMint: string): void {
        this.db.prepare(`
            UPDATE daos 
            SET tw_sent = 2, 
                tw_funded_sent = 2, 
                tg_sent = 2, 
                tg_funded_sent = 2,
                tw_sent_at = CURRENT_TIMESTAMP,
                tw_funded_at = CURRENT_TIMESTAMP,
                tg_sent_at = CURRENT_TIMESTAMP,
                tg_funded_at = CURRENT_TIMESTAMP
            WHERE dao_mint = ?
        `).run(daoMint);
    }

    updateStatus(daoMint: string, data: Record<string, any>[]): void {
        const updates = data.map(item => {
            const [[key, value]] = Object.entries(item);
            return `${key} = ${value}`;
        }).join(', ');

        this.db.prepare(`UPDATE daos SET ${updates} WHERE dao_mint = ?`)
            .run(daoMint);
    }

    insertDao(daoMint: string, wallet: string, daoMintAt: string, isFirst: boolean = false): void {
        const stmt = isFirst
            ? this.db.prepare(`
                INSERT INTO daos (
                    dao_mint, wallet, tw_sent, tw_funded_sent, tg_sent, tg_funded_sent, 
                    created_at, dao_mint_at, tw_sent_at, tw_funded_at, tg_sent_at, tg_funded_at
                ) VALUES (
                    ?, ?, 2, 2, 2, 2, CURRENT_TIMESTAMP, ?, 
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )`)
            : this.db.prepare(`
                INSERT INTO daos (
                    dao_mint, wallet, tw_sent, tw_funded_sent, tg_sent, tg_funded_sent, 
                    created_at, dao_mint_at
                ) VALUES (
                    ?, ?, 0, 0, 0, 0, CURRENT_TIMESTAMP, ?
                )`);

        stmt.run(daoMint, wallet, daoMintAt);
    }

    getUnsendDaos(): DaoRecord[] {
        return this.db.prepare(`
            SELECT * FROM daos 
            WHERE tw_sent = 0 
               OR tw_funded_sent = 0 
               OR tg_sent = 0 
               OR tg_funded_sent = 0
        `).all() as DaoRecord[];
    }

    getSendingDaos(): DaoRecord[] {
        return this.db.prepare(`
            SELECT * FROM daos 
            WHERE tw_sent = 1 
               OR tw_funded_sent = 1 
               OR tg_sent = 1 
               OR tg_funded_sent = 1
        `).all() as DaoRecord[];
    }

    getSendDaos(): DaoRecord[] {
        return this.db.prepare(`
            SELECT * FROM daos 
            WHERE tw_sent = 2 
               OR tw_funded_sent = 2 
               OR tg_sent = 2 
               OR tg_funded_sent = 2
        `).all() as DaoRecord[];
    }

    close(): void {
        this.db.close();
    }
}