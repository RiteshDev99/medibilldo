"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User as DbUser } from "@/db/schema";
import { createStaff } from "@/server/users";

const staffFormSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional().or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface StaffClientProps {
  initialStaff: DbUser[];
}

export function StaffClient({ initialStaff }: StaffClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof staffFormSchema>>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof staffFormSchema>) => {
    setIsLoading(true);
    try {
      const res = await createStaff(values);
      if (res.success) {
        toast.success("Staff member created successfully.");
        setIsOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create staff member.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 text-zinc-950 md:p-10">
      {/* Title & Headers */}
      <div className="flex flex-col gap-4 border-zinc-200 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
            Personnel
          </span>
          <h1 className="mt-1 font-extrabold text-3xl text-zinc-900 tracking-tight">
            Staff Management
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Manage operator profiles, activity streams, and daily shift
            statistics.
          </p>
        </div>
        <Button
          className="flex items-center gap-1.5 bg-black font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="size-4" />
          Add Staff
        </Button>
      </div>

      {/* Staff Catalog Table */}
      <Card className="border-zinc-200 bg-white shadow-xs">
        <CardHeader className="border-zinc-100 border-b pb-4">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-zinc-500" />
            <CardTitle className="font-extrabold text-sm text-zinc-900">
              Active Operators Directory
            </CardTitle>
          </div>
          <CardDescription>
            List of cashier and pharmacist accounts assigned to this store.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {initialStaff.length === 0 ? (
            <div className="p-12 text-center text-zinc-450">
              <p className="font-semibold text-sm">No staff members found.</p>
              <p className="mt-1 text-xs text-zinc-505">
                Add your first operator to get started.
              </p>
              <Button
                className="mt-4 bg-black text-white"
                onClick={() => setIsOpen(true)}
              >
                + Add Staff
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="border-zinc-150 border-b bg-zinc-50">
                <TableRow>
                  <TableHead className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Name
                  </TableHead>
                  <TableHead className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Email
                  </TableHead>
                  <TableHead className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Role
                  </TableHead>
                  <TableHead className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Joined Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialStaff.map((item) => (
                  <TableRow
                    className="border-zinc-150 border-b hover:bg-zinc-50/20"
                    key={item.id}
                  >
                    <TableCell className="font-bold text-sm text-zinc-900">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-700">
                      {item.email}
                    </TableCell>
                    <TableCell>
                      <span className="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-bold text-[9px] text-zinc-800 uppercase tracking-wider">
                        {item.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogContent className="max-w-md border-zinc-200 bg-white">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-lg text-zinc-950">
              Add Staff Operator
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-550">
              Create a new operator account for your pharmacy. Specify their
              login password directly.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              className="space-y-4 pt-2"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs text-zinc-700">
                      Full Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-zinc-200 focus:border-black"
                        placeholder="e.g. Amit Kumar"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs text-zinc-700">
                      Email *
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-zinc-200 focus:border-black"
                        placeholder="e.g. amit@example.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs text-zinc-700">
                      Phone
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-zinc-200 focus:border-black"
                        placeholder="e.g. 9876543210"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs text-zinc-700">
                      Password *
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-zinc-200 focus:border-black"
                        placeholder="••••••••"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs text-zinc-700">
                      Confirm Password *
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-zinc-200 focus:border-black"
                        placeholder="••••••••"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 pt-4">
                <Button
                  className="border-zinc-200 bg-white"
                  disabled={isLoading}
                  onClick={() => setIsOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-black font-bold text-white hover:bg-zinc-800"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Add Staff"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
