"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import Image from "next/image";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { signUp } from "@/server/users";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "STAFF"]),
});

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "STAFF",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const { success, message } = await signUp(
      values.email,
      values.password,
      values.username,
      values.role
    );

    if (success) {
      toast.success(message as string);
      router.push("/dashboard");
    } else {
      toast.error(message as string);
    }

    setIsLoading(false);
  }

  return (
    <div className={cn("flex flex-col gap-5", className)} {...props}>
      <div className="mb-1 flex select-none items-center justify-center gap-2">
        <Image
          alt="MediBilldo Logo"
          className="size-7 rounded-md object-contain"
          height={28}
          src="/icon.png"
          width={28}
        />
        <span className="font-extrabold text-md text-zinc-950 tracking-tight">
          medibilldo
        </span>
      </div>

      {/* Header text */}
      <div className="text-center">
        <h1 className="font-extrabold text-2xl text-zinc-950 tracking-tight">
          Create Account
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Sign up to access medibilldo workspace
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="font-medium text-xs text-zinc-700">
                  Username
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      className="rounded-lg border-zinc-200 bg-zinc-50/50 pl-9 text-sm focus:border-black"
                      placeholder="username"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="font-medium text-xs text-zinc-700">
                  Email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      className="rounded-lg border-zinc-200 bg-zinc-50/50 pl-9 text-sm focus:border-black"
                      placeholder="m@example.com"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="font-medium text-xs text-zinc-700">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      className="rounded-lg border-zinc-200 bg-zinc-50/50 pr-10 pl-9 text-sm focus:border-black"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="font-medium text-xs text-zinc-700">
                  Role
                </FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-lg border-zinc-200 bg-zinc-50/50 text-sm focus:border-black">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-zinc-200 bg-white">
                    <SelectItem value="SUPER_ADMIN">
                      SUPER_ADMIN (Platform Owner)
                    </SelectItem>
                    <SelectItem value="ADMIN">ADMIN (Store Owner)</SelectItem>
                    <SelectItem value="STAFF">
                      STAFF (Cashier/Pharmacist)
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                <span>Sign up</span>
                <ArrowRight className="size-4 shrink-0" />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Bottom link */}
      <div className="mt-2 text-center text-xs text-zinc-500">
        Already have an account?{" "}
        <Link
          className="font-extrabold text-zinc-950 underline underline-offset-4"
          href="/login"
        >
          Login
        </Link>
      </div>

      {/* Legal terms footer */}
      <div className="mt-1 px-4 text-center text-[10px] text-zinc-400 leading-relaxed">
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
