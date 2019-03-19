declare interface Color {
    _id: string;
    active?: boolean;
    votes?: number;
    wins?: Array<string>;
}

declare interface WeekStat { votes: number; }

declare interface WeekStats { [ index: string ]: WeekStat; }

declare interface Week {
    _id?: string;
    date: string;
    stats: WeekStats;
    win?: string;
}

declare interface Win {
    _id?: string;
    color: string;
    votes: number;
    week: string;
}
