export const platforms = {
    discord: null, // these will be integration objects
    farcaster: null,
    email: null,
    telegram: null,
};
export type DiscordServerOptions = {
    type: "discord-server";
    serverId: number;
    xp: {
        chat: {
            amount: number;
            interval: number;
        }
    }
}

export type FarcasterAccountOptions = {
    type: "farcaster-account";
    fid: number;
    xp: {
        comments: {
            amount: number;
            maxPerPost: number;
        }
        likes: {
            amount: number;
        }
        recasts: {
            amount: number;
        }
    }
}

export type FarcasterChannelOptions = {
    type: "farcaster-channel";
    channelId: string;
}


export type IntegrationOptions = DiscordServerOptions | FarcasterAccountOptions | FarcasterChannelOptions;