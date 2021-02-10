import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Recovery } from './Recovery.model';



@Table({ timestamps: false })
export class Recovery_Type extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column({
        type: DataType.TEXT
    })
    name: string;

    @HasMany(() => Recovery)
    recovery: Recovery[];
}
