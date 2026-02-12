import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/web/commentSection";
import { PostPresence } from "@/components/web/postPresence";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

interface postIdRouteProps {
    params: Promise<{
        postId: Id<"posts">;
    }>;
}

//dynamic metadata
export async function generateMetadata({ params } : postIdRouteProps) : Promise<Metadata> {
    const { postId } = await params;

    const post = await fetchQuery(api.posts.getPostById, { postId : postId });

    if(!post) {
        return {
            title: "Post not found",
        };
    }

    return {
        title: post.body,
        description: post.title,
    }
} //next js allows you to both create static metadata and dynamic metadata

export default async function PostIdRoute({params} : postIdRouteProps) {
    const { postId } = await params;

    const token = await getToken();

    const [post, preloadedComments, userId] = await Promise.all ([
        await fetchQuery(api.posts.getPostById, { postId : postId }),
        await preloadQuery(api.comments.getCommentsByPostId, {
            postId: postId,
        }),

        await fetchQuery(api.presence.getUserId, {}, { token }),
    ]) //perfomance optimization. they will run in parallel
    
    if(!userId) {
        return redirect("/auth/login"); //multi layer authorization. This never fails. Server side check never fails
    }

    if(!post) {
        return <div><h1 className="text-6xl font-extrabold text-red-500 p-20">No Post</h1></div>
    }
    return (
        <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in
        duration-500 relative">
            <Link className={buttonVariants({variant : "outline", className: "mb-4"})} href="/blog">
                <ArrowLeft className="size-4"/>
                Back to blog
            </Link>

            <div className="relative w-full h-100 shadow-sm mb-8 rounded-xl overflow-hidden">
                <Image
                    src = {post.imageUrl ?? "https://images.unsplash.com/photo-1770106678115-ec9aa241cdf6?q=80&w=1171&auto=format&fit=crop"} 
                    alt={post.body}
                    fill
                    className="object-contain hover:scale-105 transition-transform duration-500"
                />
            </div>

            <div className="sapce-y-4 flex flex-col">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    {post.body}
                </h1>

                <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Posted on: {new Date(post._creationTime).toLocaleDateString("en-US")}</p>
                    {userId && <PostPresence roomId={post._id} userId={userId} />}
                </div>
            </div>

            <Separator className="my-8"/>

            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">{post.title}</p>
        
            <Separator className="my-8"/>

            <CommentSection preloadedComments={preloadedComments}/>
        </div>
    );
}

//here we fetch the data then we pass this in the comment section as a prop which is a client componenet
//it uses the preloaded query hook with args as the preloaded comments but it also subscribes to all new data changes
//it gets the new data instanltly. through this we can enable ssr as well as reactivity

//fetchQuery does not provide reactivity

//convex automatically caches the res of query functions. Everything is consisted => realtime functionality
//all this is provided by the websocket connections
//Convex client libraries keep your frontend synced with the results of your server functions.