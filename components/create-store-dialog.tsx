"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { type StoreSchemaValues, storeSchema } from "@/lib/schemas/store";
import { createStore } from "@/server/store";

interface CreateStoreDialogProps {
  isOpen: boolean;
}

export function CreateStoreDialog({ isOpen }: CreateStoreDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StoreSchemaValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      storeName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      legalName: "",
      ownerName: "",
      email: "",
      alternatePhone: "",
      gstNumber: "",
      drugLicenseNumber: "",
      pharmacyLicenseNumber: "",
      logo: "",
    },
  });

  const onSubmit = async (values: StoreSchemaValues) => {
    setIsLoading(true);
    try {
      const res = await createStore(values);
      if (res.success) {
        toast.success("Store created successfully.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create store.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="max-w-2xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="font-extrabold text-2xl text-zinc-900 tracking-tight">
            Create Your Store
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            Set up your medical store details to get started with MediBilldo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="scrollbar-thin max-h-[60vh] space-y-6 overflow-y-auto px-1 py-1 pr-2">
              {/* General / Required Section */}
              <div className="space-y-4">
                <h3 className="border-zinc-100 border-b pb-1.5 font-bold text-xs text-zinc-400 uppercase tracking-wider">
                  General Information (Required)
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="storeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-xs text-zinc-700">
                          Store Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border-zinc-205 focus:border-black"
                            placeholder="e.g. Sharma Medical Store"
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
                          Phone Number *
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border-zinc-205 focus:border-black"
                            placeholder="e.g. 9876543210"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-xs text-zinc-700">
                        Address *
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-205 focus:border-black"
                          placeholder="e.g. Shop 12, Main Market Road"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-xs text-zinc-700">
                          City *
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border-zinc-205 focus:border-black"
                            placeholder="e.g. New Delhi"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-xs text-zinc-700">
                          State *
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border-zinc-205 focus:border-black"
                            placeholder="e.g. Delhi"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-xs text-zinc-700">
                          Pincode *
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border-zinc-205 focus:border-black"
                            placeholder="e.g. 110001"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Additional / Optional Section */}
              <div className="space-y-4">
                <h3 className="border-zinc-100 border-b pb-1.5 font-bold text-xs text-zinc-400 uppercase tracking-wider">
                  Additional Details (Optional)
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="legalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-xs text-zinc-700">
                          Legal Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border-zinc-205 focus:border-black"
                            placeholder="e.g. Sharma Healthcare Pvt Ltd"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-xs text-zinc-700">
                          Owner Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border-zinc-205 focus:border-black"
                            placeholder="e.g. Dr. Rajesh Sharma"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-xs text-zinc-700">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border-zinc-205 focus:border-black"
                            placeholder="e.g. info@sharmamedical.com"
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
                    name="alternatePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-xs text-zinc-700">
                          Alternate Phone
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border-zinc-205 focus:border-black"
                            placeholder="e.g. 011-23456789"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="gstNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-xs text-zinc-700">
                          GSTIN
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border-zinc-205 focus:border-black"
                            placeholder="e.g. 07AAAAA1111A1Z1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="drugLicenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-xs text-zinc-700">
                          Drug License No.
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border-zinc-205 focus:border-black"
                            placeholder="e.g. DL-12345"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pharmacyLicenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-xs text-zinc-700">
                          Pharmacy License No.
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border-zinc-205 focus:border-black"
                            placeholder="e.g. PL-67890"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-xs text-zinc-700">
                        Store Logo URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-205 focus:border-black"
                          placeholder="e.g. https://example.com/logo.png"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-end border-zinc-100 border-t pt-4">
              <Button
                className="w-full cursor-pointer rounded-lg bg-black px-8 py-6 font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 sm:w-auto"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating Store...
                  </>
                ) : (
                  "Create Store & Proceed"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
