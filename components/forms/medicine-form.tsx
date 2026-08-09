"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
      <form className="space-y-4 pt-2" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-zinc-700">
                  Medicine Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="border-zinc-200 focus:border-black"
                    placeholder="e.g. Paracetamol 500mg"
                    {...field}
                  />
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
                <FormLabel className="font-medium text-zinc-700">
                  Generic / Formula Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="border-zinc-200 focus:border-black"
                    placeholder="e.g. Acetaminophen"
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-zinc-700">
                  Category
                </FormLabel>
                <FormControl>
                  <Input
                    className="border-zinc-200 focus:border-black"
                    placeholder="e.g. Tablets, Syrup, Injection"
                    {...field}
                  />
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
                <FormLabel className="font-medium text-zinc-700">
                  Manufacturer
                </FormLabel>
                <FormControl>
                  <Input
                    className="border-zinc-200 focus:border-black"
                    placeholder="e.g. Cipla, Sun Pharma"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="hsn"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-zinc-700">
                  HSN Code
                </FormLabel>
                <FormControl>
                  <Input
                    className="border-zinc-200 focus:border-black"
                    placeholder="e.g. 3004"
                    {...field}
                  />
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
                <FormLabel className="font-medium text-zinc-700">
                  GST (%)
                </FormLabel>
                <FormControl>
                  <Input
                    className="border-zinc-200 focus:border-black"
                    placeholder="18"
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
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
                <FormLabel className="font-medium text-zinc-700">
                  MRP (₹)
                </FormLabel>
                <FormControl>
                  <Input
                    className="border-zinc-200 focus:border-black"
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
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
              <FormLabel className="font-medium text-zinc-700">
                Status
              </FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="border-zinc-200 bg-white focus:border-black">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="border-zinc-200 bg-white">
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 border-zinc-100 border-t pt-4">
          <Button
            className="bg-black px-6 font-medium text-white transition-colors hover:bg-zinc-800"
            disabled={isLoading}
            type="submit"
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
