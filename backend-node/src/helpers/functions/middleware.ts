/**
 * Custom middleware functions
 */
import { Logger } from './winston';

/**
 *  Checking secret key - Access denied if query parameter "secret" doesn't match process.env.SECRET_API_KEY
 *  Used for smart contract REST Endpoint
 */
function secret(req, res, next) {
    if (process.env.SECRET_API_KEY !== req.query.secret) {
       Logger.warn({ data: { ip: req.ip, method: req.method, path: req.path, url: req.originalUrl} , message: 'Request Blocked - Auth Failed'});
       return res.status(403).json({ error: 'Access denied.' });
    }
    else next();
}
module.exports.secret = secret;
