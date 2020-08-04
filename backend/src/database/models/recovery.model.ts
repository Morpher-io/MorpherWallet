import {
    AutoIncrement,
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
} from "sequelize-typescript";
import {Recovery_Type} from "./recovery_type.model";
import {User} from "./user.model";


@Table({ timestamps: false })
export class Recovery extends Model<Recovery> {
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
        }
    })
    user_id;

    @Column
    encrypted_seed: string

    @Column
    key: string

    @Column
    extra_information: string

    @Column({
        type: DataType.BIGINT
    })
    created_at;

    @BelongsTo(() => Recovery_Type)
    recovery_type: Recovery_Type;

    @BelongsTo(() => User)
    user: User;
}