import { Resolver } from "../../types/graphql-utils";

// takes resolver as one of the parameters and do stuff before and after

export default async (
    resolver: Resolver, 
    parent : any,
    args : any, 
    context: any, 
    info: any
) => {
    // where we put middleware
    const result = await resolver(parent, args, context, info);
    // afterware

    return result;
}