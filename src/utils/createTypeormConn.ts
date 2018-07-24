import { createConnection, getConnectionOptions } from "typeorm";


// connect to correct db based on node environment
export const createTypeormConn = async () => {
    // node env changes whether we are testing or running
    const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
    return createConnection({...connectionOptions, name: "default"});
}