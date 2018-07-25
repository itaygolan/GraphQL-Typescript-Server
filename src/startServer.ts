import { GraphQLServer } from 'graphql-yoga';

import { createTypeormConn } from "./utils/createTypeormConn";
import { redis } from './redis';
import { confirmEmail } from './routes/confirmEmail';
import { genSchema } from './utils/generateSchema';

export const startServer = async () => {
   
  const server = new GraphQLServer({ 
    schema : genSchema(),
    context: ({ request }) => ({ 
      redis,
      url: `${request.protocol}://${request.get("host")}`
    })
  });

  // REST endpoint for email confirmation link
  // Once user clicks on confirmation link
  server.express.get("/confirm/:id", confirmEmail);
  
  await createTypeormConn();
  const app = await server.start({ 
    port: process.env.NODE_ENV === 'test' ? 0 : 4000 
  });
  console.log('Server is running on localhost:4000');

  return app;
}