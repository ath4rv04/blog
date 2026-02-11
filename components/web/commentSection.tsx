"use client"

import { Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { signUpSchema } from "@/app/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CommentSchema } from "@/app/schemas/comment";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import z from "zod";
import { toast } from "sonner";
import { useTransition } from "react";

export function CommentSection() {
    const [isPending, startTransition] = useTransition()
    const params = useParams<{postId: Id<"posts">}>() //a client component that lets you read a route's dyanmic params filled in by the current url

    const createComment = useMutation(api.comments.createComment);

    const form = useForm({
        resolver: zodResolver(CommentSchema),
        defaultValues: {
            body: "",
            postId: params.postId,
        },
    });

    async function onSubmit (data: z.infer<typeof CommentSchema>) {
        startTransition(async() => {
            try {
                await createComment(data);
                form.reset();
                toast.success("Comment Posted");

            } catch {
                toast.error("Failed to post");

            }
        });
    }
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 border=b">
                <MessageSquare className="size-5"/>
                <h2 className="text-xl font-bold">5 comments</h2>
            </CardHeader>

            <CardContent>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <Controller
                        name ="body"
                        control={form.control}
                        render = {({field, fieldState}) => (
                            <Field>
                                <FieldLabel>Enter your comment here</FieldLabel>
                                <Textarea
                                    aria-invalid = {fieldState.invalid}
                                    placeholder="Share your thoughts"
                                    {...field} />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )} />

                        <Button disabled = {isPending}>{isPending ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                <span>Loading...</span>
                            </>
                        ) : (
                            <span>Submit</span>
                        )}</Button>
                </form>
            </CardContent>
        </Card>
    )
}