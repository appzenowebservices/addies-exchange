import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";

export const orderRouter = createTRPCRouter({
  myOrders: protectedProcedure.query(async ({ ctx }) => {
    const uid = (ctx.session.user as { id: string }).id;
    return ctx.db.order.findMany({
      where: { OR: [{ buyerId: uid }, { sellerId: uid }] },
      orderBy: { date: "desc" },
    });
  }),

  place: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const buyerId = (ctx.session.user as { id: string }).id;
      const item = await ctx.db.item.findUnique({ where: { id: input.itemId } });
      if (!item) throw new Error("Item not found");
      return ctx.db.order.create({
        data: {
          itemId: item.id,
          buyerId,
          sellerId: item.sellerId,
          itemTitle: item.title,
          price: item.price,
          status: "pending",
        },
      });
    }),

  all: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.order.findMany({ orderBy: { date: "desc" }, take: 200 });
  }),

  setStatus: adminProcedure
    .input(z.object({ id: z.string(), status: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.order.update({ where: { id: input.id }, data: { status: input.status } });
    }),
});
