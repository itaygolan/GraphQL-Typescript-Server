import {Entity, PrimaryColumn, Column, BeforeInsert, BaseEntity} from "typeorm";
import * as uuidv4 from 'uuid/v4';

@Entity("users")
export class User extends BaseEntity{

    @PrimaryColumn("uuid")
    id: string;

    @Column("varchar", { length: 255 })
    email: string;

    @Column("text") // doesnt matter - we will be storing hash
    password: string;

    @BeforeInsert() // make functions to be called before new user is inserted
    addId() {
        this.id = uuidv4(); // makes uuid before 
    }

}
