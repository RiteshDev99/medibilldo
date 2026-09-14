"use server";

import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db/drizzle";
import {
  customer,
  type Invoice,
  invoice,
  invoiceItem,
  medicine,
  medicineBatch,
  user as userTable,
} from "@/db/schema";

export interface ChartDataPoint {
  label: string;
  subLabel?: string;
  amount: number;
  billsCount: number;
}

export interface DashboardChartSeries {
  today: ChartDataPoint[];
  sevenDays: ChartDataPoint[];
  thisMonth: ChartDataPoint[];
  thisYear: ChartDataPoint[];
}

export interface StockAlertItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
}

export interface ExpiryAlertItem {
  id: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  daysRemaining: number;
  stockQuantity: number;
  isExpired: boolean;
}

export interface AdminDashboardData {
  todaySales: number;
  yesterdaySales: number;
  salesGrowthPercent: number;
  todayBillsCount: number;
  averageBillAmount: number;
  todayProfit: number;
  profitMarginPercent: number;
  totalCustomers: number;
  newCustomersThisWeek: number;
  chartSeries: DashboardChartSeries;
  stockAlerts: StockAlertItem[];
  expiryAlerts: ExpiryAlertItem[];
  recentSales: Invoice[];
}

export interface StaffPaymentSummary {
  cash: number;
  upi: number;
  card: number;
  credit: number;
}

export interface StaffDashboardData {
  myBillsToday: number;
  mySalesToday: number;
  averageBillAmount: number;
  paymentsToday: StaffPaymentSummary;
  shiftHourlyBuckets: ChartDataPoint[];
  counterStockAlerts: StockAlertItem[];
  counterExpiryAlerts: ExpiryAlertItem[];
  myRecentBills: Invoice[];
}

export interface StaffPerformanceItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: Date;
  todayBills: number;
  todaySales: number;
  lifetimeBills: number;
  lifetimeSales: number;
  lastActive: Date | null;
}

export interface StaffManagementData {
  totalStaff: number;
  todayStaffSales: number;
  todayStaffBills: number;
  topPerformerName: string | null;
  staffList: StaffPerformanceItem[];
}

function getStartOfDay(d: Date = new Date()): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getEndOfDay(d: Date = new Date()): Date {
  const date = new Date(d);
  date.setHours(23, 59, 59, 999);
  return date;
}

