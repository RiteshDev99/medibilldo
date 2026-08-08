"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
  role: z.enum(["ADMIN", "STAFF"]),
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
      <div className="flex items-center gap-2 justify-center mb-1 select-none">
        <Image
          src="/icon.png"
          width={28}
          height={28}
          alt="MediBilldo Logo"
          className="size-7 object-contain rounded-md"
        />
        <span className="font-extrabold text-md tracking-tight text-zinc-950">medibilldo</span>
      </div>

      {/* Header text */}
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Create Account</h1>
        <p className="text-xs text-zinc-500 mt-1">Sign up to access medibilldo workspace</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-zinc-700 font-medium text-xs">Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                    <Input
                      placeholder="username"
                      className="pl-9 bg-zinc-50/50 border-zinc-200 focus:border-black rounded-lg text-sm"
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
                <FormLabel className="text-zinc-700 font-medium text-xs">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                    <Input
                      placeholder="m@example.com"
                      className="pl-9 bg-zinc-50/50 border-zinc-200 focus:border-black rounded-lg text-sm"
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
                <FormLabel className="text-zinc-700 font-medium text-xs">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                    <Input
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      className="pl-9 pr-10 bg-zinc-50/50 border-zinc-200 focus:border-black rounded-lg text-sm"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
                <FormLabel className="text-zinc-700 font-medium text-xs">Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-50/50 border-zinc-200 focus:border-black rounded-lg text-sm">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-zinc-200">
                    <SelectItem value="ADMIN">ADMIN (Store Owner)</SelectItem>
                    <SelectItem value="STAFF">STAFF (Cashier/Pharmacist)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold py-6 rounded-lg text-sm flex items-center justify-between px-4 transition-all mt-6"
          >
            {isLoading ? (
              <span className="flex items-center justify-center w-full">
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
      <div className="text-center text-xs text-zinc-500 mt-2">
        Already have an account?{" "}
        <Link className="font-extrabold text-zinc-950 underline underline-offset-4" href="/login">
          Login
        </Link>
      </div>

      {/* Legal terms footer */}
      <div className="text-center text-[10px] leading-relaxed text-zinc-400 px-4 mt-1">
        By clicking continue, you agree to our{" "}
        <Link href="#" className="underline hover:text-zinc-600 transition-colors">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline hover:text-zinc-600 transition-colors">
          Privacy Policy
        </Link>.
      </div>
    </div>
  );
}
