import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';

import { colors } from './controllers/colors';
import { weeks } from './controllers/weeks';
import { wins } from './controllers/wins';

export const app: express.Express = express();

app.set('trust proxy', true);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use('/api/colors', colors);
app.use('/api/weeks', weeks);
app.use('/api/wins', wins);
