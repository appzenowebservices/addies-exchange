import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from "../trpc";

export const itemRouter = createTRPCRouter({
  // Public marketplace feed
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        city: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        status: z.string().optional().default("active"),
        limit: z.number().min(1).max(100).default(50),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = { status: input?.status ?? "active" };
      if (input?.category && input.category !== "all") where.category = input.category;
      if (input?.city) where.city = { contains: input.city, mode: "insensitive" };
      if (input?.minPrice !== undefined || input?.maxPrice !== undefined) {
        where.price = {
          ...(input.minPrice !== undefined ? { gte: input.minPrice } : {}),
          ...(input.maxPrice !== undefined ? { lte: input.maxPrice } : {}),
        };
      }
      if (input?.search) {
        where.OR = [
          { title: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ];
      }
      return ctx.db.item.findMany({
        where: where as never,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: input?.limit ?? 50,
      });
    }),

  byId: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const item = await ctx.db.item.findUnique({ where: { id: input.id } });
    if (!item) throw new Error("Item not found");
    // bump views (fire & forget)
    void ctx.db.item.update({ where: { id: input.id }, data: { views: { increment: 1 } } }).catch(() => undefined);
    return item;
  }),

  myListings: protectedProcedure.query(async ({ ctx }) => {
    const sellerId = (ctx.session.user as { id: string }).id;
    return ctx.db.item.findMany({ where: { sellerId }, orderBy: { createdAt: "desc" } });
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().min(10),
        price: z.number().positive(),
        category: z.string().default("Other"),
        condition: z.string().default("Good"),
        city: z.string().optional(),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sellerId = (ctx.session.user as { id: string }).id;
      const seller = await ctx.db.user.findUnique({ where: { id: sellerId } });
      const item = await ctx.db.item.create({
        data: {
          ...input,
          sellerId,
          sellerName: seller?.name,
          status: "pending",
          views: 0,
        },
      });
      await ctx.db.user.update({ where: { id: sellerId }, data: { totalListings: { increment: 1 } } }).catch(() => undefined);
      return item;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string().optional(), description: z.string().optional(), price: z.number().positive().optional(), category: z.string().optional(), condition: z.string().optional(), city: z.string().optional(), image: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.item.update({ where: { id }, data });
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.item.delete({ where: { id: input.id } }).catch(() => undefined);
      return { success: true };
    }),

  // ── Admin ──
  all: adminProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.item.findMany({
        where: input?.status ? { status: input.status } : {},
        orderBy: { createdAt: "desc" },
        take: 200,
      });
    }),

  approve: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.item.update({ where: { id: input.id }, data: { status: "active" } });
  }),

  reject: adminProcedure
    .input(z.object({ id: z.string(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.item.update({ where: { id: input.id }, data: { status: "rejected", rejectReason: input.reason ?? "Policy violation" } });
    }),

  toggleFeatured: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const item = await ctx.db.item.findUnique({ where: { id: input.id } });
    if (!item) return false;
    await ctx.db.item.update({ where: { id: input.id }, data: { featured: !item.featured } });
    return !item.featured;
  }),

  setStatus: adminProcedure
    .input(z.object({ id: z.string(), status: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.item.update({ where: { id: input.id }, data: { status: input.status } });
      return true;
    }),
});
