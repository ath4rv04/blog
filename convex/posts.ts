//functions run on the backend... automatically available as APIs
//accessed through client libraries. Written in TS

//Queries to get data. Mutations to write data

import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";
import { Doc } from "./_generated/dataModel";
import { title } from "process";

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

interface searchResultTypes {
  _id: string,
  title: string,
  body: string,
}

export const searchPosts = query({
  args: {
    term: v.string(),
    limit: v.number(),
  },
  handler:async (ctx, args) => {
    const limit = args.limit;

    const results : Array<searchResultTypes> = [];

    const seen = new Set(); //to prevent duplicates

    const pushDocs = async (docs: Array<Doc<"posts">>) => {
      for(const doc of docs) {
        if(seen.has(doc._id)) continue;

        seen.add(doc._id);

        results.push({
          _id: doc._id,
          title: doc.title,
          body: doc.body,
        });

        if (results.length >= limit) break;
      }
    };

    const titleMatches = await ctx.db.query("posts").withSearchIndex("search_body", (q) => q.search("body", args.term)).take(limit);

    await pushDocs(titleMatches);

    if(results.length < limit) {
      const bodyMatches = await ctx.db.query("posts").withSearchIndex("search_title", (q) => q.search("title" ,args.term)).take(limit);

      await pushDocs(bodyMatches);
    }

    return results;
  },
});

//the above code is a query function and this function performs a full text search on the posts table
//term is what the user types
//limit is the max no of results
//we get the limit form args, res array will store all results having an id, body and title
//seen is there to track doc ids and prevents duplication

//pushDoc is a helper function which adds in the result