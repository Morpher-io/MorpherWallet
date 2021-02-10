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
    pool: {
        max: 100,
        min: 0,
        idle: 200000,
        acquire: 1000000
    }
});

const getTransaction = async () => {
    return sequelize.transaction();
};

export { Op };
export { getTransaction };
export { Recovery } from './models/Recovery.model';
export { Recovery_Type } from './models/Recovery_Type.model';
export { User } from './models/User.model';
export { Userhistory } from './models/Userhistory.model';

