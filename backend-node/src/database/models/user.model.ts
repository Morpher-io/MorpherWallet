import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { Recovery } from './recovery.model';

@Table({ timestamps: false })
export class User extends Model<User> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Unique
    @Column({
        type: DataType.STRING
    })
    email;

    @Column({
        type: DataType.BIGINT
    })
    created_at;

    @HasMany(() => Recovery)
    recovery: Recovery[];
}
