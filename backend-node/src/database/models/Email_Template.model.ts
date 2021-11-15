import { AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { User } from './User.model';

@Table({ timestamps: true })
export class Email_Template extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column({
        type: DataType.STRING
    })
    template_name;

    @Column({
        type: DataType.STRING
    })
    from_address;    

    @Column({
        type: DataType.STRING
    })
    subject;        

    @Column({
        type: DataType.TEXT
    })
    template_html;

    @Column({
        type: DataType.TEXT
    })
    template_text;

    @Column({
        type: DataType.ENUM,
        values: ['en', 'ru'],
        defaultValue: 'en'
    })
    lang;
}
