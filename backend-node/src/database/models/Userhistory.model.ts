import { AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { User } from './User.model';

@Table({ timestamps: true })
export class Userhistory extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        references: {
            model: 'User',
            key: 'id'
        },
        allowNull: true,
        onDelete: 'cascade'
    })
    user_id;

    @Column({
        type: DataType.TEXT
    })
    old_value;

    @Column({
        type: DataType.TEXT
    })
    new_value;

    @Column({
        type: DataType.TEXT
    })
    change_type;

    @Column({
        type: DataType.TEXT
    })
    stringified_headers;
}
