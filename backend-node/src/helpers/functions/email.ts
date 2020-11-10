const AWS = require('aws-sdk');

export async function sendEmail2FA(payload, email){
    const SES = new AWS.SES({
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.ACCESS_KEY_SECRET
    });

    const emailBody = `Please confirm email 2FA: ${JSON.stringify(payload)}`;

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