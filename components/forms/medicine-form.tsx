"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { type FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
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

export const medicineFormSchema = z
  .object({
    name: z.string().min(1, "Medicine Name is required"),
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
  })
  .refine(
    (data) => {
      const minQ = data.minimumQuantity ?? 0;
      const maxQ = data.maximumQuantity;
      if (maxQ !== undefined && maxQ !== null) {
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

  // Re-sync form default values if they change
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: defaultValues.name || "",
        shortName: defaultValues.shortName || "",
        genericName: defaultValues.genericName || "",
        manufacturer: defaultValues.manufacturer || "",
        brand: defaultValues.brand || "",
        category: defaultValues.category || "",
        productType: defaultValues.productType || "",
        packing: defaultValues.packing || "",
        quantityVolume: defaultValues.quantityVolume || "",
        uqcUnit: defaultValues.uqcUnit || "",
        conversionFactor: defaultValues.conversionFactor ?? 1,
        hsn: defaultValues.hsn || "",
        gst: defaultValues.gst ?? 18,
        cess: defaultValues.cess ?? 0,
        mrp: defaultValues.mrp ?? 0,
        pRate: defaultValues.pRate,
        cost: defaultValues.cost,
        rateA: defaultValues.rateA,
        rateB: defaultValues.rateB,
        rateC: defaultValues.rateC,
        minimumQuantity: defaultValues.minimumQuantity ?? 0,
        maximumQuantity: defaultValues.maximumQuantity,
        reorderLevel: defaultValues.reorderLevel,
        reorderQuantity: defaultValues.reorderQuantity,
        barcode: defaultValues.barcode || "",
        drugSchedule: defaultValues.drugSchedule || "",
        prescriptionRequired: defaultValues.prescriptionRequired ?? false,
        storageCondition: defaultValues.storageCondition || "",
        status: defaultValues.status || "ACTIVE",
      });
      setCurrentStep(1);
    }
  }, [defaultValues, form]);

  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof MedicineFormValues)[] = [];
    if (step === 1) {
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
    } else if (step === 2) {
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
    } else if (step === 3) {
      fieldsToValidate = [
        "hsn",
        "gst",
        "cess",
        "mrp",
        "pRate",
        "cost",
        "rateA",
        "rateB",
        "rateC",
        "minimumQuantity",
        "maximumQuantity",
        "reorderLevel",
        "reorderQuantity",
      ];
    }
    return await form.trigger(fieldsToValidate);
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(3, prev + 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const goToStep = async (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep > currentStep) {
      const isValid = await validateStep(currentStep);
      if (!isValid) {
        toast.error("Please fill in the required fields before proceeding.");
        return;
      }
    }
    setCurrentStep(targetStep);
  };

  const onInvalid = (errors: FieldErrors<MedicineFormValues>) => {
    console.warn("MedicineForm validation errors:", errors);
    const step1Fields = [
      "name",
      "genericName",
      "manufacturer",
      "category",
      "shortName",
      "brand",
      "productType",
      "status",
    ];
    const step2Fields = [
      "packing",
      "conversionFactor",
      "quantityVolume",
      "uqcUnit",
      "barcode",
      "drugSchedule",
      "prescriptionRequired",
      "storageCondition",
    ];

    const errorKeys = Object.keys(errors);
    if (errorKeys.some((k) => step1Fields.includes(k))) {
      setCurrentStep(1);
    } else if (errorKeys.some((k) => step2Fields.includes(k))) {
      setCurrentStep(2);
    } else {
      setCurrentStep(3);
    }

    const firstMsg =
      (Object.values(errors)[0]?.message as string) ||
      "Please fill in all required fields properly.";
    toast.error(firstMsg);
  };

  const errors = form.formState.errors;
  const hasStep1Error = [
    "name",
    "genericName",
    "manufacturer",
    "category",
    "shortName",
    "brand",
    "productType",
    "status",
  ].some((k) => k in errors);
  const hasStep2Error = [
    "packing",
    "conversionFactor",
    "quantityVolume",
    "uqcUnit",
    "barcode",
    "drugSchedule",
    "prescriptionRequired",
    "storageCondition",
  ].some((k) => k in errors);
  const hasStep3Error = [
    "hsn",
    "gst",
    "cess",
    "mrp",
    "pRate",
    "cost",
    "rateA",
    "rateB",
    "rateC",
    "minimumQuantity",
    "maximumQuantity",
    "reorderLevel",
    "reorderQuantity",
  ].some((k) => k in errors);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col bg-white"
      >
        {/* Step Indicator Header Bar */}
        <div className="flex items-center justify-center bg-[#f8f9fc] px-8 py-5 border-t border-b border-zinc-150">
          <div className="flex items-center justify-between w-full max-w-md">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="group flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
            >
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 relative",
                  currentStep === 1
                    ? "bg-black border-black text-white shadow-xs"
                    : currentStep > 1
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-zinc-200 text-zinc-450",
                  hasStep1Error && "border-red-500 bg-red-50 text-red-600"
                )}
              >
                {currentStep > 1 && !hasStep1Error ? (
                  <Check className="size-4 stroke-[3px]" />
                ) : (
                  "1"
                )}
                {hasStep1Error && (
                  <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                )}
              </div>
              <span
                className={cn(
                  "mt-1.5 font-bold text-[9px] uppercase tracking-wider transition-colors",
                  currentStep === 1 ? "text-zinc-900" : "text-zinc-450",
                  hasStep1Error && "text-red-600"
                )}
              >
                Basic Info
              </span>
            </button>

            {/* Line 1 -> 2 */}
            <div
              className={cn(
                "h-0.5 flex-1 -mt-4 mx-3 transition-colors duration-300",
                currentStep >= 2 ? "bg-black" : "bg-zinc-200"
              )}
            />

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="group flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
            >
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 relative",
                  currentStep === 2
                    ? "bg-black border-black text-white shadow-xs"
                    : currentStep > 2
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-zinc-200 text-zinc-450",
                  hasStep2Error && "border-red-500 bg-red-50 text-red-600"
                )}
              >
                {currentStep > 2 && !hasStep2Error ? (
                  <Check className="size-4 stroke-[3px]" />
                ) : (
                  "2"
                )}
                {hasStep2Error && (
                  <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                )}
              </div>
              <span
                className={cn(
                  "mt-1.5 font-bold text-[9px] uppercase tracking-wider transition-colors",
                  currentStep === 2 ? "text-zinc-900" : "text-zinc-450",
                  hasStep2Error && "text-red-600"
                )}
              >
                Packaging
              </span>
            </button>

            {/* Line 2 -> 3 */}
            <div
              className={cn(
                "h-0.5 flex-1 -mt-4 mx-3 transition-colors duration-300",
                currentStep >= 3 ? "bg-black" : "bg-zinc-200"
              )}
            />

            {/* Step 3 */}
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="group flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
            >
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 relative",
                  currentStep === 3
                    ? "bg-black border-black text-white shadow-xs"
                    : "bg-white border-zinc-200 text-zinc-450",
                  hasStep3Error && "border-red-500 bg-red-50 text-red-600"
                )}
              >
                3
                {hasStep3Error && (
                  <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                )}
              </div>
              <span
                className={cn(
                  "mt-1.5 font-bold text-[9px] uppercase tracking-wider transition-colors",
                  currentStep === 3 ? "text-zinc-900" : "text-zinc-450",
                  hasStep3Error && "text-red-600"
                )}
              >
                Tax & Pricing
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Content Area */}
        <div className="p-6 overflow-y-auto max-h-[65vh] min-h-[440px] space-y-4">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">
                        Medicine Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          placeholder="e.g. Amoxil 500mg"
                          {...field}
                          value={field.value ?? ""}
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
                      <FormLabel className="font-semibold text-zinc-800">
                        Generic Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          placeholder="e.g. Amoxicillin"
                          {...field}
                          value={field.value ?? ""}
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">
                        Category *
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          placeholder="e.g. Tablet, Capsule, Syrup"
                          {...field}
                          value={field.value ?? ""}
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
                      <FormLabel className="font-semibold text-zinc-800">
                        Manufacturer *
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          placeholder="e.g. GlaxoSmithKline"
                          {...field}
                          value={field.value ?? ""}
                        />
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
                      <FormLabel className="font-semibold text-zinc-800">
                        Product Type
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          placeholder="e.g. Medicine, Surgical"
                          {...field}
                          value={field.value ?? ""}
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
                  name="shortName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">
                        Short Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          placeholder="e.g. AMX"
                          {...field}
                          value={field.value ?? ""}
                        />
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
                      <FormLabel className="font-semibold text-zinc-800">
                        Brand
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          placeholder="e.g. Amoxil"
                          {...field}
                          value={field.value ?? ""}
                        />
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
                      <FormLabel className="font-semibold text-zinc-800">
                        Status
                      </FormLabel>
                      <Select
                        value={field.value || "ACTIVE"}
                        onValueChange={field.onChange}
                      >
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
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <FormField
                  control={form.control}
                  name="packing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">
                        Packing *
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          placeholder="e.g. 1 x 10"
                          {...field}
                          value={field.value ?? ""}
                        />
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
                      <FormLabel className="font-semibold text-zinc-800">
                        Qty / Volume
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          placeholder="e.g. 100 ml"
                          {...field}
                          value={field.value ?? ""}
                        />
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
                      <FormLabel className="font-semibold text-zinc-800">
                        UQC / Unit
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          placeholder="e.g. Tablet, Bottle"
                          {...field}
                          value={field.value ?? ""}
                        />
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
                      <FormLabel className="font-semibold text-zinc-800">
                        Conversion *
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          placeholder="e.g. 10"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
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
                      <FormLabel className="font-semibold text-zinc-800">
                        Barcode / GTIN
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          placeholder="e.g. 890123456789"
                          {...field}
                          value={field.value ?? ""}
                        />
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
                      <FormLabel className="font-semibold text-zinc-800">
                        Drug Schedule
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          placeholder="e.g. OTC, Schedule H"
                          {...field}
                          value={field.value ?? ""}
                        />
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
                      <FormLabel className="font-semibold text-zinc-800">
                        Storage Condition
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          placeholder="e.g. Room Temp, Cold Chain"
                          {...field}
                          value={field.value ?? ""}
                        />
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
                      <FormLabel className="font-semibold text-zinc-800">
                        Prescription Required?
                      </FormLabel>
                      <Select
                        value={field.value ? "true" : "false"}
                        onValueChange={(val) => field.onChange(val === "true")}
                      >
                        <FormControl>
                          <SelectTrigger className="border-zinc-200 bg-white focus:border-black">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-zinc-200 bg-white">
                          <SelectItem value="false">
                            No (OTC / General)
                          </SelectItem>
                          <SelectItem value="true">
                            Yes (Rx Required)
                          </SelectItem>
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
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="hsn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">
                        HSN/SAC
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          placeholder="e.g. 3004"
                          {...field}
                          value={field.value ?? ""}
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
                      <FormLabel className="font-semibold text-zinc-800">
                        GST Rate (%) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          placeholder="e.g. 18"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
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
                  name="cess"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">
                        CESS (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          placeholder="e.g. 0"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
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
                      <FormLabel className="font-semibold text-zinc-800">
                        MRP *
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
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
                  name="pRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">
                        Purchase Rate (P Rate)
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
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
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">
                        Cost
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
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
                      <FormLabel className="font-semibold text-zinc-800">
                        Rate A
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
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
                  name="rateB"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">
                        Rate B
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
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
                  name="rateC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">
                        Rate C
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
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
                      <FormLabel className="font-semibold text-zinc-800">
                        Min Qty
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          placeholder="0"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
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
                  name="maximumQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">
                        Max Qty
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          placeholder="e.g. 50"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
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
                  name="reorderLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">
                        Reorder Level
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          placeholder="e.g. 10"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
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
                  name="reorderQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-800">
                        Reorder Qty
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-zinc-200 focus:border-black"
                          type="number"
                          placeholder="e.g. 20"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
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
              disabled={currentStep === 1 || isLoading}
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-black font-semibold text-xs px-4"
            >
              Previous
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-black font-semibold text-xs px-4"
              >
                Cancel
              </Button>
            )}

            {currentStep < 3 ? (
              <>
                {submitLabel === "Save Changes" && (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="outline"
                    className="border-zinc-300 bg-zinc-50 text-zinc-900 hover:bg-zinc-100 font-bold text-xs px-4"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-black text-white hover:bg-zinc-800 font-semibold text-xs px-5 flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <ChevronRight className="size-3.5" />
                </Button>
              </>
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
