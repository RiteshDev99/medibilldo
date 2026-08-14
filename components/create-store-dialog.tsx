"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { storeSchema, type StoreSchemaValues } from "@/lib/schemas/store";
import { createStore } from "@/server/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-extrabold text-2xl tracking-tight text-zinc-900">
            Create Your Store
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-sm">
            Set up your medical store details to get started with MediBilldo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="max-h-[60vh] overflow-y-auto px-1 py-1 space-y-6 pr-2 scrollbar-thin">
              
              {/* General / Required Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs text-zinc-400 border-zinc-100 border-b pb-1.5 uppercase tracking-wider">
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
                            placeholder="e.g. Sharma Medical Store"
                            className="border-zinc-205 focus:border-black"
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
                            placeholder="e.g. 9876543210"
                            className="border-zinc-205 focus:border-black"
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
                          placeholder="e.g. Shop 12, Main Market Road"
                          className="border-zinc-205 focus:border-black"
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
                            placeholder="e.g. New Delhi"
                            className="border-zinc-205 focus:border-black"
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
                            placeholder="e.g. Delhi"
                            className="border-zinc-205 focus:border-black"
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
                            placeholder="e.g. 110001"
                            className="border-zinc-205 focus:border-black"
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
                <h3 className="font-bold text-xs text-zinc-400 border-zinc-100 border-b pb-1.5 uppercase tracking-wider">
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
                            placeholder="e.g. Sharma Healthcare Pvt Ltd"
                            className="border-zinc-205 focus:border-black"
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
                            placeholder="e.g. Dr. Rajesh Sharma"
                            className="border-zinc-205 focus:border-black"
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
                            type="email"
                            placeholder="e.g. info@sharmamedical.com"
                            className="border-zinc-205 focus:border-black"
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
                            placeholder="e.g. 011-23456789"
                            className="border-zinc-205 focus:border-black"
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
                            placeholder="e.g. 07AAAAA1111A1Z1"
                            className="border-zinc-205 focus:border-black"
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
                            placeholder="e.g. DL-12345"
                            className="border-zinc-205 focus:border-black"
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
                            placeholder="e.g. PL-67890"
                            className="border-zinc-205 focus:border-black"
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
                          placeholder="e.g. https://example.com/logo.png"
                          className="border-zinc-205 focus:border-black"
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
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-black text-white hover:bg-zinc-800 py-6 px-8 font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50"
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
