import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from "graphql-import";
import * as path from 'path';
import * as fs from 'fs';
import {mergeSchemas, makeExecutableSchema} from 'graphql-tools';
import { GraphQLSchema } from 'graphql';

import { createTypeormConn } from "./utils/createTypeormConn";

export const startServer = async () => {
  
  // Loop through modules folder to get resolvers and schema
  let schemas : GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, "./modules"));
  folders.forEach(folder => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `./modules/${folder}/schema.graphql`)
    );

    // Make a schema for each folder in module and store the schema for each folder
    // in the schema array
    schemas.push(
      makeExecutableSchema({ resolvers, typeDefs })
    );
  })
  
  // merge schemas all together and pass to GraphQlServer
  const server = new GraphQLServer({ schema : mergeSchemas({ schemas }) });
  await createTypeormConn();
  const app = await server.start({ 
    port: process.env.NODE_ENV === 'test' ? 0 : 4000 
  });
  console.log('Server is running on localhost:4000');

  return app;
}