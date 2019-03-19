import * as assert from 'assert';
import { NextFunction, Request, Response, Router } from 'express';
import { InsertOneWriteOpResult, UpdateWriteOpResult } from 'mongodb';

import { db } from '../db';

import { startOfWeek } from './weeks';

export const colors = Router();

interface Voter { current: true; ip: string | Array<string>; }

const getIp = (req: Request): string | Array<string> => req.headers[ 'x-forwarded-for' ] || req.connection.remoteAddress;

colors.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<Response> => {
    try {
        const collection = db().collection('colors');
        const result = await collection.find<Color>({}).toArray();
        const map = result.map((color: Color) => ({ _id: color._id, active: color.active }));
        return res.status(200).json(map);
    } catch (err) {
        next(`Error getting colors: ${err}`);
    }
});

colors.get('/can-vote', async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    try {
        const collection = db().collection('voters');
        const result = await collection.findOne<Color>({ current: true, ip: getIp(req) });
        return res.status(200).json({ canVote: result === null });
    } catch (err) {
        next(`Error getting can vote: ${err}`);
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

        const weeks = db().collection('weeks');
        const weekParams = { date: startOfWeek() };
        const currentWeek = await weeks.findOne<Week>(weekParams);
        assert.notStrictEqual(currentWeek, null, 'Could not find current week');

        currentWeek.stats[ params._id ].votes = nextActive.votes;

        const voters = db().collection('voters');
        const voterParams = { current: true };
        const currentVoter = await voters.findOne<Voter>(voterParams);

        const updateResult: UpdateWriteOpResult = await collection.updateOne(params, { $set: nextActive });
        assert.strictEqual(1, updateResult.result.ok, `Could not update color ${params._id}`);

        const weekUpdateResult: UpdateWriteOpResult = await weeks.updateOne(weekParams, { $set: currentWeek });
        assert.strictEqual(1, weekUpdateResult.result.ok, 'Could not update current week');

        if (currentVoter !== null) {
            currentVoter.ip = getIp(req);
            const updateVoterResult: UpdateWriteOpResult = await voters.updateOne(voterParams, { $set: currentVoter });
            assert.strictEqual(1, updateVoterResult.result.ok, 'Could not update current voter');
        } else {
            const insertVoterResult: InsertOneWriteOpResult = await voters.insertOne({ current: true, ip: getIp(req) });
            assert.strictEqual(1, insertVoterResult.result.ok, 'Could not insert current voter');
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        next(`Error voting for color: ${err}`);
    }
});
