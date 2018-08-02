import {Entity, Column, BaseEntity, PrimaryGeneratedColumn, BeforeInsert} from "typeorm";
import * as bcrypt from 'bcryptjs'


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

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }
}
