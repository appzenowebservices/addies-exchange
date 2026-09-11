import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc";

export const adRouter = createTRPCRouter({
  active: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.ad.findMany({ where: { status: "active" }, orderBy: { createdAt: "desc" } });
  }),

  all: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.ad.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  }),

  create: adminProcedure
    .input(z.object({
      title: z.string().min(3), image: z.string().optional(), link: z.string().optional(),
      position: z.string().default("Top Banner"), targetCat: z.string().default("All"),
      targetCity: z.string().optional(), budget: z.number().default(0),
      status: z.string().default("draft"),
    }))
    .mutation(async ({ ctx, input }) => ctx.db.ad.create({ data: input })),

  update: adminProcedure
    .input(z.object({ id: z.string(), title: z.string().optional(), image: z.string().optional(), link: z.string().optional(), position: z.string().optional(), targetCat: z.string().optional(), targetCity: z.string().optional(), budget: z.number().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.ad.update({ where: { id }, data });
    }),

  remove: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.db.ad.delete({ where: { id: input.id } });
    return true;
  }),

  toggleStatus: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const ad = await ctx.db.ad.findUnique({ where: { id: input.id } });
    if (!ad) return null;
    const next = ad.status === "active" ? "paused" : "active";
    await ctx.db.ad.update({ where: { id: input.id }, data: { status: next } });
    return next;
  }),
});
