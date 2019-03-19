import { NextFunction, Request, Response, Router } from 'express';
import { ObjectID } from 'mongodb';

import { db } from '../db';

export const weeks = Router();

export function startOfWeek(): string {
    const date = new Date();
    const diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -7 : 0);
    const dateString = new Date(date.setDate(diff)).toLocaleDateString('en-US');
    return dateString;
}

weeks.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<Response> => {
    try {
        const collection = db().collection('weeks');
        const result = await collection.find<Week>({}).toArray();

        result.sort((a: Week, b: Week) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return res.status(200).json(result);
    } catch (err) {
        next(`Error getting weeks: ${err}`);
    }
});

interface WeekParams { _id: ObjectID | 'current'; }
weeks.get('/:_id', async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    try {
        const params: WeekParams = req.params;
        const current = params._id === 'current';

        if (!current) { params._id = new ObjectID(params._id); }

        const collection = db().collection('weeks');
        const result = await collection.findOne<Week>(current ? { date: startOfWeek() } : params);

        return res.status(200).json(current ? { _id: result._id, date: result.date, stats: result.stats } : result);
    } catch (err) {
        next(`Error getting week: ${err}`);
    }
});
