export const botLanguages = ['python', 'cpp', 'typescript'] as const;
export type BotLanguage = typeof botLanguages[number];

export type Bot = {
    id: string;
    name: string;
    language: BotLanguage;
    rating: number;
    userId: string;
    creationDate: string;
};

export type BotCreate = {
    name: string;
    language: BotLanguage;
}