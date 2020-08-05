const region = 'eu-central-1';

const myArgs = process.argv.slice(2);

// Retreive the secret data from the AWS secrets manager and load then into process.env
const loadSecretEnv = async () => {
    try {
        if (myArgs.length === 0) {
            console.log('No environment name was specified');
            return;
        }

        const secretName = 'environment_' + myArgs[0];

        console.log('Start - AWS Environment Loading "' + secretName + '"');

        // Connect to AWS secrets manager
        const AWS = require('aws-sdk');

        const client = new AWS.SecretsManager({
            region
        });

        // get the secret data from the AWS api
        const data = await client
            .getSecretValue({
                SecretId: secretName
            })
            .promise();

        if (data) {
            // get the string from the returned data
            let parsedSecret;

            if (data.SecretString) {
                const secret = data.SecretString;
                parsedSecret = JSON.parse(secret);
            } else {
                // If there is no secret string then descrpy the secret data
                const buff = new Buffer(data.SecretBinary.toString(), 'base64');
                const secret = buff.toString('ascii');
                parsedSecret = JSON.parse(secret);
            }
            let text = '';
            // copy all secret properties into the env variables
            Object.keys(parsedSecret).forEach(key => {
                text += key + '=' + parsedSecret[key] + '\n';
            });

            const fs = require('fs');
            fs.writeFileSync('.env', text);

            console.log('Completed - AWS Environment Loading');
        }
    } catch (err) {
        console.log('Error getting aws secret environment:' + err.message);
    }
};

loadSecretEnv();
