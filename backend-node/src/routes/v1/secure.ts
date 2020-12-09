module.exports = function (req, res, next) {
    console.log('Request Type:', req.method)
    next()
}