/**
 * Custom middleware functions
 */

/**
 *  Checking secret key - Access denied if query parameter "secret" doesn't match ENV.SECRET_API_KEY
 *  Used for smart contract REST Endpoint
 */
function secret(req, res, next) {
    if (process.env.SECRET_API_KEY !== req.query.secret) return res.status(403).json({ error: 'Access denied.' });
    else next();
}
module.exports.secret = secret;
