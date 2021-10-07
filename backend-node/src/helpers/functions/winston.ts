// Customizable logging library combining console and AWS logging.
const { createLogger, format, transports } = require('winston');


const path = require('path');

// @ts-ignore
const mainModuleName = path.basename(process.mainModule.filename);

const logStreamName = mainModuleName;

export const Logger = createLogger({
    level: 'info',
    json: true,
    defaultMeta: {
        service: logStreamName
    },
    transports: [new transports.Console({})],
    exitOnError: false
});
