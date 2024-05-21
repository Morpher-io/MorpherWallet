import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { Recovery } from './Recovery.model';
import { Userhistory } from './Userhistory.model';

@Table({ timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
    ]
 })
export class User extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

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
        type: DataType.DATE
    })
    email2fa_valid_until;

    @Column({
        type: DataType.INTEGER
    })
    nonce;

    @Column({
        type: DataType.BIGINT
    })
    nonce_timestamp;

    @Column({
        type: DataType.JSONB
    })
    payload;

    @Column({
        type: DataType.STRING
    })
    ip_address: string;

    @Column({
        type: DataType.STRING
    })
    ip_country: string;

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
