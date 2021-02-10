import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Recovery } from './';

@Table({ timestamps: false })
export default class Recovery_Type extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column({
        type: DataType.TEXT
    })
    name;

    @HasMany(() => Recovery)
    recovery: Recovery[];
}
