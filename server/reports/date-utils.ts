import type { DateRangeOptions } from "./types";

export function resolveDateRange(options: DateRangeOptions): {
  start: Date;
  end: Date;
  label: string;
} {
  const now = new Date();

  switch (options.preset) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: `Today (${now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })})`,
      };
    }
    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const start = new Date(yesterday);
      start.setHours(0, 0, 0, 0);
      const end = new Date(yesterday);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: `Yesterday (${yesterday.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })})`,
      };
    }
    case "7days": {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: `Last 7 Days (${start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("en-IN", { day: "numeric", month: "short" })})`,
      };
    }
    case "thisMonth": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: `This Month (${now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })})`,
      };
    }
    case "lastMonth": {
      const start = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
        0,
        0,
        0,
        0
      );
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999
      );
      return {
        start,
        end,
        label: `Last Month (${start.toLocaleDateString("en-IN", { month: "long", year: "numeric" })})`,
      };
    }
    case "thisYear": {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: `This Year (${now.getFullYear()})`,
      };
    }
    case "custom": {
      if (options.startDate && options.endDate) {
        const [sYear, sMonth, sDay] = options.startDate.split("-").map(Number);
        const [eYear, eMonth, eDay] = options.endDate.split("-").map(Number);
        const start = new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0);
        const end = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999);
        return {
          start,
          end,
          label: `${start.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} - ${end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
        };
      }
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: `This Month (${now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })})`,
      };
    }
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: `This Month (${now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })})`,
      };
    }
  }
}
