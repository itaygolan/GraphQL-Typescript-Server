// globalSetup jest needs a js file => call setup.ts

require('ts-node/register');

const { setup }  = require('./setup');

module.exports = async () => {
    await setup();
    return null;
}