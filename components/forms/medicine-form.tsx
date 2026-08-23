"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
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
import { cn } from "@/lib/utils";

export const medicineFormSchema = z.object({
  name: z.string().min(1, "Product Name is required"),
  shortName: z.string().optional(),
  genericName: z.string().min(1, "Generic Name is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  brand: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  productType: z.string().optional(),
  packing: z.string().min(1, "Packing is required"),
  quantityVolume: z.string().optional(),
  uqcUnit: z.string().optional(),
  conversionFactor: z
    .number({ message: "Conversion Factor is required" })
    .int("Conversion Factor must be an integer")
    .positive("Conversion Factor must be positive"),
  hsn: z.string().optional(),
  gst: z.number({ message: "GST is required" }).min(0, "GST must be >= 0"),
  cess: z.number().optional(),
  mrp: z.number({ message: "MRP is required" }).positive("MRP must be > 0"),
  pRate: z.number().optional(),
  cost: z.number().optional(),
  rateA: z.number().optional(),
  rateB: z.number().optional(),
  rateC: z.number().optional(),
  minimumQuantity: z.number().optional(),
  maximumQuantity: z.number().optional(),
  reorderLevel: z.number().optional(),
  reorderQuantity: z.number().optional(),
  barcode: z.string().optional(),
  drugSchedule: z.string().optional(),
  prescriptionRequired: z.boolean().optional(),
  storageCondition: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
}).refine(
  (data) => {
    const minQ = data.minimumQuantity ?? 0;
    const maxQ = data.maximumQuantity;
    if (maxQ !== undefined) {
      return maxQ >= minQ;
    }
    return true;
  },
  {
    message: "Maximum Quantity cannot be less than Minimum Quantity",
    path: ["maximumQuantity"],
  }
);

export type MedicineFormValues = z.infer<typeof medicineFormSchema>;

interface MedicineFormProps {
  onSubmit: (values: MedicineFormValues) => void | Promise<void>;
  onCancel?: () => void;
  defaultValues?: Partial<MedicineFormValues>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function MedicineForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  submitLabel = "Save Medicine",
}: MedicineFormProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      shortName: defaultValues?.shortName || "",
      genericName: defaultValues?.genericName || "",
      manufacturer: defaultValues?.manufacturer || "",
      brand: defaultValues?.brand || "",
      category: defaultValues?.category || "",
      productType: defaultValues?.productType || "",
      packing: defaultValues?.packing || "",
      quantityVolume: defaultValues?.quantityVolume || "",
      uqcUnit: defaultValues?.uqcUnit || "",
      conversionFactor: defaultValues?.conversionFactor ?? 1,
      hsn: defaultValues?.hsn || "",
      gst: defaultValues?.gst ?? 18,
      cess: defaultValues?.cess ?? 0,
      mrp: defaultValues?.mrp ?? 0,
      pRate: defaultValues?.pRate,
      cost: defaultValues?.cost,
      rateA: defaultValues?.rateA,
      rateB: defaultValues?.rateB,
      rateC: defaultValues?.rateC,
      minimumQuantity: defaultValues?.minimumQuantity ?? 0,
      maximumQuantity: defaultValues?.maximumQuantity,
      reorderLevel: defaultValues?.reorderLevel,
      reorderQuantity: defaultValues?.reorderQuantity,
      barcode: defaultValues?.barcode || "",
      drugSchedule: defaultValues?.drugSchedule || "",
      prescriptionRequired: defaultValues?.prescriptionRequired ?? false,
      storageCondition: defaultValues?.storageCondition || "",
      status: defaultValues?.status || "ACTIVE",
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof MedicineFormValues)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = [
        "name",
        "genericName",
        "manufacturer",
        "category",
        "shortName",
        "brand",
        "productType",
        "status",
      ];
    } else if (currentStep === 2) {
      fieldsToValidate = [
        "packing",
        "conversionFactor",
        "quantityVolume",
        "uqcUnit",
        "barcode",
        "drugSchedule",
        "prescriptionRequired",
        "storageCondition",
      ];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col bg-white">
        
        {/* Step Indicator Header Bar */}
        <div className="flex items-center justify-center bg-[#f8f9fc] px-8 py-5 border-t border-b border-zinc-150">
          <div className="flex items-center justify-between w-full max-w-md">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "size-7 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300",
                currentStep >= 1 ? "bg-black border-black text-white" : "bg-white border-zinc-200 text-zinc-450"
              )}>
                1
              </div>
              <span className={cn(
                "mt-1.5 font-bold text-[9px] uppercase tracking-wider",
                currentStep >= 1 ? "text-zinc-900" : "text-zinc-450"
              )}>
                Basic Info
              </span>
            </div>

            {/* Line */}
            <div className={cn("h-px flex-1 -mt-4 mx-4 transition-colors duration-300", currentStep >= 2 ? "bg-black" : "bg-zinc-200")} />

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "size-7 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300",
                currentStep >= 2 ? "bg-black border-black text-white" : "bg-white border-zinc-200 text-zinc-450"
              )}>
                2
              </div>
              <span className={cn(
                "mt-1.5 font-bold text-[9px] uppercase tracking-wider",
                currentStep >= 2 ? "text-zinc-900" : "text-zinc-450"
              )}>
                Packaging
              </span>
            </div>

            {/* Line */}
            <div className={cn("h-px flex-1 -mt-4 mx-4 transition-colors duration-300", currentStep >= 3 ? "bg-black" : "bg-zinc-200")} />

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "size-7 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300",
                currentStep >= 3 ? "bg-black border-black text-white" : "bg-white border-zinc-200 text-zinc-450"
              )}>
                3
              </div>
              <span className={cn(
                "mt-1.5 font-bold text-[9px] uppercase tracking-wider",
                currentStep >= 3 ? "text-zinc-900" : "text-zinc-450"
              )}>
                Tax Details
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Form Content Area */}
        <div className="p-6 overflow-y-auto max-h-[65vh] min-h-[460px] space-y-4">
          
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Medicine Name *</FormLabel>
                      <FormControl>
                        <Input className="border-zinc-200 focus:border-black" placeholder="e.g. Amoxil 500mg" {...field} />
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
                      <FormLabel className="font-semibold text-zinc-800">Generic Name</FormLabel>
                      <FormControl>
                        <Input className="border-zinc-200 focus:border-black" placeholder="e.g. Amoxicillin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Category *</FormLabel>
                      <FormControl>
                        <Input className="border-zinc-200 focus:border-black" placeholder="e.g. Tablet, Capsule, Syrup" {...field} />
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
                      <FormLabel className="font-semibold text-zinc-800">Manufacturer *</FormLabel>
                      <FormControl>
                        <Input className="border-zinc-200 focus:border-black" placeholder="e.g. GlaxoSmithKline" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Product Type</FormLabel>
                      <FormControl>
                        <Input className="border-zinc-200 focus:border-black" placeholder="e.g. Medicine, Surgical" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="shortName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Short Name</FormLabel>
                      <FormControl>
                        <Input className="border-zinc-200 focus:border-black" placeholder="e.g. AMX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Brand</FormLabel>
                      <FormControl>
                        <Input className="border-zinc-200 focus:border-black" placeholder="e.g. Amoxil" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Status</FormLabel>
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
              </div>
            </div>
          )}

          {/* STEP 2: Packaging & Classification */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <FormField
                  control={form.control}
                  name="packing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Packing *</FormLabel>
                      <FormControl>
                        <Input className="border-zinc-200 focus:border-black" placeholder="e.g. 1 x 10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantityVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Qty / Volume</FormLabel>
                      <FormControl>
                        <Input className="border-zinc-200 focus:border-black" placeholder="e.g. 100 ml" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uqcUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">UQC / Unit</FormLabel>
                      <FormControl>
                        <Input className="border-zinc-200 focus:border-black" placeholder="e.g. Tablet, Bottle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="conversionFactor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Conversion *</FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          placeholder="e.g. 10"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
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
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Barcode / GTIN</FormLabel>
                      <FormControl>
                        <Input className="border-zinc-200 focus:border-black" placeholder="e.g. 890123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="drugSchedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Drug Schedule</FormLabel>
                      <FormControl>
                        <Input className="border-zinc-200 focus:border-black" placeholder="e.g. OTC, Schedule H" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="storageCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Storage Condition</FormLabel>
                      <FormControl>
                        <Input className="border-zinc-200 focus:border-black" placeholder="e.g. Room Temp, Cold Chain" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="prescriptionRequired"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Prescription Required?</FormLabel>
                      <Select defaultValue={field.value ? "true" : "false"} onValueChange={(val) => field.onChange(val === "true")}>
                        <FormControl>
                          <SelectTrigger className="border-zinc-200 bg-white focus:border-black">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-zinc-200 bg-white">
                          <SelectItem value="false">No (OTC / General)</SelectItem>
                          <SelectItem value="true">Yes (Rx Required)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Tax, Pricing & Inventory */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="hsn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">HSN/SAC</FormLabel>
                      <FormControl>
                        <Input className="border-zinc-200 focus:border-black" placeholder="e.g. 3004" {...field} />
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
                      <FormLabel className="font-semibold text-zinc-800">GST Rate (%) *</FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          placeholder="e.g. 18"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cess"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">CESS (%)</FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          placeholder="e.g. 0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
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
                  name="mrp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">MRP *</FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Purchase Rate (P Rate)</FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Cost</FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
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
                  name="rateA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Rate A</FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rateB"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Rate B</FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rateC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Rate C</FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 border-t pt-4">
                <FormField
                  control={form.control}
                  name="minimumQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Min Qty</FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maximumQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Max Qty</FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          placeholder="e.g. 50"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reorderLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Reorder Level</FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          placeholder="e.g. 10"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reorderQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">Reorder Qty</FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          placeholder="e.g. 20"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between border-t border-zinc-150 p-4 bg-white rounded-b-xl">
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-black font-semibold text-xs px-4"
            >
              Previous
            </Button>
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-black font-semibold text-xs px-4"
              >
                Cancel
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-black text-white hover:bg-zinc-800 font-semibold text-xs px-5 flex items-center gap-1.5"
              >
                Next &rarr;
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-black text-white hover:bg-zinc-800 font-semibold text-xs px-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                    Saving...
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            )}
          </div>
        </div>

      </form>
    </Form>
  );
}
