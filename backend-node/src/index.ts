import * as dotEnv from 'dotenv';
dotEnv.config();

import * as express from 'express';
import * as http from 'http';
import * as cors from 'cors';
import * as morgan from 'morgan';
import * as helmet from 'helmet';
import * as bodyParser from 'body-parser';
import { sequelize, User } from './database/models';
import {decrypt, encrypt, errorResponse, randomFixedInteger, sha256, successResponse} from './helpers/functions/util';
import { Logger } from './helpers/functions/winston';

// Import v1 routes instance for REST endpoint.
const v1 = require('./routes/v1/')(express);

// REST backend initialization.
const app = express();

const rateLimit = require('express-rate-limit');

const webLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60 // limit each IP to 60 requests per minute
});

// apply a rate limit to the web endpoints.
app.use('/v1/', webLimiter);

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
app.use(morgan('combined'));

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
    Logger.info(error.stack || error);
});

const Util = require('ethereumjs-util');

// Listen to the server ports.
httpServer.listen(process.env.PORT, async () => {
    console.log(`🚀Express Server ready at http://localhost:${process.env.PORT}`);

    // Database initialization.
    await sequelize.sync();
    Logger.info('Connected to database');


//     const signature = {
//     messageHash: "0xc206bbd6cebc3a8505d0811125796ac556510961739cf00b96f5acf27cd1646e",
//     r: "0x808d381d260a99b3aa73416e91174f6dc03c4fdb242224fa9f92a7e6b5ed3cbf",
//     s: "0x0d2396746a00777d31226c79654b76de82d1dc3364e6b8593114722048806f53",
//     signature: "0x808d381d260a99b3aa73416e91174f6dc03c4fdb242224fa9f92a7e6b5ed3cbf0d2396746a00777d31226c79654b76de82d1dc3364e6b8593114722048806f531c",
//     v: "0x1c"
// }

    const signature = {message: "test",
        messageHash: "0x4a5c5d454721bbbb25540c3317521e71c373ae36458f960d2ad46ef088110e95",
        v: "0x1c", r: "0xada7c1d6f805da920bac5abdb9ee8edb73730a6c59dff9e8ff47c2be3e6a4a86",
        signature: "0xada7c1d6f805da920bac5abdb9ee8edb73730a6c59dff9e8ff47c2be3e6a4a86778e1b80b83a43d2106e78b8ef32e788c81dcdd7e3c289714d9fe379d0373f6a1c",
        s: "0x778e1b80b83a43d2106e78b8ef32e788c81dcdd7e3c289714d9fe379d0373f6a"}
    const signObject = 'test';

    const msgHash = Util.keccak('test');

    console.log(msgHash.toString('hex'))

    const eth_address = '0x' + (Util.pubToAddress(Util.ecrecover(Buffer.from(signature.messageHash), Buffer.from(signature.v), Buffer.from(signature.r), Buffer.from(signature.s)))).toString('hex');

    console.log(eth_address)

});

// Export server for testing purposes
module.exports.app = app;
