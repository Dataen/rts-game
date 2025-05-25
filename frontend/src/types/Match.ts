export type Match = {
    uuid: string;
    userId: string;
    createdAt: string | null;
    finishedAt: string | null;
    botAUuid: string | null;
    botBUuid: string | null;
    winnerBotId: string | null;
}

export type MatchCreate = {
    botAUuid: string;
    botBUuid: string;
};