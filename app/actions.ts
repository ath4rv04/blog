"use server"

import z from "zod";
import { blogSchema } from "./schemas/blog";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth-server";
import { error } from "console";
import { revalidatePath, updateTag } from "next/cache";

//useMutation works only on client side env.
//use fetchMutation, fetchQuery and fetchAction
//whenever you are in a server component use redirect

//create only mutation logic from here. It creates an internal post request
//it is a public endpoint. Treat it like an API route. Auth the user. Data is validated
export async function createBlog(values: z.infer<typeof blogSchema>) {
    try {
        const parsed = blogSchema.safeParse(values);


        if(!parsed.success) {
            throw new Error("something went wrong");
        }

        const token = await getToken(); //JWT token

        const imageUrl = await fetchMutation(
            api.posts.generateImageUploadUrl,
            {},
            {token}
        );

        const uploadRes = await fetch(imageUrl, {
            method: "POST",
            body: parsed.data.image,
            headers: {
                "Content-Type" : parsed.data.image.type,
            }
        })

        if(!uploadRes.ok) {
            return {
                error: "Failed to upload image",
            };
        }

        const {storageId} = await uploadRes.json();
        await fetchMutation(
            api.posts.createPost,
            {
                body: parsed.data.title,
                title: parsed.data.content,
                imageStorageId: storageId,
            }
        , { token });

    } catch {
        return {
                error: "Failed to create post",
        };
    }

    revalidatePath("/blog"); //allows you to purge cached data on demand. Can be used when cached components are not used
    // updateTag("blog");
    return redirect("/blog"); //never use it in the try statement or else there will be an internal server error
}

//we have to provide the token itself here
//this is for internal matter only