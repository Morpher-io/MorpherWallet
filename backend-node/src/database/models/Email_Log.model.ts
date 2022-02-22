import {  Column, DataType, ForeignKey, Model, PrimaryKey, Table, Unique, BelongsTo } from 'sequelize-typescript';

import * as moment from 'moment';
import * as uuidv4 from 'uuid/v4';
import { Email_Template } from './Email_Template.model';

@Table({
    timestamps: false,
    indexes: [
        {
            unique: false,
            fields: ['email']
        },
        {
            unique: false,
            fields: ['email_template_id']
        },
        {
            unique: false,
            fields: ['timestamp']
        }
    ]
})
export class Email_Log extends Model {
    @PrimaryKey
    @Unique
    @Column({
        type: DataType.STRING,
        defaultValue: () => uuidv4()
    })
    id: string;

    @Column({
        type: DataType.STRING
    })
    aws_notification_id: string;

    @Column({
        type: DataType.STRING
    })
    aws_sent_status: string;

    @Column({
        type: DataType.STRING
    })
    email: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    bounce: boolean;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    complaint: boolean;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    delivery: boolean;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    open: boolean;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    click: boolean;

    @Column({
        type: DataType.JSONB
    })
    aws_raw_message: Object;

    @Column({
        type: DataType.BIGINT
    })
    updated_at: number;

    @Column({
        type: DataType.BIGINT,
        defaultValue: () => moment.utc().valueOf()
    })
    timestamp: number;

    @ForeignKey(() => Email_Template)
    @Column({
        type: DataType.INTEGER
    })
    email_template_id: number;

    @BelongsTo(() => Email_Template)
    email_template: Email_Template;
}

