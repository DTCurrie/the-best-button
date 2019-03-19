import { NextFunction, Request, Response, Router } from 'express';
import { ObjectID } from 'mongodb';

import { db } from '../db';

export const wins = Router();

export function createWin(week: Week): Win {
    const color = Object.keys(week.stats).reduce((a, b) => week.stats[ a ].votes > week.stats[ b ].votes ? a : b);
    return {
        color,
        votes: week.stats[ color ].votes,
        week: week._id
    };
}

wins.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<Response> => {
    try {
        const collection = db().collection('wins');
        const result = await collection.find<Win>({}).toArray();
        return res.status(200).json(result);
    } catch (err) {
        next(`Error getting wins: ${err}`);
    }
});

interface WinParams { _id: ObjectID; }
wins.get('/:_id', async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    try {
        const params: WinParams = { _id: new ObjectID(req.params._id) };
        const collection = db().collection('wins');
        const result = await collection.findOne<Win>(params);
        return res.status(200).json(result);
    } catch (err) {
        next(`Error getting win: ${err}`);
    }
});
