//functions run on the backend... automatically available as APIs
//accessed through client libraries. Written in TS

//Queries to get data. Mutations to write data

import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";

//server functions

export const createPost = mutation({
  args: { title: v.string(), body: v.string(), imageStorageId: v.id("_storage")},  //validation is also done here
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if(!user) {
        throw new ConvexError("Not Authenticated");
    }

    const blogArticle = await ctx.db.insert("posts", { 
        body: args.body,
        title: args.title,
        authId: user._id, //id is authomatically assigned in convex
        imageStorageId: args.imageStorageId,
    });
    return blogArticle;
  },
});

export const getPost = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").collect(); 

    return await Promise.all (
      posts.map(async (post) => {
        const resolvedImageUrl = post.imageStorageId !== undefined ? await ctx.storage.getUrl(post.imageStorageId) : null;

        return {
          ...post,
          imageUrl : resolvedImageUrl,
        }
      })
    )
  },
});

export const generateImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if(!user) {
        throw new ConvexError("Not Authenticated");
    }

    return await ctx.storage.generateUploadUrl(); //there is nothing to pass
  }
});

export const getPostById = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if(!post) {
      return null;
    }

    const resolvedImageUrl = post?.imageStorageId !== undefined ? await ctx.storage.getUrl(post.imageStorageId) : null;
    
    return {
      ...post,
      imageUrl: resolvedImageUrl,
    };
  },
});