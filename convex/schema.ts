import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    posts: defineTable({
        title: v.string(),
        body: v.string(),
        authId: v.string(),
        imageStorageId: v.optional(v.id("_storage")),
    }),
});