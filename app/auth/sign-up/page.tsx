"use client"

import { signUpSchema } from "@/app/schemas/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

export default function signUpPage() {
    const form = useForm({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            name: "",
            password: "",
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Create an account to get started</CardDescription>
            </CardHeader>
            <CardContent>
                <form>
                    <Field>
                        <Controller name ="name" control={form.control} render = {({field, fieldState}) => (
                            <Field>
                                <FieldLabel>Full Name</FieldLabel>
                                <Input placeholder="John Doe" {...field} />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )} />
                    </Field>
                </form>
            </CardContent>
        </Card>
    )
}