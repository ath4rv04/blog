import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/web/commentSection";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface postIdRouteProps {
    params: Promise<{
        postId: Id<"posts">;
    }>;
}

export default async function PostIdRoute({params} : postIdRouteProps) {
    const { postId } = await params;

    const post = await fetchQuery(api.posts.getPostById, { postId : postId });
    
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

                <p className="text-sm text-muted-foreground">Posted on: {new Date(post._creationTime).toLocaleDateString("en-US")}</p>
            </div>

            <Separator className="my-8"/>

            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">{post.title}</p>
        
            <Separator className="my-8"/>

            <CommentSection />
        </div>
    );
}