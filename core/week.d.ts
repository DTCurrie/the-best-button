export declare interface WeekStat { color: string; votes: number; }
export declare interface WeekStats { [ index: string ]: WeekStat; }

export declare interface Week {
    _id: string;
    date: Date;
    stats: WeekStats;
    win: string;
}
