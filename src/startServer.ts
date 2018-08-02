import { GraphQLServer } from 'graphql-yoga';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import "dotenv/config";

import { createTypeormConn } from "./utils/createTypeormConn";
import { redis } from './redis';
import { confirmEmail } from './routes/confirmEmail';
import { genSchema } from './utils/generateSchema';

const RedisStore = connectRedis(session);

export const startServer = async () => {
   
  const server = new GraphQLServer({ 
    schema : genSchema(),
    context: ({ request }) => ({ 
      redis,
      url: `${request.protocol}://${request.get("host")}`,
      session: request.session // req now has a session to it
    })
  });

  // add express-server middleware
  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any
      }),
      name: "qid",
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  );
  // server.express.use(
  //   // session options
  //   session({
  //     store: new RedisStore({
  //       client: redis as any
  //     }),
  //     name: "qid",
  //     secret: 'secret',
  //     resave: false,
  //     saveUninitialized: false, // dont store cookie unless data on user needs to be added
  //     cookie: { // cookie settings
  //       httpOnly: true, // JS cannot access cookie --> security
  //       secure: process.env.NODE_ENV === "production",
  //       maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  //     }
  //   })
  // );

  // send a cookie back
  const cors = {
    credentials: true,
    origin: process.env.NODE_ENV === "test" 
      ? '*' 
      : process.env.FRONTEND_HOST as string // front end server host
  }

  // REST endpoint for email confirmation link
  // Once user clicks on confirmation link
  server.express.get("/confirm/:id", confirmEmail);
  
  await createTypeormConn();
  const app = await server.start({
    cors, 
    port: process.env.NODE_ENV === 'test' ? 0 : 4000 
  });
  console.log('Server is running on localhost:4000');

  return app;
}