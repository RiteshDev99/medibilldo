"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Edit3, FileText, Globe, Loader2, MapPin, Phone, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { storeSchema, type StoreSchemaValues } from "@/lib/schemas/store";
import { updateStore } from "@/server/store";
import type { Store } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

interface StoreProfileProps {
  store: Store;
}

export function StoreProfile({ store }: StoreProfileProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StoreSchemaValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      storeName: store.storeName || "",
      phone: store.phone || "",
      address: store.address || "",
      city: store.city || "",
      state: store.state || "",
      pincode: store.pincode || "",
      legalName: store.legalName || "",
      ownerName: store.ownerName || "",
      email: store.email || "",
      alternatePhone: store.alternatePhone || "",
      gstNumber: store.gstNumber || "",
      drugLicenseNumber: store.drugLicenseNumber || "",
      pharmacyLicenseNumber: store.pharmacyLicenseNumber || "",
      logo: store.logo || "",
    },
  });

  const onSubmit = async (values: StoreSchemaValues) => {
    setIsLoading(true);
    try {
      const res = await updateStore(values);
      if (res.success) {
        toast.success("Store updated successfully.");
        setIsEditDialogOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update store.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Overview Card */}
      <Card className="border-zinc-200 bg-white shadow-xs">
        <CardHeader className="flex flex-col items-start justify-between gap-4 border-zinc-100 border-b pb-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-zinc-900 text-white">
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.storeName}
                  className="size-full rounded-xl object-cover"
                />
              ) : (
                <Building2 className="size-6" />
              )}
            </div>
            <div>
              <CardTitle className="font-extrabold text-2xl text-zinc-900">
                {store.storeName}
              </CardTitle>
              {store.legalName && (
                <CardDescription className="text-zinc-500 font-medium">
                  {store.legalName}
                </CardDescription>
              )}
            </div>
          </div>
          <Button
            onClick={() => setIsEditDialogOpen(true)}
            className="flex items-center gap-2 bg-black text-white hover:bg-zinc-800 rounded-lg py-2.5 px-4 font-bold text-xs cursor-pointer transition-all"
          >
            <Edit3 className="size-3.5" />
            Edit Store Profile
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Owner & Contact Block */}
            <div className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
              <h3 className="flex items-center gap-2 font-bold text-xs text-zinc-500 uppercase tracking-wider">
                <User className="size-3.5 text-zinc-400" />
                Ownership & Contact
              </h3>
              <div className="space-y-2 text-sm text-zinc-800">
                <div>
                  <span className="text-xs text-zinc-400 font-semibold block">Owner Name</span>
                  <span className="font-medium">{store.ownerName || "Not Provided"}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 font-semibold block">Phone Number</span>
                  <span className="font-medium flex items-center gap-1.5 mt-0.5">
                    <Phone className="size-3 text-zinc-400" /> {store.phone}
                  </span>
                </div>
                {store.alternatePhone && (
                  <div>
                    <span className="text-xs text-zinc-400 font-semibold block">Alternate Phone</span>
                    <span className="font-medium">{store.alternatePhone}</span>
                  </div>
                )}
                {store.email && (
                  <div>
                    <span className="text-xs text-zinc-400 font-semibold block">Email Address</span>
                    <span className="font-medium flex items-center gap-1.5 mt-0.5">
                      <Globe className="size-3 text-zinc-400" /> {store.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Address Block */}
            <div className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
              <h3 className="flex items-center gap-2 font-bold text-xs text-zinc-500 uppercase tracking-wider">
                <MapPin className="size-3.5 text-zinc-400" />
                Address Details
              </h3>
              <div className="space-y-2 text-sm text-zinc-800">
                <div>
                  <span className="text-xs text-zinc-400 font-semibold block">Store Address</span>
                  <span className="font-medium block leading-relaxed">{store.address}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-xs text-zinc-400 font-semibold block">City</span>
                    <span className="font-medium">{store.city}</span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-semibold block">State</span>
                    <span className="font-medium">{store.state}</span>
                  </div>
                </div>
                <div className="pt-1">
                  <span className="text-xs text-zinc-400 font-semibold block">Pincode</span>
                  <span className="font-medium tracking-wide">{store.pincode}</span>
                </div>
              </div>
            </div>

            {/* Regulatory Block */}
            <div className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 sm:col-span-2 lg:col-span-1">
              <h3 className="flex items-center gap-2 font-bold text-xs text-zinc-500 uppercase tracking-wider">
                <ShieldCheck className="size-3.5 text-zinc-400" />
                Licenses & GST
              </h3>
              <div className="space-y-2 text-sm text-zinc-800">
                <div>
                  <span className="text-xs text-zinc-400 font-semibold block">GSTIN</span>
                  <span className="font-mono font-medium text-xs bg-zinc-100 px-2 py-0.5 rounded inline-block mt-0.5">
                    {store.gstNumber || "Not Provided"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 font-semibold block">Drug License Number</span>
                  <span className="font-medium flex items-center gap-1.5 mt-0.5">
                    <FileText className="size-3 text-zinc-400" /> {store.drugLicenseNumber || "Not Provided"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 font-semibold block">Pharmacy License Number</span>
                  <span className="font-medium flex items-center gap-1.5 mt-0.5">
                    <FileText className="size-3 text-zinc-400" /> {store.pharmacyLicenseNumber || "Not Provided"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Edit Store Dialog Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-2xl tracking-tight text-zinc-900">
              Edit Store Profile
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm">
              Update your medical store information. These changes will reflect immediately on bills and dashboard.
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

              <div className="flex items-center justify-end gap-3 border-zinc-100 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="rounded-lg py-2.5 px-4 font-bold text-xs cursor-pointer border border-zinc-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-black text-white hover:bg-zinc-800 py-2.5 px-6 font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-3 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
