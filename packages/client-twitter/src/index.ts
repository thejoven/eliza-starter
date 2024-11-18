import { TwitterPostClient } from "./post.ts";
import { TwitterSearchClient } from "./search.ts";
import { TwitterInteractionClient } from "./interactions.ts";
import { IAgentRuntime, Client } from "@ai16z/eliza";
import { DaosFunSignalServer } from "@ai16z/server-daosfun-signal";

class TwitterAllClient {
    post: TwitterPostClient;
    search: TwitterSearchClient;
    interaction: TwitterInteractionClient;
    daosFun: DaosFunSignalServer;

    constructor(runtime: IAgentRuntime) {
        // Schedule tweets to be sent
        this.post = new TwitterPostClient(runtime);
        // this.search = new TwitterSearchClient(runtime); // don't start the search client by default
        // this searches topics from character file, but kind of violates consent of random users
        // burns your rate limit and can get your account banned
        // use at your own risk
        this.interaction = new TwitterInteractionClient(runtime);
        // 初始化 DaosFun 服务
        this.daosFun = new DaosFunSignalServer(runtime);
    }


}

export const TwitterClientInterface: Client = {
    async start(runtime: IAgentRuntime) {
        console.log("Twitter client started");
        return new TwitterAllClient(runtime);
    },
    async stop(runtime: IAgentRuntime) {
        console.warn("Twitter client does not support stopping yet");
    },
};

export default TwitterClientInterface;
