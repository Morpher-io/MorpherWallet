const AWS = require('aws-sdk');

export async function sendEmail2FA(payload, email){
    const SES = new AWS.SES({
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.ACCESS_KEY_SECRET,
        region: 'eu-west-1'
    });

    const emailBody = `Your email verification code is: ${payload}`;

    const params = {
        Destination: {
            ToAddresses:  [email]
        },
        Message: {
            Body: {
                Text: {
                    Data: emailBody,
                }
            },
            Subject: {
                Data: 'Email 2FA',
            }
        },
        Source: 'team@morpher.com',
    };

    await SES.sendEmail(params).promise();
}

export async function sendEmailChanged(payload, email){
    const SES = new AWS.SES({
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.ACCESS_KEY_SECRET,
        region: 'eu-west-1'
    });

    const emailBody = `Your email address has changed to: ${payload}`;

    const params = {
        Destination: {
            ToAddresses:  [email]
        },
        Message: {
            Body: {
                Text: {
                    Data: emailBody,
                }
            },
            Subject: {
                Data: 'Morpher Wallet Email Has Changed!',
            }
        },
        Source: 'team@morpher.com',
    };

    await SES.sendEmail(params).promise();
}