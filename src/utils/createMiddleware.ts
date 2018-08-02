import { Resolver, GraphQLMiddlewareFunc } from "../types/graphql-utils";

// higher order function that takes in middleware function and 
// resolver function

// return regular resolver which then returns regular middleware

// passes arguments into middleware function

export const createMiddleware = (
    middlewareFunc: GraphQLMiddlewareFunc, 
    resolverFunc: Resolver
) => (
  parent: any,
  args: any,
  context: any,
  info: any
) => middlewareFunc(resolverFunc, parent, args, context, info);
