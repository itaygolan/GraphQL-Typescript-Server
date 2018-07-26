import { request } from 'graphql-request';
import { User } from '../../entity/User';
import { invalidLogin, confirmEmailError } from './errorMessages';
import { createTypeormConn } from '../../utils/createTypeormConn';


const email = `bob@gmail.com`;
const password = `hello`;

const registerMutation = (e: string, p: string) => `
    mutation {
        register(email: "${e}", password: "${p}") {
            path
            message
        }
    }
`;

const loginMutation = (e: string, p: string) => `
    mutation {
        login(email: "${e}", password: "${p}") {
            path
            message
        }
    }
`;

beforeAll(async () => {
    await createTypeormConn();
});

const loginExpectError = async (e: string, p: string, errMsg: string) => {
    
    const response = await request(
        process.env.TEST_HOST as string, 
        loginMutation(e, p)
    );

    expect(response).toEqual({
        login: [
            {
                path: "email",
                message: errMsg
            }
        ]
    }) 
}

describe("login tests", () => {

    test("email not found", async () => {
        // Register a user
        // Try logging in

        await loginExpectError("bob@yahoo.net", "hello", invalidLogin);
    
    });

    test("email not confirmed", async () => {
        await request(
            process.env.TEST_HOST as string, 
            registerMutation(email, password)
        );

        await loginExpectError(email, password, confirmEmailError);

        await User.update({ email }, { confirmed: true });

        await loginExpectError(email, "asdasd", invalidLogin);

        const response = await request(
            process.env.TEST_HOST as string, 
            loginMutation(email, password)
        );

        expect(response).toEqual({
            login: null
        })
    })

});