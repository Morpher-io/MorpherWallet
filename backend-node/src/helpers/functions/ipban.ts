import { Logger } from './winston';

let ipAccessGetPath = {};
let banlist = require("./banlist.json");

let warnedLog = [];

Logger.info("Banlist: Having " + banlist.length + " IPs on the list");

export const ipban = function (req, res, next) {

    if (!res.finished) {
        //request not finished
        if (ipAccessGetPath[req.ip] && ipAccessGetPath[req.ip].length > 0 && ipAccessGetPath[req.ip].length % 3 == 0) {
            //one time honey pot
            ipAccessGetPath[req.ip].push(429);
            return res.sendStatus(429);

        }
    }
    if (banlist.includes(req.ip)) {
        return res.status(403).json({ error: "Access denied." });
    }

    if (req.path == "/getPayload") {
        if (res.finished) {
            if (ipAccessGetPath[req.ip] == undefined) {
                ipAccessGetPath[req.ip] = []
            }
            if (res.statusCode != 200) {
                ipAccessGetPath[req.ip].push(res.statusCode);
            }
            if (res.statusCode == 200) {
                ipAccessGetPath[req.ip] = []; //clear
            }

        }
    } else {
        //accessing any other endpoint without first being a valid user after being honey-pottet
        if (ipAccessGetPath[req.ip] && ipAccessGetPath[req.ip].length > 1 && !banlist.includes(req.ip)) {
            banlist.push(req.ip);
            Logger.warn({ data: { ip: req.ip, method: req.method, path: req.path, url: req.originalUrl }, message: 'Request Blocked - IP Banned' });
            return res.status(403).json({ error: "Access denied." });
        }
    }
    
    next();
}

