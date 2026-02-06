//functions run on the backend... automatically available as APIs
//accessed through client libraries. Written in TS

//Queries to get data. Mutations to write data

import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";

// Create a new post with the given text
export const createPost = mutation({
  args: { title: v.string(), body: v.string()},  //validation is also done here
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if(!user) {
        throw new ConvexError("Not Authenticated");
    }

    const blogArticle = await ctx.db.insert("posts", { 
        body: args.body,
        title: args.title,
        authId: user._id, //id is authomatically assigned in convex
    });
    return blogArticle;
  },
});