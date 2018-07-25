import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from "graphql-import";
import * as path from 'path';
import * as fs from 'fs';
import {mergeSchemas, makeExecutableSchema} from 'graphql-tools';
import { GraphQLSchema } from 'graphql';
import * as Redis from 'ioredis';

import { createTypeormConn } from "./utils/createTypeormConn";
import { User } from './entity/User';

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

  const redis = new Redis();
  
  // merge schemas all together and pass to GraphQlServer
  const server = new GraphQLServer({ 
    schema : mergeSchemas({ schemas }),
    context: ({ request }) => ({ 
      redis,
      url: `${request.protocol}://${request.get("host")}`
    })
  });

  // REST endpoint for email confirmation link
  // Once user clicks on confirmation link
  server.express.get("/confirm/:id", async (req, res) => {
    // Get id key from url
    const { id } = req.params;
    const userId = await redis.get(id); // key value pair to get userId
    if (userId) {
      await User.update({ id: userId}, { confirmed: true } );
      res.send("ok");
    } else {
      res.send("invalid");
    }

  })
  
  await createTypeormConn();
  const app = await server.start({ 
    port: process.env.NODE_ENV === 'test' ? 0 : 4000 
  });
  console.log('Server is running on localhost:4000');

  return app;
}