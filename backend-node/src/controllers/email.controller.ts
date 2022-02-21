import { errorResponse, successResponse } from '../helpers/functions/util';
import { Email_Log } from '../database/models';
import { Request, Response } from 'express';
import { Logger } from '../helpers/functions/winston';

const emailNotification = async function(req: Request, res: Response) {
    try {
        var bodyarr = [];
        req.on('data', async chunk => {
            bodyarr.push(String(chunk));
        });
        req.on('end', async () => {
            if (bodyarr.length === 0) {
                Logger.info({
                    method: 'emailNotification',
                    message: 'no data was returned'
                });
                res.end('ok');
                return;
            }
            const dataString = bodyarr.join('');
            let data: any;
            try {
                data = JSON.parse(dataString);
            } catch (err) {
                Logger.info({
                    method: 'emailNotification',
                    message: 'invalid json value received for notification',
                    data
                });
                res.end('ok');
                return;
            }
            if (data.Type === 'SubscriptionConfirmation') {
                const https = require('https');

                https.get(data.SubscribeURL, res => {
                    Logger.info({
                        method: 'emailNotification',
                        message: 'We have accepted the confirmation from AWS.'
                    });
                });


            } else if (data.Type === 'Notification') {
                const notificationId = data.MessageId;
                const message = JSON.parse(data.Message);
                const type = message.notificationType ? message.notificationType.toLowerCase() : message.eventType.toLowerCase();
                const messageId = message.mail.messageId;
                const email = message.mail.destination[0];

                if (type === 'bounce') {
                    const bounceType = message.bounce.bounceType
                    await processBounce(email, bounceType);
                }
                if (type === 'complaint') await processComplaint(email);

                const log = await Email_Log.findOne({ where: { id: messageId, email } });


                if (log) {
                    log[type] = true;
                    log.updated_at = Date.now();
                    log.aws_raw_message = message;
                    log.aws_notification_id = notificationId;

                    await log.save();
                }

                return successResponse(res, { message: 'Success' });
            }
        });
    } catch (error) {
        return errorResponse(res, error);
    }
};

/**
 * Process spam notifications. When the user flags our email as spam then unsubscribe them from all lists
 * @param email
 */
const processComplaint = async function(email) {
    //future - implement email blocking
};

/**
 * Process bounce notifications. When the email is rejected 3 times then delete the user from the email_list
 * @param email
 */
const processBounce = async function(email, bounceType) {
    //future - implement email blocking
};

export { emailNotification };
