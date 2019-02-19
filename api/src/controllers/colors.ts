import assert from 'assert';
import express, { NextFunction, Request, Response } from 'express';
import { UpdateWriteOpResult } from 'mongodb';

import { Color } from '../../../core/color';
import { db } from '../db';

export const colors = express.Router();

colors.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<Response> => {
    try {
        const collection = db().collection('colors');
        const result = await collection.find({}).toArray();
        return res.status(200).json(result);
    } catch (err) {
        next(`Error getting colors: ${err}`);
    }
});

interface VoteParams { _id: string; }

colors.post('/:_id/vote', async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    try {
        assert.notStrictEqual(null, req.params._id, 'Invalid parameters');

        const params: VoteParams = req.params;
        const collection = db().collection('colors');
        const lastActive = await collection.findOne<Color>({ active: true });

        if (lastActive) {
            lastActive.active = false;
            const updateResult: UpdateWriteOpResult = await collection.updateOne({ active: true }, { $set: lastActive });
            assert.strictEqual(1, updateResult.result.ok, 'Could not deactivate active color');
        }

        const nextActive = await collection.findOne<Color>(params);
        assert.notStrictEqual(nextActive, null, `Could not find color ${params._id}`);

        nextActive.votes++;
        nextActive.active = true;

        const updateResult: UpdateWriteOpResult = await collection.updateOne(params, { $set: nextActive });
        assert.strictEqual(1, updateResult.result.ok, `Could not update color ${params._id}`);

        return res.status(200).json({ success: true });
    } catch (err) {
        next(`Error voting for color: ${err}`);
    }
});
