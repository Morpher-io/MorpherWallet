import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { Recovery } from './recovery.model';
import { Userhistory } from './userhistory.model';
import * as moment from 'moment';

@Table({ timestamps: true })
export class User extends Model<User> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Unique
    @Column({
        type: DataType.TEXT
    })
    email;

    @Column({
        type: DataType.TEXT
    })
    authenticator_qr;

    @Column({
        type: DataType.TEXT
    })
    authenticator_secret;

    @Column({
        type: DataType.TEXT
    })
    eth_address;

    @Column({
        type: DataType.INTEGER
    })
    email_verification_code;

    @Column({
        type: DataType.INTEGER
    })
    nonce;

    @Column({
        type: DataType.JSONB
    })
    payload;

    // @Column({
    //     type: DataType.BIGINT,
    //     defaultValue: () => moment.utc().valueOf()
    // })
    // created_at;

    @HasMany(() => Recovery)
    recovery: Recovery[];

    @HasMany(() => Userhistory)
    history: Userhistory[];
}
