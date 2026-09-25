"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { signIn } from "@/server/users";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const res = await signIn(values.email, values.password);

    if (res.success) {
      toast.success(res.message as string);
      if (res.user?.role === "SUPER_ADMIN") {
        router.push("/super-admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      toast.error(res.message as string);
    }

    setIsLoading(false);
  }

  const handleGoogleSignIn = () => {
    toast.error(
      "Google Sign-In is not configured. Please use your email & password."
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Brand header */}
      <div className="mb-1 flex select-none items-center justify-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-black font-extrabold text-white text-xs tracking-tighter shadow-sm">
          mb
        </div>
        <span className="font-extrabold text-md text-zinc-950 tracking-tight">
          medibilldo
        </span>
      </div>

      {/* Header text */}
      <div className="text-center">
        <h1 className="font-extrabold text-2xl text-zinc-950 tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Login with your email and password
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="font-medium text-xs text-zinc-700">
                  Email
                </FormLabel>
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                  <FormControl>
                    <Input
                      className="rounded-lg border-zinc-200 bg-zinc-50/50 pl-9 text-sm focus:border-black"
                      placeholder="m@example.com"
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
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FormLabel className="font-medium text-xs text-zinc-700">
                    Password
                  </FormLabel>
                  <Link
                    className="font-semibold text-[11px] text-zinc-950 hover:underline"
                    href="/forgot-password"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                  <FormControl>
                    <Input
                      className="rounded-lg border-zinc-200 bg-zinc-50/50 pr-10 pl-9 text-sm focus:border-black"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
                  </FormControl>
                  <button
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-900"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="mt-6 flex w-full items-center justify-between rounded-lg bg-zinc-950 px-4 py-6 font-bold text-sm text-white transition-all hover:bg-zinc-900"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <span className="flex w-full items-center justify-center">
                <Loader2 className="size-4 animate-spin" />
              </span>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="size-4 shrink-0" />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* OR divider */}
      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-zinc-200 border-t" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-white px-3 font-bold text-zinc-400 tracking-wider">
            OR
          </span>
        </div>
      </div>

      {/* Social login */}
      <Button
        className="flex w-full items-center justify-center gap-2 rounded-lg border-zinc-200 py-5 font-semibold text-sm transition-all hover:bg-zinc-50"
        onClick={handleGoogleSignIn}
        variant="outline"
      >
        <svg className="mr-1 size-4 shrink-0" fill="none" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
        <span>Continue with Google</span>
      </Button>

      {/* Legal terms footer */}
      <div className="px-4 text-center text-[10px] text-zinc-400 leading-relaxed">
        By clicking continue, you agree to our{" "}
        <Link
          className="underline transition-colors hover:text-zinc-600"
          href="#"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          className="underline transition-colors hover:text-zinc-600"
          href="#"
        >
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
