"use client"

import { createBlog } from "@/app/actions";
import { blogSchema } from "@/app/schemas/blog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export default function createRoute() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();;
    const mutation = useMutation(api.posts.createPost); //mutation runs in order
    const form = useForm({
            resolver: zodResolver(blogSchema),
            defaultValues: {
                title:"",
                content:"",
            },
        });

    function onSubmit(values: z.infer<typeof blogSchema>) {
        startTransition( async () => {
            // mutation({
            //     body: values.content,
            //     title: values.title,
            // });
        

        console.log("This runs on client side");

        await createBlog(); //server action - this will run on the server side

        toast.success("Post created successfully");
        router.push("/");
        })
    }

    return (
        <div className="py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl" >Create Post</h1>
                <p className="text-xl text-muted-foreground pt-4">Share your thoughts here</p>
            </div>

            <Card className="w-full max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Create Blog Article</CardTitle>
                    <CardDescription>Create a new blog article</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup className="gap-y-4">
                            <Controller name ="title" control={form.control} render = {({field, fieldState}) => (
                            <Field>
                                <FieldLabel>Enter Title</FieldLabel>
                                <Input aria-invalid = {fieldState.invalid} placeholder="" {...field} />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )} />
                        <Controller name ="content" control={form.control} render = {({field, fieldState}) => (
                            <Field>
                                <FieldLabel>Type your content</FieldLabel>
                                <Textarea aria-invalid = {fieldState.invalid} placeholder="" {...field} />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )} />
                        <Button disabled = {isPending}>{isPending ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                <span>Creating Post...</span>
                            </>
                        ) : (
                            <span>Create Post</span>
                        )}</Button>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}