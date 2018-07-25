import {mergeSchemas, makeExecutableSchema} from 'graphql-tools';
import { GraphQLSchema } from 'graphql';
import { importSchema } from "graphql-import";
import * as path from 'path';
import * as fs from 'fs';


export const genSchema = () => {
    let schemas : GraphQLSchema[] = [];
    const folders = fs.readdirSync(path.join(__dirname, "../modules"));
    folders.forEach(folder => {
      const { resolvers } = require(`../modules/${folder}/resolvers`);
      const typeDefs = importSchema(
        path.join(__dirname, `../modules/${folder}/schema.graphql`)
      );
  
      // Make a schema for each folder in module and store the schema for each folder
      // in the schema array
      schemas.push(
        makeExecutableSchema({ resolvers, typeDefs })
      );
    })

      // merge schemas all together
    return mergeSchemas({ schemas });
}