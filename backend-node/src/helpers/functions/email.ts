const AWS = require('aws-sdk');

import { Logger } from './winston';
import { Email_Template, Email_Log, User } from '../../database/models';

export async function sendEmail2FA(payload, email, user) {
    const lang = user.payload.app_lang || 'en';

    let email_name = 'Email 2FA'

    if (user.payload.registerConfirmation == true) {
        email_name = 'Email 2FA Register'
    }

    let email_template = await Email_Template.findOne({ where: { template_name: email_name, lang }})
    // Fallback in case we add new languages and don't have a template yet.
    if(!email_template){
        email_template = await Email_Template.findOne({ where: { template_name: email_name, lang: 'en' }})
    }

    const SES = new AWS.SES({
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.ACCESS_KEY_SECRET,
        region: 'eu-west-1'
    });

    const from_address = email_template.from_address;
    let html = email_template.template_html;
    let text = email_template.template_text;
    let subject = email_template.subject;

    html = html.replace('{{2FA_CODE}}', payload)
    text = text.replace('{{2FA_CODE}}', payload)
    subject = subject.replace('{{2FA_CODE}}', payload)

    const params = {
        Destination: {
            ToAddresses: [email]
        },
        Message: {
            Body: {
                Text: {
                    Data: text
                },
                Html: {
                    Data: html
                }
            },
            Subject: {
                Data: subject
            }
        },
        Source: from_address
    };

    if (process.env.EMAIL_NOTIFICATIONS_NAME) params['ConfigurationSetName'] = process.env.EMAIL_NOTIFICATIONS_NAME

    const info = await SES.sendEmail(params).promise();

    try {

        const log:any = {
        
            id: info.MessageId,
            aws_sent_status: 'success',
            email,
            email_template_id: email_template.id
        }
        
        // Insert Email Logs
        await Email_Log.create(log);
    } catch (error){
        Logger.error({ source: 'sendEmail2FA', data:  {email}, message: error.message || error.toString() } );
    }
    
}

export async function sendEmailChanged(payload, email, user) {
    const lang = user.payload.app_lang || 'en';
    let email_template = await Email_Template.findOne({ where: { template_name: 'Email Changed', lang }});

    // Fallback in case we add new languages and don't have a template yet.
    if(!email_template){
        email_template = await Email_Template.findOne({ where: { template_name: 'Email Changed', lang: 'en' }})
    }

    const SES = new AWS.SES({
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.ACCESS_KEY_SECRET,
        region: 'eu-west-1'
    });

    
    const from_address = email_template.from_address;
    let html = email_template.template_html;
    let text = email_template.template_text;
    let subject = email_template.subject;

    html = html.replace('{{EMAIL_ADDRESS}}', payload)
    text = text.replace('{{EMAIL_ADDRESS}}', payload)
    subject = subject.replace('{{EMAIL_ADDRESS}}', payload)

    const params = {
        Destination: {
            ToAddresses: [email]
        },
        Message: {
            Body: {
                Text: {
                    Data: text
                },
                Html: {
                    Data: html
                }
            },
            Subject: {
                Data: subject
            }
        },
        Source: from_address
    };

    if (process.env.EMAIL_NOTIFICATIONS_NAME) params['ConfigurationSetName'] = process.env.EMAIL_NOTIFICATIONS_NAME

    const info = await SES.sendEmail(params).promise();

    try {

        const log:any = {
        
            id: info.MessageId,
            aws_sent_status: 'success',
            email,
            email_template_id: email_template.id
        }
        
        // Insert Email Logs
        await Email_Log.create(log);
    } catch (error){
        Logger.error({ source: 'sendEmail2FA', data:  {email}, message: error.message || error.toString() } );
    }
}
