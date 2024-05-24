import * as React from "react";

import { cn } from "@/lib/utils";
import { RouterInputs, clientUtils, trpc } from "@/utils/trpc";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input, Input as SigInInput } from "../ui/input";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type SigInInput = RouterInputs["user"]["signIn"];

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const form = useForm<SigInInput>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signIn = trpc.user.signIn.useMutation({
    onSuccess: (data) => {
      clientUtils.user.getMe.setData(undefined, data);
    },
    onError: (error) => {
      const zodError = error.data?.zodError;
      if (zodError) {
        Object.keys(zodError.fieldErrors).forEach((key) => {
          const message = zodError.fieldErrors[key]?.[0];
          form.setError(key as any, { message });
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            signIn.mutate(data);
          })}
        >
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              disabled={signIn.isPending}
              render={({ field }) => (
                <FormItem>
                  <div className="grid gap-1">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              disabled={signIn.isPending}
              render={({ field }) => (
                <FormItem>
                  <div className="grid gap-1">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="********"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={signIn.isPending}>
              {signIn.isPending && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
