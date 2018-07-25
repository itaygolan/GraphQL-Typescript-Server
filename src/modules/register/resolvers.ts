// Get types from type file generated from gen-schema-types

import * as bcrypt from 'bcryptjs';
import * as yup from 'yup';

import { ResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';
import { GQL } from '../../types/schema';
import { formatYupError } from '../../utils/formatYupError';
import { duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough } from './errorMessages';
import { createConfirmEmail } from '../../utils/createConfirmEmail';
//import { sendEmail } from '../../utils/sendEmails';


// make sure email and password are valid using yup module
const schema = yup.object().shape({
    email: yup
        .string()
        .min(3, emailNotLongEnough)
        .max(255)
        .email(invalidEmail),
        // min of 3 chars, max of 255 and follows email regex using email()
    password: yup
        .string()
        .min(3, passwordNotLongEnough)
        .max(255)
});


export const resolvers: ResolverMap = {
    Query: {
        bye: () => "bye"
    },
    Mutation: {
        register: async (_, args: GQL.IRegisterOnMutationArguments, { redis, url }) => {
            // Logic to register user

            // Validate schema before getting email and password
            // Try catch because validate throws error if it goes wrong
            try {
                await schema.validate(args, { abortEarly: false }); 
                // abortEarly allows all errors to be shown --> 
                // doesn't stop on first one

            } catch (err) {
                return formatYupError(err);
            }

            const { email, password } = args;

            // Check if user already exists
            const userAlreadyExists = await User.findOne({ 
                where: { email },
                select: ["id"],
            })
            if (userAlreadyExists) { // throw error
                return [
                    {
                        path: "email", // what field is wrong
                        message: duplicateEmail // message to explain what is wrong
                    }
                ];
            }
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = User.create({
                email,
                password: hashedPassword,
            })
            await user.save(); // must save user to database -- returns a promise so must await 


            await createConfirmEmail(url, user.id, redis)
            // // Send email
            // if (process.env.NODE_ENV !== 'test') {
            //     await sendEmail("a3794629@nwytg.net", await createConfirmEmail(url, user.id, redis));
            // }
            
           return null;
        }
    }
}   