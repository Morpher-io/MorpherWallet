/**
 * Custom middleware functions
 */
import { Logger } from './winston';
import { validateRecaptcha } from './util';

const recaptcha_ip = {};

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

function recaptcha(req, res, next) {
    if (process.env.ENVIRONMENT === 'development' || process.env.RECAPTCHA_SECRET == 'DISABLED') {
        return next();
    }
    // skip recaptcha if it was processed in the 10 min
    if (recaptcha_ip[req.ip] && recaptcha_ip[req.ip] > Date.now() - (1000 * 60 * 10) ) {
        return next();
    }
    const recaptchaToken = req.body.recaptcha;
    if (!recaptchaToken) {
        //Logger.warn({ data: { ip: req.ip, method: req.method, path: req.path, url: req.originalUrl} , message: 'Request Blocked - Recaptcha Required'});
        return res.status(403).json({ error: 'RECAPTCHA_REQUIRED' });
    }

    
    if (!validateRecaptcha(recaptchaToken)) {
       Logger.warn({ data: { ip: req.ip, method: req.method, path: req.path, url: req.originalUrl} , message: 'Request Blocked - Recaptcha Failed'});
       return res.status(403).json({ error: 'RECAPTCHA_FAILED' });
    }
    else {
        recaptcha_ip[req.ip] = Date.now();
        return next();
    }
}
module.exports = {
    secret,
    recaptcha  
}
