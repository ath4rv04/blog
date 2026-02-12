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
import type { Metadata } from 'next'
import { connection } from "next/server";
import { cacheLife, cacheTag } from "next/cache";

// export const dynamic = 'force-static' //static rendering

// export const revalidate = 30; //revalidating time

//^^ this wont work with cached components
 
export const metadata: Metadata = {
  title: "Blog",
  description: "Essays and technical notes from Stackframe.",
  category: "technology",
  authors: [{ name: "Stackframe" }],
}; //static metadata

export default function blog() {
    
    return(
        <div className="py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">

            <div className="text-center pb-12">
                <h1 className="text-3xl font-semibold tracking-tight">Writing</h1>
                <p className="text-muted-foreground">
                    Essays, notes, and structured thoughts on development.
                </p>

            </div>
            {/* <Suspense fallback={
                <SkeletonLoading/>
            }> */}
                <LoadBlog />
            {/* </Suspense> */}
            </div>
        </div>
    ); // data is being fetched on the client side thats why we dont see it in the first time
}

async function LoadBlog() {
  "use cache";
  cacheLife("hours");
  cacheTag("blog");

  const data = await fetchQuery(api.posts.getPost);

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-lg font-medium">
          No articles published yet.
        </p>
        <p className="text-sm text-muted-foreground">
          Be the first to share a structured thought.
        </p>
        <Link
          href="/create"
          className="inline-flex items-center text-sm font-medium text-primary"
        >
          Write your first article →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {data?.map((post) => (
        <article key={post._id} className="group space-y-4">
          
          {post.imageUrl && (
            <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-border">
              <Image
                src={post.imageUrl}
                alt={post.body}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          )}

          <div className="space-y-2 max-w-2xl">
            <Link href={`/blog/${post._id}`}>
              <h2 className="text-2xl font-medium tracking-tight group-hover:text-primary transition-colors">
                {post.body}
              </h2>
            </Link>

            <p className="text-muted-foreground line-clamp-3 leading-relaxed">
              {post.title}
            </p>

            <Link
              href={`/blog/${post._id}`}
              className="text-sm text-primary"
            >
              Read article →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
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

//Caching

//Static rendering => a cdn serves the client.
//Hosting builds the app => next js checks what routes are dynamic and what are static.
//For static rendering the html is generated at the build time and send to the cdn. cached

//The user is served by the cdn which is gloablly distrubted and is super fast.

//dynamic route => html is generated at the runtime not the build time.
//if we use dynamic rendering you always get fresh data. 
//Static rendering -> data is stale not fresh. data at its core is not revalidated


//Route (app)
// ┌ ○ /
// ├ ○ /_not-found
// ├ ƒ /api/auth/[...all]
// ├ ƒ /api/create-blog
// ├ ○ /auth/login
// ├ ○ /auth/sign-up
// ├ ƒ /blog
// └ ○ /create


// ○  (Static)   prerendered as static content
// ƒ  (Dynamic)  server-rendered on demand