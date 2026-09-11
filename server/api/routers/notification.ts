import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";

export const notificationRouter = createTRPCRouter({
  templates: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.notificationTemplate.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  }),

  createTemplate: adminProcedure
    .input(z.object({ name: z.string(), channel: z.string(), trigger: z.string().optional(), status: z.string().default("active"), subject: z.string().optional(), body: z.string() }))
    .mutation(async ({ ctx, input }) => ctx.db.notificationTemplate.create({ data: input })),

  updateTemplate: adminProcedure
    .input(z.object({ id: z.string(), name: z.string().optional(), channel: z.string().optional(), trigger: z.string().optional(), status: z.string().optional(), subject: z.string().optional(), body: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.notificationTemplate.update({ where: { id }, data });
    }),

  deleteTemplate: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.db.notificationTemplate.delete({ where: { id: input.id } });
    return true;
  }),

  logs: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.notificationLog.findMany({ orderBy: { timestamp: "desc" }, take: 100 });
  }),

  send: adminProcedure.input(z.object({ templateId: z.string(), target: z.string() })).mutation(async ({ ctx, input }) => {
    const t = await ctx.db.notificationTemplate.findUnique({ where: { id: input.templateId } });
    if (!t) throw new Error("Template not found");
    const sentCount = Math.floor(Math.random() * 2000) + 100;
    await ctx.db.notificationTemplate.update({ where: { id: t.id }, data: { sentCount: { increment: sentCount } } });
    return ctx.db.notificationLog.create({ data: { templateName: t.name, channel: t.channel, target: input.target, sentCount } });
  }),
});
