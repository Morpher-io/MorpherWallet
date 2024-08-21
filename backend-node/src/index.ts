import * as dotEnv from 'dotenv';
dotEnv.config();

import * as express from 'express';
import * as http from 'http';
import * as cors from 'cors';
import {loggingMiddleware} from './helpers/functions/logging-middleware';
import helmet from "helmet";
import * as bodyParser from 'body-parser';
import { sequelize } from './database/index';
import { successResponse } from './helpers/functions/util';
import { Logger } from './helpers/functions/winston';
import {mw} from 'request-ip'

// Import v1 routes instance for REST endpoint.
const v1 = require('./routes/v1/')(express);

// REST backend initialization.
const app = express();

const rateLimit = require('express-rate-limit');

const limitReached = (req: express.Request, res: express.Response) => {

    Logger.warn({ data: { ip: req.ip, method: req.method, path: req.path, url: req.originalUrl} , message: 'Rate limiter triggered'});
};

const limiter = {
    windowMs: 60 * 1000, // 1 minute
    onLimitReached: limitReached,
    max: 200 // limit each IP to 60 requests per minute
};

app.set('trust proxy', 1)

if (process.env.ENVIRONMENT === 'development') {
    limiter.max = 600;
}

const webLimiter = rateLimit(limiter);

// apply a rate limit to the web endpoints.
app.use('/v1/', webLimiter);
app.use(mw())
// CORS - Cross-Origin Resource Sharing.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header(
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Headers, Origin,Accept, ' +
            'Authorization, X-Requested-With, Content-Type, Access-Control-Request-Method, ' +
            'Access-Control-Request-Headers, postid'
    );
    next();
});
app.use(cors());

// Use morgan combined with winston for logging.
//app.use(morgan('combined'));
app.use(loggingMiddleware);

// Use helmet and body parser library
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '1mb' })); //app.use(bodyParser.json());

// Assign v1 routes to the express app.
app.use('/v1', v1);

app.get('/', async (req, res) => {
    return successResponse(res, { message: 'Pending Morpher API' });
});

// Create Express HTTP Server instance using native http module.
const httpServer = http.createServer(app);

process.on('unhandledRejection', (error: any, promise) => {
    Logger.error({ source: 'unhandledRejection', data: error.stack  || error, message: error.message || error.toString() } );
});

async function quitBackend() {
    Logger.info('Backend exiting. Thanks.');
    process.exit(0);
}

process.on('SIGINT', quitBackend);
process.on('SIGTERM', quitBackend);


if (!module.parent) {
    // Listen to the server ports.
    httpServer.listen(process.env.PORT, async () => {
        Logger.info({ status: `🚀Express Server ready at http://localhost:${process.env.PORT}` });

        // Database initialization.
        await sequelize.sync();
        Logger.info({ status: 'Connected to database' });
    });
}

// Export server for testing purposes
module.exports.app = app;
