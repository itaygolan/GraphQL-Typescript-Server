// .test is for jest so it knows this file is a test

import { request } from 'graphql-request';
import { User } from '../../entity/User';
import { duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough } from './errorMessages';
import { createTypeormConn } from '../../utils/createTypeormConn';

const email = `bob@gmail.com`;
const password = `hello`;

const mutation = (e: string, p: string) => `
    mutation {
        register(email: "${e}", password: "${p}") {
            path
            message
        }
    }
`;

beforeAll(async () => {
    await createTypeormConn();
})

describe("Register user", async () => {
    test("check duplicate emails", async () => {
        // using graphql-request library to make a request to graph ql server
        const response = await request(
            process.env.TEST_HOST as string, 
            mutation(email, password)
        ); // request returns a promise
        expect(response).toEqual({ register: null })

        // test if user was added to DB
        const users = await User.find({ where: { email } });
        expect(users).toHaveLength(1);
        const user = users[0];
        expect(user.email).toEqual(email);
        expect(user.password).not.toEqual(password); // because we hased the password

        // test for duplicate email
        const response2: any = await request(
            process.env.TEST_HOST as string, 
            mutation(email, password)
        );
        expect(response2.register).toHaveLength(1)
        expect(response2.register[0].path).toEqual("email");
        expect(response2.register[0].message).toEqual(duplicateEmail);
    });
    
    test("check bad email", async () => {
        // Catch bad/invalid email with valid password
        const response3: any = await request(
            process.env.TEST_HOST as string, 
            mutation("bo", password)
        );
        expect(response3).toEqual({
            register: [
                {
                    "message": emailNotLongEnough, 
                    "path": "email"
                }, 
                {
                    "message": invalidEmail,
                    "path": "email"
                }
            ]
        });  
    });

    test("check bad password", async () => {
        // Catch bad/invalid password with valid email
        const response4: any = await request(
            process.env.TEST_HOST as string, 
            mutation(email, "bo")
        );
        expect(response4).toEqual({
            register: [
                {
                    "message": passwordNotLongEnough,
                    "path": "password"
                }
            ]
        })
    });

    test("check bad password and bad email", async () => {
        // Catch bad/invalid password with bad/invalid email
        const response5: any = await request(
            process.env.TEST_HOST as string, 
            mutation("b", "bo")
        );
        expect(response5).toEqual({
            register: [
                {
                    "message": emailNotLongEnough, 
                    "path": "email"
                }, 
                {
                    "message": invalidEmail,
                    "path": "email"
                },
                {
                    "message": passwordNotLongEnough,
                    "path": "password"
                }
            ]
        })
    });
})