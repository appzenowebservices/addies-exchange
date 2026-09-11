import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";

const DEFAULT_COMMISSION = {
  applyGST: true,
  applyTDS: false,
  platformFees: { contactReveal: 29, boostFee: 499, featuredFee: 999, badgeGold: 2999, badgeSilver: 1999, badgeBronze: 999 },
};

export const revenueRouter = createTRPCRouter({
  overview: adminProcedure.query(async ({ ctx }) => {
    const txns = await ctx.db.transaction.findMany({ orderBy: { date: "desc" }, take: 100 });
    const total = txns.filter((t) => t.status === "completed").reduce((s, t) => s + t.amount, 0);
    return {
      stats: {
        totalRevenue: total,
        monthRevenue: total,
        todayRevenue: 0,
        pendingPayouts: txns.filter((t) => t.status === "pending").reduce((s, t) => s + t.amount, 0),
        totalTxns: txns.length,
      },
      transactions: txns,
    };
  }),

  transactions: adminProcedure
    .input(z.object({ status: z.string().optional(), type: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.transaction.findMany({
        where: {
          ...(input?.status ? { status: input.status } : {}),
          ...(input?.type ? { type: input.type } : {}),
        },
        orderBy: { date: "desc" },
        take: 200,
      });
    }),

  commissionSettings: adminProcedure.query(async ({ ctx }) => {
    const row = await ctx.db.siteSetting.findUnique({ where: { key: "commission" } });
    if (row) return row.value;
    const cats = await ctx.db.category.findMany();
    return {
      ...DEFAULT_COMMISSION,
      global: DEFAULT_COMMISSION.platformFees,
      categories: cats.map((c) => ({ id: c.id, name: c.name, icon: c.icon, slug: c.slug, commission: c.commission, status: c.status })),
    };
  }),

  saveCommissionSettings: adminProcedure.input(z.object({ settings: z.unknown() })).mutation(async ({ ctx, input }) => {
    await ctx.db.siteSetting.upsert({
      where: { key: "commission" },
      create: { key: "commission", value: (input.settings ?? {}) as never },
      update: { value: (input.settings ?? {}) as never },
    });
    return true;
  }),
});
