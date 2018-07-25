import {Entity, Column, BaseEntity, PrimaryGeneratedColumn} from "typeorm";

@Entity("users")
export class User extends BaseEntity{

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("varchar", { length: 255 })
    email: string;

    @Column("text") // doesnt matter - we will be storing hash
    password: string;

    @Column("boolean", { default: false }) // check if user has confirmed their email
    confirmed: boolean
}
