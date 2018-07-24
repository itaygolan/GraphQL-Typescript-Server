// Get types from type file generated from gen-schema-types

import { ResolverMap } from './types/graphql-utils';
import { GQL } from './types/schema';
import * as bcrypt from 'bcryptjs';
import { User } from './entity/User';

export const resolvers: ResolverMap = {
    Query: {
      hello: (_, { name } : GQL.IHelloOnQueryArguments) => `Hello ${name}`,
    },
    Mutation: {
        register: async (_, { email, password } : GQL.IRegisterOnMutationArguments) => {
            // Logic to register user
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = User.create({
                email,
                password: hashedPassword,
            })
            await user.save(); // must save user to database -- returns a promise so must await 
            return true;
        }
    }
}   