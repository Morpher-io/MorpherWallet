module.exports = async function(req, res, next) {
    const secretKey = req.query.secret || req.body.secret;
    if (process.env.SECRET_API_KEY !== secretKey) return res.status(403).json({ error: 'Access denied.' });
    else next();
};