async function fetchSalesMetrics(storeId: string, now: Date) {
  const todayStart = getStartOfDay(now);
  const todayEnd = getEndOfDay(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = getStartOfDay(yesterday);
  const yesterdayEnd = getEndOfDay(yesterday);

  const [todayInvoices, yesterdayInvoices] = await Promise.all([
    db.query.invoice.findMany({
      where: and(
        eq(invoice.storeId, storeId),
        gte(invoice.createdAt, todayStart),
        lte(invoice.createdAt, todayEnd)
      ),
      orderBy: [desc(invoice.createdAt)],
    }),
    db.query.invoice.findMany({
      where: and(
        eq(invoice.storeId, storeId),
        gte(invoice.createdAt, yesterdayStart),
        lte(invoice.createdAt, yesterdayEnd)
      ),
    }),
  ]);

  const todaySales = todayInvoices.reduce(
    (sum, inv) => sum + (inv.grandTotal || 0),
    0
  );
  const todayBillsCount = todayInvoices.length;
  const averageBillAmount =
    todayBillsCount > 0 ? Math.round(todaySales / todayBillsCount) : 0;

  const yesterdaySales = yesterdayInvoices.reduce(
    (sum, inv) => sum + (inv.grandTotal || 0),
    0
  );

  let salesGrowthPercent = 0;
  if (yesterdaySales > 0) {
    salesGrowthPercent = Math.round(
      ((todaySales - yesterdaySales) / yesterdaySales) * 100
    );
  } else if (todaySales > 0) {
    salesGrowthPercent = 100;
  }

  return {
    todayInvoices,
    todaySales,
    todayBillsCount,
    averageBillAmount,
    yesterdaySales,
    salesGrowthPercent,
  };
}

async function calculateTodayProfit(
  todayInvoices: Invoice[],
  todaySales: number
) {
  if (todayInvoices.length === 0) {
    return { todayProfit: 0, profitMarginPercent: 0 };
  }

  const invoiceIds = todayInvoices.map((inv) => inv.id);
  const todayItems = await db.query.invoiceItem.findMany({
    where: inArray(invoiceItem.invoiceId, invoiceIds),
  });

  if (todayItems.length === 0) {
    return { todayProfit: 0, profitMarginPercent: 0 };
  }

  const medIds = Array.from(
    new Set(todayItems.map((i) => i.medicineId).filter(Boolean) as string[])
  );
  const batchIds = Array.from(
    new Set(todayItems.map((i) => i.batchId).filter(Boolean) as string[])
  );

  const [itemMeds, itemBatches] = await Promise.all([
    medIds.length > 0
      ? db.query.medicine.findMany({ where: inArray(medicine.id, medIds) })
      : [],
    batchIds.length > 0
      ? db.query.medicineBatch.findMany({
          where: inArray(medicineBatch.id, batchIds),
        })
      : [],
  ]);

  const medMap = new Map(itemMeds.map((m) => [m.id, m]));
  const batchMap = new Map(itemBatches.map((b) => [b.id, b]));

  let rawProfit = 0;
  for (const item of todayItems) {
    const itemBatch = item.batchId ? batchMap.get(item.batchId) : undefined;
    const itemMed = item.medicineId ? medMap.get(item.medicineId) : undefined;
    const purchaseRate =
      itemBatch?.purchaseRate ?? itemMed?.pRate ?? itemMed?.cost ?? 0;

    const convFactor = item.conversionFactor || 1;
    const unitCost = purchaseRate > 0 ? purchaseRate / convFactor : 0;
    const cogs = unitCost * (item.quantity || 0);
    const itemRevenue = item.total || 0;
    rawProfit += itemRevenue - cogs;
  }

  const todayProfit = Math.max(0, Math.round(rawProfit));
  const profitMarginPercent =
    todaySales > 0 ? Number(((todayProfit / todaySales) * 100).toFixed(1)) : 0;

  return { todayProfit, profitMarginPercent };
}

async function fetchCustomerMetrics(storeId: string, now: Date) {
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysStart = getStartOfDay(sevenDaysAgo);

  const [totalCustResult, newCustResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(customer)
      .where(eq(customer.storeId, storeId)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(customer)
      .where(
        and(
          eq(customer.storeId, storeId),
          gte(customer.createdAt, sevenDaysStart)
        )
      ),
  ]);

  return {
    totalCustomers: Number(totalCustResult[0]?.count || 0),
    newCustomersThisWeek: Number(newCustResult[0]?.count || 0),
  };
}

function buildTodayChartSeries(todayInvoices: Invoice[]): ChartDataPoint[] {
  const todayBuckets: ChartDataPoint[] = [
    { label: "8-11 AM", amount: 0, billsCount: 0 },
    { label: "11-2 PM", amount: 0, billsCount: 0 },
    { label: "2-5 PM", amount: 0, billsCount: 0 },
    { label: "5-8 PM", amount: 0, billsCount: 0 },
    { label: "8-11 PM", amount: 0, billsCount: 0 },
  ];

  for (const inv of todayInvoices) {
    const hour = new Date(inv.createdAt).getHours();
    let idx = 0;
    if (hour >= 11 && hour < 14) {
      idx = 1;
    } else if (hour >= 14 && hour < 17) {
      idx = 2;
    } else if (hour >= 17 && hour < 20) {
      idx = 3;
    } else if (hour >= 20) {
      idx = 4;
    }
    todayBuckets[idx].amount += inv.grandTotal;
    todayBuckets[idx].billsCount += 1;
  }

  return todayBuckets;
}

function buildSevenDaysChartSeries(
  yearInvoices: Invoice[],
  now: Date
): ChartDataPoint[] {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const sevenDayBuckets: ChartDataPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - i);
    const dayLabel = dayNames[targetDate.getDay()];
    const subLabel = targetDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    const dStart = getStartOfDay(targetDate);
    const dEnd = getEndOfDay(targetDate);

    const matches = yearInvoices.filter((inv) => {
      const invDate = new Date(inv.createdAt);
      return invDate >= dStart && invDate <= dEnd;
    });

    const total = matches.reduce((sum, inv) => sum + inv.grandTotal, 0);

    sevenDayBuckets.push({
      label: dayLabel,
      subLabel,
      amount: Math.round(total),
      billsCount: matches.length,
    });
  }

  return sevenDayBuckets;
}

function buildMonthAndYearChartSeries(yearInvoices: Invoice[], now: Date) {
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthBuckets: ChartDataPoint[] = [
    { label: "Week 1 (1-7)", amount: 0, billsCount: 0 },
    { label: "Week 2 (8-14)", amount: 0, billsCount: 0 },
    { label: "Week 3 (15-21)", amount: 0, billsCount: 0 },
    { label: "Week 4 (22-End)", amount: 0, billsCount: 0 },
  ];

  const thisMonthInvoices = yearInvoices.filter(
    (inv) => new Date(inv.createdAt) >= startOfMonth
  );

  for (const inv of thisMonthInvoices) {
    const dayOfMonth = new Date(inv.createdAt).getDate();
    let wIdx = 3;
    if (dayOfMonth <= 7) {
      wIdx = 0;
    } else if (dayOfMonth <= 14) {
      wIdx = 1;
    } else if (dayOfMonth <= 21) {
      wIdx = 2;
    }

    monthBuckets[wIdx].amount += inv.grandTotal;
    monthBuckets[wIdx].billsCount += 1;
  }

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const yearBuckets: ChartDataPoint[] = monthNames.map((name) => ({
    label: name,
    amount: 0,
    billsCount: 0,
  }));

  for (const inv of yearInvoices) {
    const invMonth = new Date(inv.createdAt).getMonth();
    yearBuckets[invMonth].amount += inv.grandTotal;
    yearBuckets[invMonth].billsCount += 1;
  }

  return { monthBuckets, yearBuckets };
}

