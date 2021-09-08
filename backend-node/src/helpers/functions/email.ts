const AWS = require('aws-sdk');

import { Email_Template } from '../../database/models';

export async function sendEmail2FA(payload, email) {
    const email_template = await Email_Template.findOne({where: { template_name: 'Email 2FA' }})
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

    await SES.sendEmail(params).promise();
}

export async function sendEmailChanged(payload, email) {
    const SES = new AWS.SES({
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.ACCESS_KEY_SECRET,
        region: 'eu-west-1'
    });

    const emailBody = `Your email address has changed to: ${payload}`;

    const params = {
        Destination: {
            ToAddresses: [email]
        },
        Message: {
            Body: {
                Text: {
                    Data: emailBody
                }
            },
            Subject: {
                Data: 'Morpher Wallet Email Has Changed!'
            }
        },
        Source: 'team@morpher.com'
    };

    await SES.sendEmail(params).promise();
}
