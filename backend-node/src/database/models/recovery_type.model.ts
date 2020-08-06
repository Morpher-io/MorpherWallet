import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Recovery } from './recovery.model';

@Table({ timestamps: false })
export class Recovery_Type extends Model<Recovery_Type> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column({
        type: DataType.STRING
    })
    name;

    @HasMany(() => Recovery)
    recovery: Recovery[];
}
