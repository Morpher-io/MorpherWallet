import * as morgan from 'morgan';

import { Logger } from './winston';
const minStatusCode = process.env.LOGGING_STATUS_CODE_MIN ? process.env.LOGGING_STATUS_CODE_MIN : 400;
Logger.info({ message: "Request Logging: Minimum Status Code is " + minStatusCode })

export const loggingMiddleware = morgan(jsonFormat, {
    skip: function (req, res) { return res.statusCode < minStatusCode }
});

function jsonFormat(tokens, req, res) {
    return JSON.stringify({
        'remote-address': tokens['remote-addr'](req, res),
        'time': tokens['date'](req, res, 'iso'),
        'method': tokens['method'](req, res),
        'url': tokens['url'](req, res),
        'http-version': tokens['http-version'](req, res),
        'status-code': tokens['status'](req, res),
        'content-length': tokens['res'](req, res, 'content-length'),
        'referrer': tokens['referrer'](req, res),
        'user-agent': tokens['user-agent'](req, res),
        'req-header': tokens['req'](req, res, 'header'),
        'res-header': tokens['res'](req, res, 'header'),
        'response-time-ms': tokens['response-time'](req, res),
        'total-time-ms': tokens['total-time'](req, res),
        'message': `${tokens['method'](req, res)} ${tokens['url'](req, res)} [${tokens['status'](req, res)}] ${tokens['remote-addr'](req, res)}`
    });
}