import { createConfirmEmail } from "./createConfirmEmail";
import { createTypeormConn } from "./createTypeormConn";
import { User } from "../entity/User";
import * as Redis  from "ioredis";
import fetch from 'node-fetch';

let userId = "";
let redis = new Redis();

beforeAll(async () => {
    await createTypeormConn();
    const user = await User.create({
        email: "bob@gmail.com",
        password: "hello",
    }).save();
    userId = user.id;
})

describe("Redis Link", () => {
    test("Confirms user and clears key in redis", async () => {

        const url = await createConfirmEmail(
            process.env.TEST_HOST as string, // cast to string to satisfy typeScript
            userId as string, 
            redis
        );
    
        // make get request to the url to get "ok" to signal that user was 
        // updated
    
        const response = await fetch(url);
        const text = await response.text();
        expect(text).toEqual("ok");
        
        const user = await User.findOne({ where: {id: userId} });
        expect((user as User).confirmed).toBeTruthy();
    
        const chunks = url.split('/');
        const key = chunks[chunks.length - 1];
        const value = await redis.get(key);
        expect(value).toBeNull();
    
    })
})
