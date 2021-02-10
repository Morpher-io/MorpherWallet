// The database entry point that sets up sequelize and the respective models.
import * as dotEnv from 'dotenv';
dotEnv.config();

import { Sequelize } from 'sequelize-typescript';

import { Op } from 'sequelize';

// @ts-ignore
export const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    define: {
        //prevent sequelize from pluralizing table names
        freezeTableName: true
    },    
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    freezeTableName: true,
    modelPaths: [__dirname + '/*.model.*'],
        modelMatch: (filename, member) => {
            return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase();
        },
    //models: [__dirname + '/**/*.model.ts'],
    logging: false,
    storage: ':memory:',
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
export { Recovery } from './Recovery.model';
export { Recovery_Type } from './Recovery_Type.model';
export { User } from './User.model';
export { Userhistory } from './Userhistory.model';
