import * as bcrypt from "bcryptjs";

import { ResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';
import { GQL } from '../../types/schema';
import { invalidLogin, confirmEmailError } from './errorMessages';

// generic message for security --> message doesnt tell 
// hacker whats wrong with login 
// (ie. password, email, no user)
const errorResponse = [
    {
        path: "email",
        message: invalidLogin,
    }
    
];


export const resolvers: ResolverMap = {
    Query: {
        bye2: () => "bye"
    },
    Mutation: {
        login: async (
            _, 
            { email, password }: GQL.ILoginOnMutationArguments,
            { session } // from context
        ) => {       
           
           const user = await User.findOne({ where: { email } });   
           if (!user) {
              return errorResponse;
           }

           // Make sure user has confirmed their email --> give them a message
           if (!user.confirmed) {
               return [
                   {
                       path: "email",
                       message: confirmEmailError
                   }
               ]
           }

           // bcrypt has function to compare hashed password w pre-hashed password
           const valid = await bcrypt.compare(password, user.password);
           // valid returns true or false promise, so if true, user exists
           if (!valid) {
            return errorResponse;
           }

           // login successful --> add a cookie
           session.userId = user.id;


           // If both of these checks pass, user exists in database
           return null; // no error
        }
    }
}   