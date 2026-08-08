"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
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

export const medicineFormSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  genericName: z.string().min(1, "Generic/Formula name is required"),
  category: z.string().min(1, "Category is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  hsn: z.string().optional().or(z.literal("")),
  gst: z.number({ message: "GST is required" }).min(0, "GST must be >= 0"),
  mrp: z.number({ message: "MRP is required" }).min(0.01, "MRP must be > 0"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type MedicineFormValues = z.infer<typeof medicineFormSchema>;

interface MedicineFormProps {
  onSubmit: (values: MedicineFormValues) => void | Promise<void>;
  defaultValues?: Partial<MedicineFormValues>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function MedicineForm({
  onSubmit,
  defaultValues,
  isLoading = false,
  submitLabel = "Save Medicine",
}: MedicineFormProps) {
  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      genericName: defaultValues?.genericName || "",
      category: defaultValues?.category || "",
      manufacturer: defaultValues?.manufacturer || "",
      hsn: defaultValues?.hsn || "",
      gst: defaultValues?.gst ?? 18,
      mrp: defaultValues?.mrp ?? 0,
      status: defaultValues?.status || "ACTIVE",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 font-medium">Medicine Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Paracetamol 500mg" className="border-zinc-200 focus:border-black" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="genericName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 font-medium">Generic / Formula Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Acetaminophen" className="border-zinc-200 focus:border-black" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 font-medium">Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Tablets, Syrup, Injection" className="border-zinc-200 focus:border-black" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="manufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 font-medium">Manufacturer</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Cipla, Sun Pharma" className="border-zinc-200 focus:border-black" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="hsn"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 font-medium">HSN Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 3004" className="border-zinc-200 focus:border-black" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gst"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 font-medium">GST (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="18"
                    className="border-zinc-200 focus:border-black"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mrp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 font-medium">MRP (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="border-zinc-200 focus:border-black"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700 font-medium">Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-zinc-200 focus:border-black bg-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border-zinc-200">
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-black text-white hover:bg-zinc-800 transition-colors font-medium px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
