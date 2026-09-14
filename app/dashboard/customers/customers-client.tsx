"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreditCard,
  Loader2,
  Phone,
  Plus,
  ReceiptText,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import type { Customer } from "@/db/schema";
import { createCustomer } from "@/server/billing";

const customerFormSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  doctorName: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

interface CustomersClientProps {
  initialCustomers: Customer[];
}

export function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      doctorName: "",
      address: "",
    },
  });

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return initialCustomers;
    }
    return initialCustomers.filter((c) => {
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone?.toLowerCase().includes(q);
      const matchDoctor = c.doctorName?.toLowerCase().includes(q);
      return matchName || matchPhone || matchDoctor;
    });
  }, [initialCustomers, searchQuery]);

  const { totalCreditBalance, customersWithCreditCount } = useMemo(() => {
    let creditSum = 0;
    let withCredit = 0;
    for (const c of initialCustomers) {
      if (c.creditBalance > 0) {
        creditSum += c.creditBalance;
        withCredit += 1;
      }
    }
    return {
      totalCreditBalance: creditSum,
      customersWithCreditCount: withCredit,
    };
  }, [initialCustomers]);

  const onSubmit = async (values: z.infer<typeof customerFormSchema>) => {
    setIsLoading(true);
    try {
      const res = await createCustomer(values);
      if (res.success) {
        toast.success("Customer added successfully.");
        setIsOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create customer.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 text-zinc-950 md:p-10">
      {/* Page Title & Add Button */}
      <div className="flex flex-col gap-4 border-zinc-200 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
            Directory & Ledger
          </span>
          <h1 className="mt-1 font-extrabold text-3xl text-zinc-900 tracking-tight">
            Customer Accounts
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            View customer contact records, primary doctors, and credit (Udhar)
            balances.
          </p>
        </div>
        <Button
          className="flex cursor-pointer items-center gap-1.5 bg-black font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="size-4" />
          Add Customer
        </Button>
      </div>

      {/* Customer KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-200 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
              Total Customers
            </span>
            <Users className="size-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-2xl">
              {initialCustomers.length}
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">
              Registered pharmacy buyers
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
              Outstanding Credit (Udhar)
            </span>
            <CreditCard className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-2xl text-amber-900">
              ₹{totalCreditBalance.toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-[10px] text-amber-700">
              Pending payment balance across ledger
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
              Accounts with Udhar
            </span>
            <UserCheck className="size-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="font-extrabold text-2xl">
              {customersWithCreditCount}
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">
              Customers with active credit balances
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Directory Table */}
      <Card className="overflow-hidden border-zinc-200 bg-white shadow-xs">
        <CardHeader className="border-zinc-100 border-b pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-extrabold text-sm text-zinc-900">
                Registered Customers Directory
              </CardTitle>
              <CardDescription>
                Search customer profiles by name, phone, or consulting doctor.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-zinc-400" />
              <Input
                className="border-zinc-200 pl-9 text-xs focus:border-black"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or phone..."
                value={searchQuery}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-zinc-450">
              <Users className="mx-auto mb-2 size-8 text-zinc-300" />
              <p className="font-semibold text-sm text-zinc-800">
                {searchQuery
                  ? "No matching customers found."
                  : "No customers registered yet."}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {searchQuery
                  ? "Try searching with a different name or phone."
                  : "Customers are automatically added during checkout or via the button above."}
              </p>
              {!searchQuery && (
                <Button
                  className="mt-4 bg-black text-white"
                  onClick={() => setIsOpen(true)}
                >
                  + Add Customer
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader className="border-zinc-150 border-b bg-zinc-50/50">
                <TableRow>
                  <TableHead className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Customer
                  </TableHead>
                  <TableHead className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Phone & Email
                  </TableHead>
                  <TableHead className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Consulting Doctor
                  </TableHead>
                  <TableHead className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Credit (Udhar) Balance
                  </TableHead>
                  <TableHead className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Address
                  </TableHead>
                  <TableHead className="text-right font-bold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-150">
                {filteredCustomers.map((c) => {
                  const hasCredit = c.creditBalance > 0;
                  return (
                    <TableRow
                      className="transition-colors hover:bg-zinc-50/30"
                      key={c.id}
                    >
                      <TableCell className="font-bold text-sm text-zinc-950">
                        {c.name}
                      </TableCell>

                      <TableCell className="text-xs text-zinc-700">
                        {c.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="size-3 text-zinc-400" />
                            <span>{c.phone}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400">No phone</span>
                        )}
                        {c.email && (
                          <div className="text-[11px] text-zinc-400">
                            {c.email}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-zinc-600">
                        {c.doctorName ? `Dr. ${c.doctorName}` : "—"}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`rounded px-2 py-0.5 font-bold text-xs ${
                            hasCredit
                              ? "border border-amber-200 bg-amber-50 text-amber-900"
                              : "text-zinc-600"
                          }`}
                        >
                          ₹{c.creditBalance.toLocaleString("en-IN")}
                        </span>
                      </TableCell>

                      <TableCell className="max-w-[180px] truncate text-xs text-zinc-500">
                        {c.address || "—"}
                      </TableCell>

                      <TableCell className="text-right">
                        <Link href="/dashboard/billing">
                          <Button
                            className="cursor-pointer gap-1 border-zinc-200 font-semibold text-[11px] hover:bg-zinc-100"
                            size="sm"
                            variant="outline"
                          >
                            <ReceiptText className="size-3" />
                            <span>Bill</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Customer Modal Dialog */}
      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogContent className="max-w-md border-zinc-200 bg-white">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-lg text-zinc-950">
              Register Customer
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-550">
              Add a customer profile for billing records, tax invoices, and
              credit/Udhar tracking.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              className="space-y-3.5 pt-2"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs text-zinc-700">
                      Customer Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-zinc-200 focus:border-black"
                        placeholder="e.g. Ramesh Patel"
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
                      Phone Number
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
                name="doctorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs text-zinc-700">
                      Consulting Doctor
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-zinc-200 focus:border-black"
                        placeholder="e.g. Dr. Verma"
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
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-zinc-200 focus:border-black"
                        placeholder="e.g. ramesh@example.com"
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs text-zinc-700">
                      Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-zinc-200 focus:border-black"
                        placeholder="e.g. Sector 4, City"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 pt-4">
                <Button
                  className="cursor-pointer border-zinc-200 bg-white"
                  disabled={isLoading}
                  onClick={() => setIsOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  className="cursor-pointer bg-black font-bold text-white hover:bg-zinc-800"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Save Customer"
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
