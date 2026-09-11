import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";

export const reportRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      type: z.enum(["item", "user"]), targetTitle: z.string(),
      targetEmail: z.string().optional(), sellerName: z.string().optional(),
      reason: z.string(), evidence: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const reporter = await ctx.db.user.findUnique({ where: { id: (ctx.session.user as { id: string }).id } });
      return ctx.db.report.create({
        data: {
          type: input.type, status: "open",
          reporterName: reporter?.name, reporterEmail: reporter?.email,
          targetTitle: input.targetTitle, targetEmail: input.targetEmail,
          sellerName: input.sellerName, reason: input.reason, evidence: input.evidence,
        },
      });
    }),

  all: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.report.findMany({ orderBy: { date: "desc" }, take: 200 });
  }),

  moderate: adminProcedure
    .input(z.object({ id: z.string(), action: z.string(), note: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.db.report.findUnique({ where: { id: input.id } });
      if (!report) return false;
      if (["resolved", "reviewed", "dismissed"].includes(input.action)) {
        await ctx.db.report.update({ where: { id: input.id }, data: { status: input.action, adminNote: input.note } });
      }
      if (input.action === "remove_item" && report.targetTitle) {
        await ctx.db.item.deleteMany({ where: { title: report.targetTitle } });
        await ctx.db.report.update({ where: { id: input.id }, data: { status: "resolved", adminNote: input.note ?? "Item removed by admin." } });
      }
      if (input.action === "ban_user" && (report.targetEmail || report.targetTitle)) {
        const user = await ctx.db.user.findFirst({
          where: report.targetEmail ? { email: report.targetEmail } : { name: report.targetTitle ?? "" },
        });
        if (user) await ctx.db.user.update({ where: { id: user.id }, data: { status: "banned" } });
        await ctx.db.report.update({ where: { id: input.id }, data: { status: "resolved", adminNote: input.note ?? "User banned by admin." } });
      }
      return true;
    }),
});
