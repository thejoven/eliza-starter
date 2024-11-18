const API_URL = "https://www.daos.fun/api/trpc/banner_events.list,daos?batch=1&input=%7B%221%22%3A%7B%7D%7D";
const RPC_URL = "https://overprivileged-peptized-cbnzbqndnj-dedicated.helius-rpc.com/?api-key=66be2bc4-3204-4984-a780-bff5c15a68a3";
const BASE_URL = "http://45.76.4.150:7000/"

export class API {
  static async getDaos() {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const reJson = await response.json();
        if (reJson[1]?.result?.data?.daos?.length > 0) {
          return reJson[1].result.data.daos;
        }
      }
    } catch (e) {
      console.error(`Error getDaos: ${e}`);
    }
    return null;
  }

  static async getCreatorContent(wallet: string) {
    try {
      const response = await fetch(`${BASE_URL}creator/${wallet}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error(`Error getCreatorContent: ${e}`);
    }
    return null;
  }

  static async getFundraiseContent(daoMint: string) {
    try {
      const response = await fetch(`${BASE_URL}fundraise/${daoMint}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error(`Error getFundraiseContent: ${e}`);
    }
    return null;
  }

  static async getIpfsContent(daoMint: string) {
    try {
      const response = await fetch(`${BASE_URL}ipfs/${daoMint}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error(`Error getIpfsContent: ${e}`);
    }
    return null;
  }

  static async getTokenInfoContent(daoMint: string) {
    try {
      const response = await fetch(`${BASE_URL}token_info/${daoMint}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error(`Error getTokenInfoContent: ${e}`);
    }
    return null;
  }

  static async getDaoV1Content(daoMint: string) {
    try {
      const response = await fetch(`${BASE_URL}dao_v1/${daoMint}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error(`Error getDaoV1Content: ${e}`);
    }
    return null;
  }
}