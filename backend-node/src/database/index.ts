// The database entry point that sets up sequelize and the respective models.
import * as dotEnv from 'dotenv';
dotEnv.config();

import { Sequelize } from 'sequelize-typescript';

import { Op } from 'sequelize';

import * as models from './models';

//@ts-ignore
export const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    models: Object.values(models),
    logging: false, 
    define: {
        //prevent sequelize from pluralizing table names
        freezeTableName: true
    },
    dialectOptions: {
        statement_timeout: 60000,
        idle_in_transaction_session_timeout: 180000
    },
    pool: {
        max: 200,
        min: 0,
        idle: 120000,
        acquire: 60000
    }
});

const getTransaction = async () => {
    return sequelize.transaction();
};

export { Op };
export { getTransaction };

