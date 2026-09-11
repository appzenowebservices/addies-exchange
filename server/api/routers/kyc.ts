import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";

export const kycRouter = createTRPCRouter({
  submit: protectedProcedure
    .input(z.object({
      idType: z.string(), idNumber: z.string(), nameOnId: z.string(),
      dob: z.string().optional(), documents: z.array(z.object({ label: z.string(), icon: z.string().optional(), size: z.string().optional(), type: z.string().optional() })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const uid = (ctx.session.user as { id: string }).id;
      const me = await ctx.db.user.findUnique({ where: { id: uid } });
      const existing = await ctx.db.kycSubmission.findFirst({ where: { userId: uid, status: "pending" } });
      if (existing) return existing;
      const kyc = await ctx.db.kycSubmission.create({
        data: {
          userId: uid, userName: me?.name ?? "User", email: me?.email ?? "",
          idType: input.idType, idNumber: input.idNumber, nameOnId: input.nameOnId,
          dob: input.dob, documents: input.documents ?? [], status: "pending",
        },
      });
      await ctx.db.user.update({ where: { id: uid }, data: { kycStatus: "pending" } }).catch(() => undefined);
      return kyc;
    }),

  myStatus: protectedProcedure.query(async ({ ctx }) => {
    const uid = (ctx.session.user as { id: string }).id;
    return ctx.db.kycSubmission.findMany({ where: { userId: uid }, orderBy: { submittedDate: "desc" }, take: 5 });
  }),

  all: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.kycSubmission.findMany({ orderBy: { submittedDate: "desc" }, take: 200 });
  }),

  approve: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const kyc = await ctx.db.kycSubmission.update({ where: { id: input.id }, data: { status: "approved", rejectReason: null } });
    await ctx.db.user.update({ where: { id: kyc.userId }, data: { kycStatus: "verified" } }).catch(() => undefined);
    return true;
  }),

  reject: adminProcedure.input(z.object({ id: z.string(), reason: z.string() })).mutation(async ({ ctx, input }) => {
    const kyc = await ctx.db.kycSubmission.update({ where: { id: input.id }, data: { status: "rejected", rejectReason: input.reason } });
    await ctx.db.user.update({ where: { id: kyc.userId }, data: { kycStatus: "rejected" } }).catch(() => undefined);
    return true;
  }),
});