async function fetchInventoryAlerts(storeId: string, now: Date) {
  const [allMeds, allBatches] = await Promise.all([
    db.query.medicine.findMany({
      where: and(eq(medicine.storeId, storeId), eq(medicine.status, "ACTIVE")),
    }),
    db.query.medicineBatch.findMany({
      where: eq(medicineBatch.storeId, storeId),
    }),
  ]);

  const stockMap = new Map<string, number>();
  for (const b of allBatches) {
    if (b.stockQuantity > 0) {
      stockMap.set(
        b.medicineId,
        (stockMap.get(b.medicineId) || 0) + b.stockQuantity
      );
    }
  }

  const stockAlerts: StockAlertItem[] = [];
  for (const med of allMeds) {
    const currentStock = stockMap.get(med.id) || 0;
    const threshold = med.reorderLevel ?? med.minimumQuantity ?? 10;
    if (currentStock <= threshold) {
      stockAlerts.push({
        id: med.id,
        name: med.name,
        category: med.category || "General",
        currentStock,
        reorderLevel: threshold,
      });
    }
  }
  stockAlerts.sort((a, b) => a.currentStock - b.currentStock);

  const fortyFiveDays = new Date(now);
  fortyFiveDays.setDate(fortyFiveDays.getDate() + 45);

  const nearExpiryBatches = allBatches.filter(
    (b) => b.stockQuantity > 0 && new Date(b.expiryDate) <= fortyFiveDays
  );
  nearExpiryBatches.sort(
    (a, b) =>
      new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  const medMap = new Map(allMeds.map((m) => [m.id, m]));
  const expiryAlerts: ExpiryAlertItem[] = nearExpiryBatches
    .slice(0, 6)
    .map((b) => {
      const med = medMap.get(b.medicineId);
      const expDate = new Date(b.expiryDate);
      const diffTime = expDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: b.id,
        medicineName: med?.name || "Medicine",
        batchNumber: b.batchNumber,
        expiryDate: expDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        daysRemaining,
        stockQuantity: b.stockQuantity,
        isExpired: daysRemaining <= 0,
      };
    });

  return {
    stockAlerts: stockAlerts.slice(0, 6),
    expiryAlerts,
  };
}

export async function getAdminDashboardData(
  storeId: string
): Promise<AdminDashboardData> {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    salesMetrics,
    customerMetrics,
    yearInvoices,
    inventoryAlerts,
    recentSales,
  ] = await Promise.all([
    fetchSalesMetrics(storeId, now),
    fetchCustomerMetrics(storeId, now),
    db.query.invoice.findMany({
      where: and(
        eq(invoice.storeId, storeId),
        gte(invoice.createdAt, startOfYear)
      ),
      orderBy: [invoice.createdAt],
    }),
    fetchInventoryAlerts(storeId, now),
    db.query.invoice.findMany({
      where: eq(invoice.storeId, storeId),
      orderBy: [desc(invoice.createdAt)],
      limit: 6,
    }),
  ]);

  const { todayProfit, profitMarginPercent } = await calculateTodayProfit(
    salesMetrics.todayInvoices,
    salesMetrics.todaySales
  );

  const todayBuckets = buildTodayChartSeries(salesMetrics.todayInvoices);
  const sevenDayBuckets = buildSevenDaysChartSeries(yearInvoices, now);
  const { monthBuckets, yearBuckets } = buildMonthAndYearChartSeries(
    yearInvoices,
    now
  );

  return {
    todaySales: salesMetrics.todaySales,
    yesterdaySales: salesMetrics.yesterdaySales,
    salesGrowthPercent: salesMetrics.salesGrowthPercent,
    todayBillsCount: salesMetrics.todayBillsCount,
    averageBillAmount: salesMetrics.averageBillAmount,
    todayProfit,
    profitMarginPercent,
    totalCustomers: customerMetrics.totalCustomers,
    newCustomersThisWeek: customerMetrics.newCustomersThisWeek,
    chartSeries: {
      today: todayBuckets,
      sevenDays: sevenDayBuckets,
      thisMonth: monthBuckets,
      thisYear: yearBuckets,
    },
    stockAlerts: inventoryAlerts.stockAlerts,
    expiryAlerts: inventoryAlerts.expiryAlerts,
    recentSales,
  };
}

