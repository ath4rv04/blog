import { useQuery } from "convex/react"; //client side component
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { fetchQuery } from "convex/nextjs";
import { resolve } from "path";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function blog() {
    
    return(
        <div className="py-12">
            <div className="text-center pb-12">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Our Blog</h1>
                <p className="pt-4 max-w-2xl mx-auto text-xl text-muted-foreground">Insights, thoughts, and trends from our team.</p>
            </div>
            <Suspense fallback={
                <SkeletonLoading/>
            }>
                <LoadBlog />
            </Suspense>
        </div>
    ); // data is being fetched on the client side thats why we dont see it in the first time
}

async function LoadBlog() {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const data = await fetchQuery(api.posts.getPost);

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data?.map((posts) => (
                    <Card key = {posts._id} className="pt-0">
                        <div className="relative h-48 w-full overflow-hidden">
                            <Image
                            src={posts.imageUrl ?? "https://images.unsplash.com/photo-1770106678115-ec9aa241cdf6?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1770106678115-ec9aa241cdf6?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} alt="image" 
                            fill 
                            
                            className="rounded-t-lg object-cover"/>
                        </div>

                        <CardContent>
                            <Link href={'/blog/${post._id}'}>
                                <h1 className="text-2xl font-bold hover:text-primary">{posts.body}</h1>
                            </Link>
                            <p className="text-muted-foreground line-clamp-3">{posts.title}</p>
                        </CardContent>

                        <CardFooter>
                            <Link className={buttonVariants({
                                className: 'w-full',
                            })} href={'/blog/${post._id}'}>
                                Read More
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
    )
}

function SkeletonLoading() {
    return (
        <div className="grid gap-6 md: grid-cols-3 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex flex-col space-y-3">
                            <Skeleton className="h-48 w-full rounded-xl"/>
                            <div className="space-y-2 flex flex-col">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                    ))
                    }
                </div>
    )
}


//image optimises on the server side. This takes resources
//initial html is rendered on the server side.
//when you make a req the client component is pre render on the server side.
//After the html is fully loaded it downloads the js and executes it.
 
//new learning

//client makes a request, Nextjs server makes the req to convex (baas), 
//convex executes the correct function and return back to 
//next js and generates the hmtl which is sent to the client

//we use fetchQuery to make it a server component. There is no hydration or js
//when we use fetchQuery() there is no client involved anymore so there is no way to make connection. Its a limitation
//You can fetch data on the server side but you dont get any updates and the reactive benefits of convex
//the blog page doesnt need any reactivity tho

//convex provide preloading to retain reactivity use preloadQuery()