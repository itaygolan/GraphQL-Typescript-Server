// take url: http://localhost:4000 
// => https://localhost:4000/confirm/<id>

import { v4 } from "uuid";
import { Redis } from "ioredis";

export const createConfirmEmail = async (
    url : string, 
    userId : string, 
    redis: Redis
)  => {
    const id = v4();
    // set redis key value pair with redis id and userId so we know who we are updating
    // whenever we fetch with redis.get we get user.id back because of key-value pair
    await redis.set(id, userId, "ex", 60*60*24); // expires in 24 hours
    // return the confirmation link email
    return `${url}/confirm/${id}`;
}