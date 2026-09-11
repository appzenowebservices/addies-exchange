import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc";

export const categoryRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({ include: { subcategories: true }, orderBy: { displayOrder: "asc" } });
  }),

  all: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({ include: { subcategories: true }, orderBy: { displayOrder: "asc" } });
  }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(2), icon: z.string().optional(), slug: z.string().min(2),
      commission: z.number().default(5), minFee: z.number().default(20), maxFee: z.number().default(2000),
      displayOrder: z.number().default(0), status: z.string().default("active"),
      attributes: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.create({ data: { ...input, active: input.status === "active" } });
    }),

  update: adminProcedure
    .input(z.object({ id: z.string(), name: z.string().optional(), icon: z.string().optional(), slug: z.string().optional(), commission: z.number().optional(), minFee: z.number().optional(), maxFee: z.number().optional(), displayOrder: z.number().optional(), status: z.string().optional(), attributes: z.array(z.string()).optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, status, ...data } = input;
      return ctx.db.category.update({ where: { id }, data: { ...data, ...(status ? { status, active: status === "active" } : {}) } });
    }),

  remove: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.db.category.delete({ where: { id: input.id } });
    return true;
  }),

  addSub: adminProcedure
    .input(z.object({ categoryId: z.string(), name: z.string(), icon: z.string().optional(), slug: z.string(), status: z.string().default("active") }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.subcategory.create({ data: input });
    }),

  updateSub: adminProcedure
    .input(z.object({ id: z.string(), name: z.string().optional(), icon: z.string().optional(), slug: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.subcategory.update({ where: { id }, data });
    }),

  removeSub: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.db.subcategory.delete({ where: { id: input.id } });
    return true;
  }),
});