export async function getStaffDashboardData(
  storeId: string,
  userId: string
): Promise<StaffDashboardData> {
  const now = new Date();
  const todayStart = getStartOfDay(now);
  const todayEnd = getEndOfDay(now);

  const [todayStaffInvoices, recentStaffInvoices, inventoryAlerts] =
    await Promise.all([
      db.query.invoice.findMany({
        where: and(
          eq(invoice.storeId, storeId),
          eq(invoice.createdBy, userId),
          gte(invoice.createdAt, todayStart),
          lte(invoice.createdAt, todayEnd)
        ),
        orderBy: [desc(invoice.createdAt)],
      }),
      db.query.invoice.findMany({
        where: and(eq(invoice.storeId, storeId), eq(invoice.createdBy, userId)),
        orderBy: [desc(invoice.createdAt)],
        limit: 10,
      }),
      fetchInventoryAlerts(storeId, now),
    ]);

  const myBillsToday = todayStaffInvoices.length;
  const mySalesToday = todayStaffInvoices.reduce(
    (sum, inv) => sum + (inv.grandTotal || 0),
    0
  );
  const averageBillAmount =
    myBillsToday > 0 ? Math.round(mySalesToday / myBillsToday) : 0;

  // Breakdown by payment mode for shift cash drawer reconciliation
  let cash = 0;
  let upi = 0;
  let card = 0;
  let credit = 0;

  for (const inv of todayStaffInvoices) {
    const amt = inv.grandTotal || 0;
    if (inv.paymentMode === "CASH") {
      cash += amt;
    } else if (inv.paymentMode === "UPI") {
      upi += amt;
    } else if (inv.paymentMode === "CARD") {
      card += amt;
    } else if (inv.paymentMode === "CREDIT") {
      credit += amt;
    }
  }

  const shiftHourlyBuckets = buildTodayChartSeries(todayStaffInvoices);

  return {
    myBillsToday,
    mySalesToday,
    averageBillAmount,
    paymentsToday: { cash, upi, card, credit },
    shiftHourlyBuckets,
    counterStockAlerts: inventoryAlerts.stockAlerts.slice(0, 4),
    counterExpiryAlerts: inventoryAlerts.expiryAlerts.slice(0, 4),
    myRecentBills: recentStaffInvoices,
  };
}

export async function getStaffManagementData(
  storeId: string
): Promise<StaffManagementData> {
  const now = new Date();
  const todayStart = getStartOfDay(now);
  const todayEnd = getEndOfDay(now);

  const [staffUsers, storeInvoices] = await Promise.all([
    db.query.user.findMany({
      where: and(eq(userTable.storeId, storeId), eq(userTable.role, "STAFF")),
      orderBy: [desc(userTable.createdAt)],
    }),
    db.query.invoice.findMany({
      where: eq(invoice.storeId, storeId),
      orderBy: [desc(invoice.createdAt)],
    }),
  ]);

  let todayStaffSales = 0;
  let todayStaffBills = 0;
  let topSalesAmount = 0;
  let topPerformerName: string | null = null;

  const staffList: StaffPerformanceItem[] = staffUsers.map((member) => {
    const memberInvoices = storeInvoices.filter(
      (inv) => inv.createdBy === member.id
    );

    const lifetimeBills = memberInvoices.length;
    const lifetimeSales = memberInvoices.reduce(
      (sum, inv) => sum + (inv.grandTotal || 0),
      0
    );

    const todayInvoices = memberInvoices.filter((inv) => {
      const invDate = new Date(inv.createdAt);
      return invDate >= todayStart && invDate <= todayEnd;
    });

    const todayBills = todayInvoices.length;
    const todaySales = todayInvoices.reduce(
      (sum, inv) => sum + (inv.grandTotal || 0),
      0
    );

    todayStaffSales += todaySales;
    todayStaffBills += todayBills;

    if (todaySales > topSalesAmount) {
      topSalesAmount = todaySales;
      topPerformerName = member.name;
    }

    const lastActive =
      memberInvoices.length > 0 ? new Date(memberInvoices[0].createdAt) : null;

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      phone: null,
      role: member.role,
      createdAt: member.createdAt,
      todayBills,
      todaySales,
      lifetimeBills,
      lifetimeSales,
      lastActive,
    };
  });

  // Sort staff members by today's sales DESC, then lifetime sales DESC
  staffList.sort((a, b) => {
    if (b.todaySales !== a.todaySales) {
      return b.todaySales - a.todaySales;
    }
    return b.lifetimeSales - a.lifetimeSales;
  });

  return {
    totalStaff: staffUsers.length,
    todayStaffSales,
    todayStaffBills,
    topPerformerName,
    staffList,
  };
}
