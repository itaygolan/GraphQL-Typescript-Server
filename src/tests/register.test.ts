// .test is for jest so it knows this file is a test

import { request } from 'graphql-request';
import { host } from './constants';
import { User } from '../entity/User';
import { startServer } from '../startServer';

let getHost = () => '';

beforeAll(async () => {
    const app = await startServer();
    const { port } = app.address();
    getHost = () => `http://127.0.0.1:${port}`;
})

const email = `bobbb@gmail.com`;
const password = `hello`;

const mutation = `
    mutation {
        register(email: "${email}", password: "${password}")
    }
`;

test("Register user", async () => {
    // using graphql-request library to make a request to graph ql server
    const response = await request(getHost(), mutation); // request returns a promise
    expect(response).toEqual({ register: true })

    // test if user was added to DB
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password); // because we hased the password
})