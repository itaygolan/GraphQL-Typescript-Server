import { Request, Response } from 'express';
import { User } from '../entity/User';
import { redis } from '../redis';

export const confirmEmail = async (req: Request, res: Response) => {
    // Get id key from url
    const { id } = req.params;
    const userId = await redis.get(id); // key value pair to get userId
    if (userId) {
      await User.update({ id: userId}, { confirmed: true } );
      await redis.del(id);
      res.send("ok");
    } else {
      res.send("invalid");
    }
}