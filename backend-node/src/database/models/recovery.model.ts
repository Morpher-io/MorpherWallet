import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Recovery_Type } from './Recovery_Type.model';
import { User } from './User.model';
import * as moment from 'moment';

@Table({ timestamps: false })
export class Recovery extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => Recovery_Type)
    @Column({
        type: DataType.INTEGER,
        references: {
            model: 'Recovery_Type',
            key: 'id'
        }
    })
    recovery_type_id;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        references: {
            model: 'User',
            key: 'id'
        },
        onDelete: 'cascade'
    })
    user_id;

    @Column({
        type: DataType.TEXT
    })
    encrypted_seed: string;

    @Column({
        type: DataType.TEXT
    })
    key: string;

    @Column({
        type: DataType.TEXT
    })
    extra_information: string;

    @Column({
        type: DataType.BIGINT,
        defaultValue: () => moment.utc().valueOf()
    })
    created_at;

    @BelongsTo(() => Recovery_Type)
    recovery_type: Recovery_Type;

    @BelongsTo(() => User)
    user: User;
}
