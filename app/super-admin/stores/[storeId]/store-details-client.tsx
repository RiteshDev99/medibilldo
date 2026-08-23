"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
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
import type { User as DbUser, Store } from "@/db/schema";
import { createStoreAdminAccess, updateStoreStatus } from "@/server/store";

const adminFormSchema = z
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

interface StoreDetailsClientProps {
  store: Store;
  owner: DbUser | null;
}

export function StoreDetailsClient({ store, owner }: StoreDetailsClientProps) {
  const router = useRouter();
  const [activeOpen, setActiveOpen] = useState(false);
  const [deactiveOpen, setDeactiveOpen] = useState(false);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const adminForm = useForm<z.infer<typeof adminFormSchema>>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onCreateAdminSubmit = async (
    values: z.infer<typeof adminFormSchema>
  ) => {
    setIsLoading(true);
    try {
      const res = await createStoreAdminAccess(store.id, values);
      if (res.success) {
        toast.success(
          "Store Admin access created successfully. Secure invitation sent."
        );
        setCreateAdminOpen(false);
        adminForm.reset();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create Admin access.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (newStatus: "ACTIVE" | "INACTIVE") => {
    setIsLoading(true);
    try {
      const res = await updateStoreStatus(store.id, newStatus);
      if (res.success) {
        toast.success(
          `Store ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully.`
        );
        setActiveOpen(false);
        setDeactiveOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update store status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-zinc-50/50 p-6 text-zinc-950 md:p-10">
      {/* Header / Back Breadcrumb */}
      <div className="flex items-center justify-between border-zinc-200 border-b pb-4">
        <Link href="/super-admin/stores">
          <Button
            className="gap-1 border-zinc-200 bg-white hover:bg-zinc-100"
            size="sm"
            variant="ghost"
          >
            <ArrowLeft className="size-4" />
            Back to Directory
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {store.status === "ACTIVE" ? (
            <Button
              className="border border-red-200 bg-red-50 font-semibold text-red-800 hover:bg-red-100"
              onClick={() => setDeactiveOpen(true)}
            >
              Deactivate Store
            </Button>
          ) : (
            <Button
              className="border border-emerald-200 bg-emerald-50 font-semibold text-emerald-800 hover:bg-emerald-100"
              onClick={() => setActiveOpen(true)}
            >
              Activate Store
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Basic Info & Profile */}
        <div className="space-y-6 md:col-span-2">
          <Card className="border-zinc-200 bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center gap-4 border-zinc-100 border-b pb-6">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white">
                {store.logo ? (
                  <img
                    alt={store.storeName}
                    className="size-full rounded-xl object-cover"
                    src={store.logo}
                  />
                ) : (
                  <Building2 className="size-6" />
                )}
              </div>
              <div>
                <CardTitle className="font-extrabold text-2xl text-zinc-900">
                  {store.storeName}
                </CardTitle>
                <CardDescription className="mt-0.5 text-sm text-zinc-500">
                  ID: {store.id}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Detailed information rows */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider">
                    Legal Entity Name
                  </h4>
                  <p className="mt-1 font-bold text-sm text-zinc-800">
                    {store.legalName || "Not Provided"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider">
                    Owner Name
                  </h4>
                  <p className="mt-1 font-bold text-sm text-zinc-800">
                    {store.ownerName || "Not Provided"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider">
                    Phone number
                  </h4>
                  <p className="mt-1 flex items-center gap-1.5 font-bold text-sm text-zinc-800">
                    <Phone className="size-3.5 text-zinc-400" />
                    {store.phone}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider">
                    Alternate Phone
                  </h4>
                  <p className="mt-1 flex items-center gap-1.5 font-bold text-sm text-zinc-800">
                    {store.alternatePhone ? (
                      <>
                        <Phone className="size-3.5 text-zinc-400" />
                        {store.alternatePhone}
                      </>
                    ) : (
                      "Not Provided"
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider">
                  Email Address
                </h4>
                <p className="mt-1 flex items-center gap-1.5 font-bold text-sm text-zinc-800">
                  {store.email ? (
                    <>
                      <Mail className="size-3.5 text-zinc-400" />
                      {store.email}
                    </>
                  ) : (
                    "Not Provided"
                  )}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider">
                  Store Location Address
                </h4>
                <p className="mt-1 font-bold text-sm text-zinc-850">
                  {store.address}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {store.city}, {store.state} - {store.pincode}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Card */}
          <Card className="border-zinc-200 bg-white shadow-xs">
            <CardHeader className="border-zinc-100 border-b pb-4">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-zinc-500" />
                <CardTitle className="font-extrabold text-base tracking-tight">
                  Compliance & Licenses
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-3">
              <div>
                <h4 className="font-semibold text-xs text-zinc-450 uppercase tracking-wider">
                  GSTIN
                </h4>
                {store.gstNumber ? (
                  <div className="mt-2 space-y-1">
                    <span className="font-bold text-sm text-zinc-900">
                      {store.gstNumber}
                    </span>
                    <span className="block w-max rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-bold text-[10px] text-zinc-450">
                      Provided
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-zinc-400 italic">
                    Not Provided
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-xs text-zinc-455 uppercase tracking-wider">
                  Drug License Number
                </h4>
                {store.drugLicenseNumber ? (
                  <div className="mt-2 space-y-1">
                    <span className="font-bold text-sm text-zinc-900">
                      {store.drugLicenseNumber}
                    </span>
                    <span className="block w-max rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-bold text-[10px] text-zinc-450">
                      Provided
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-zinc-400 italic">
                    Not Provided
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-xs text-zinc-455 uppercase tracking-wider">
                  Pharmacy License Number
                </h4>
                {store.pharmacyLicenseNumber ? (
                  <div className="mt-2 space-y-1">
                    <span className="font-bold text-sm text-zinc-900">
                      {store.pharmacyLicenseNumber}
                    </span>
                    <span className="block w-max rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-bold text-[10px] text-zinc-455">
                      Provided
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-zinc-400 italic">
                    Not Provided
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Platform Metadata & Owner Info */}
        <div className="space-y-6">
          <Card className="border-zinc-200 bg-white shadow-xs">
            <CardHeader className="border-zinc-100 border-b pb-4">
              <CardTitle className="font-extrabold text-base tracking-tight">
                Platform Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="font-medium text-zinc-500">
                  Operational Status
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase ${
                    store.status === "ACTIVE"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border border-red-200 bg-red-50 text-red-800"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${store.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"}`}
                  />
                  {store.status}
                </span>
              </div>
              <div className="flex items-center justify-between border-zinc-100 border-t py-1 pt-2">
                <span className="flex items-center gap-1 font-medium text-zinc-500">
                  <Calendar className="size-3 text-zinc-400" /> Created At
                </span>
                <span className="font-bold text-zinc-800">
                  {new Date(store.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between border-zinc-100 border-t py-1 pt-2">
                <span className="flex items-center gap-1 font-medium text-zinc-500">
                  <Calendar className="size-3 text-zinc-400" /> Last Updated
                </span>
                <span className="font-bold text-zinc-800">
                  {new Date(store.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 bg-white shadow-xs">
            <CardHeader className="border-zinc-100 border-b pb-4">
              <div className="flex items-center gap-2">
                <User className="size-4 text-zinc-500" />
                <CardTitle className="font-extrabold text-base tracking-tight">
                  Store Administrator
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 text-center">
              {owner ? (
                <div className="space-y-2">
                  <p className="font-bold text-base text-zinc-950">
                    {owner.name}
                  </p>
                  <p className="text-xs text-zinc-500">{owner.email}</p>
                  <span className="inline-block rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-bold text-[9px] text-zinc-800 uppercase tracking-wider">
                    {owner.role}
                  </span>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div>
                    <p className="font-extrabold text-sm text-zinc-900">
                      Store Admin
                    </p>
                    <p className="mt-1 font-semibold text-red-500 text-xs">
                      No Admin Access Created
                    </p>
                  </div>
                  <Button
                    className="rounded-lg bg-black px-6 py-4 font-semibold text-white text-xs transition-all"
                    onClick={() => setCreateAdminOpen(true)}
                    size="sm"
                  >
                    Create Admin Access
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activation Confirmation Dialog */}
      <Dialog onOpenChange={setActiveOpen} open={activeOpen}>
        <DialogContent className="border-zinc-200 bg-white">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-lg text-zinc-950">
              Activate Store?
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-550">
              This will restore access to the store&apos;s{" "}
              <strong>ADMIN</strong> and <strong>STAFF</strong> users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              className="border-zinc-200 bg-white"
              disabled={isLoading}
              onClick={() => setActiveOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 font-bold text-white hover:bg-emerald-700"
              disabled={isLoading}
              onClick={() => handleToggleStatus("ACTIVE")}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Activate Store"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivation Confirmation Dialog */}
      <Dialog onOpenChange={setDeactiveOpen} open={deactiveOpen}>
        <DialogContent className="border-zinc-200 bg-white">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-lg text-zinc-950">
              Deactivate Store?
            </DialogTitle>
            <DialogDescription className="space-y-2 text-sm text-zinc-550">
              <p>
                This will prevent the store&apos;s <strong>ADMIN</strong> and{" "}
                <strong>STAFF</strong> users from accessing the MediBilldo store
                application.
              </p>
              <p className="text-xs text-zinc-450 italic">
                The store&apos;s data will not be deleted.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              className="border-zinc-200 bg-white"
              disabled={isLoading}
              onClick={() => setDeactiveOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-655 font-bold text-white hover:bg-red-755"
              disabled={isLoading}
              onClick={() => handleToggleStatus("INACTIVE")}
              variant="destructive"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Deactivate Store"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Admin Access Dialog */}
      <Dialog onOpenChange={setCreateAdminOpen} open={createAdminOpen}>
        <DialogContent className="max-w-md border-zinc-200 bg-white">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-lg text-zinc-950">
              Create Admin Access
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-550">
              Create a Store Admin account for{" "}
              <strong>{store.storeName}</strong>. Specify their login password
              directly.
            </DialogDescription>
          </DialogHeader>
          <Form {...adminForm}>
            <form
              className="space-y-4 pt-2"
              onSubmit={adminForm.handleSubmit(onCreateAdminSubmit)}
            >
              <FormField
                control={adminForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs text-zinc-700">
                      Full Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-zinc-200 focus:border-black"
                        placeholder="e.g. Rahul Sharma"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={adminForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs text-zinc-700">
                      Email *
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-zinc-200 focus:border-black"
                        placeholder="e.g. rahul@example.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={adminForm.control}
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
                control={adminForm.control}
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
                control={adminForm.control}
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
                  onClick={() => setCreateAdminOpen(false)}
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
                    "Create Admin Access"
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
