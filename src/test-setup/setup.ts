// setup to configure jest globally
// This function will run before every test, so you don't need to use 
// beforeAll in every test file


import { startServer } from '../startServer';

export const setup = async () => {
    const app = await startServer();
    const { port } : any = app.address();
    // make environment variable so can be accessed globally 
    process.env.TEST_HOST = `http://127.0.0.1:${port}`;
};