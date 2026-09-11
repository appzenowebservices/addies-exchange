import { createTRPCRouter, adminProcedure } from "../trpc";

export const adminRouter = createTRPCRouter({
  dashboard: adminProcedure.query(async ({ ctx }) => {
    const [totalUsers, totalListings, activeListings, pendingListings, totalOrders, pendingKYC, openReports] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.item.count(),
      ctx.db.item.count({ where: { status: "active" } }),
      ctx.db.item.count({ where: { status: "pending" } }),
      ctx.db.order.count(),
      ctx.db.kycSubmission.count({ where: { status: "pending" } }),
      ctx.db.report.count({ where: { status: "open" } }),
    ]);
    const revenueAgg = await ctx.db.transaction.aggregate({ _sum: { amount: true } }).catch(() => ({ _sum: { amount: 0 } }));
    const usersByDay = await ctx.db.user.findMany({ select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 500 });
    const byDay = new Map<string, number>();
    for (const u of usersByDay) {
      const d = u.createdAt.toISOString().slice(0, 10);
      byDay.set(d, (byDay.get(d) ?? 0) + 1);
    }
    const dailyUsers = [...byDay.entries()].slice(0, 14).reverse().map(([date, users]) => ({ date, users }));
    const catAgg = await ctx.db.item.groupBy({ by: ["category"], _count: { category: true } }).catch(() => []);
    return {
      totalUsers,
      totalListings,
      activeListings,
      pendingListings,
      soldListings: totalOrders,
      totalRevenue: revenueAgg._sum.amount ?? 0,
      pendingKYC,
      reportedItems: openReports,
      dailyUsers,
      categoryListings: catAgg.map((c, i) => ({ name: c.category, value: c._count.category, color: ["#2181c4", "#f97316", "#8b5cf6", "#ec4899", "#14b8a6", "#eab308"][i % 6] })),
    };
  }),
});
