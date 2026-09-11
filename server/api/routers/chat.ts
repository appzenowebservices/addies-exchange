import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";

export const chatRouter = createTRPCRouter({
  myConversations: protectedProcedure.query(async ({ ctx }) => {
    const uid = (ctx.session.user as { id: string }).id;
    const role = (ctx.session.user as { role?: string }).role;
    if (role === "admin") {
      return ctx.db.conversation.findMany({ orderBy: { lastActivity: "desc" }, take: 100 });
    }
    return ctx.db.conversation.findMany({
      where: { OR: [{ user1Id: uid }, { user2Id: uid }] },
      orderBy: { lastActivity: "desc" },
    });
  }),

  all: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.conversation.findMany({ orderBy: { lastActivity: "desc" }, take: 200 });
  }),

  byId: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return ctx.db.conversation.findUnique({ where: { id: input.id } });
  }),

  start: protectedProcedure
    .input(z.object({ otherUserId: z.string(), itemTitle: z.string().optional(), text: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const uid = (ctx.session.user as { id: string }).id;
      const me = await ctx.db.user.findUnique({ where: { id: uid } });
      const other = await ctx.db.user.findUnique({ where: { id: input.otherUserId } });
      const msg = { sender: me?.name ?? "Me", text: input.text, time: new Date().toLocaleString(), flagged: false };
      return ctx.db.conversation.create({
        data: {
          user1: me?.name, user2: other?.name, user1Id: uid, user2Id: input.otherUserId,
          itemTitle: input.itemTitle, status: "clean", messages: [msg],
        },
      });
    }),

  send: protectedProcedure
    .input(z.object({ id: z.string(), text: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const uid = (ctx.session.user as { id: string }).id;
      const me = await ctx.db.user.findUnique({ where: { id: uid } });
      const conv = await ctx.db.conversation.findUnique({ where: { id: input.id } });
      if (!conv) throw new Error("Conversation not found");
      const messages = [...((conv.messages as unknown[] as Record<string, unknown>[]) ?? []), { sender: me?.name ?? "Me", text: input.text, time: new Date().toLocaleString(), flagged: false }];
      return ctx.db.conversation.update({ where: { id: input.id }, data: { messages: messages as never, lastActivity: new Date() } });
    }),

  flag: adminProcedure.input(z.object({ id: z.string(), reason: z.string(), note: z.string().optional() })).mutation(async ({ ctx, input }) => {
    await ctx.db.conversation.update({ where: { id: input.id }, data: { status: "flagged", flagReason: input.reason, adminNote: input.note } });
    return true;
  }),

  block: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.db.conversation.update({ where: { id: input.id }, data: { status: "blocked" } });
    return true;
  }),

  review: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.db.conversation.update({ where: { id: input.id }, data: { status: "reviewed" } });
    return true;
  }),
});
