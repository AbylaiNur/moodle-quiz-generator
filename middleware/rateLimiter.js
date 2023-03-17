import rateLimit from 'express-rate-limit'

const getQuizLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "You can't make any more requests at the moment. Try again later",
    keyGenerator: (req, res) => {
        return req.clientIp // IP address from requestIp.mw(), as opposed to req.ip
    }
})

export {
    getQuizLimiter
}
