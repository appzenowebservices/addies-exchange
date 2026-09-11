import { z } from "zod";
import { hash } from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

const safeUser = {
  id: true,
  name: true,
  email: true,
  phone: true,
  city: true,
  avatar: true,
  role: true,
  status: true,
  mode: true,
  canBuy: true,
  canSell: true,
  kycStatus: true,
  badgeType: true,
  totalListings: true,
  totalRevenue: true,
  lastActive: true,
  createdAt: true,
} as const;

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().optional(),
        city: z.string().optional(),
        accountType: z.enum(["buyer", "seller", "both"]).default("buyer"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const email = input.email.toLowerCase().trim();
      const exists = await ctx.db.user.findUnique({ where: { email } });
      if (exists) throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });

      const passwordHash = await hash(input.password, 10);
      const canBuy = input.accountType === "buyer" || input.accountType === "both";
      const canSell = input.accountType === "seller" || input.accountType === "both";
      const avatar = input.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email,
          passwordHash,
          phone: input.phone,
          city: input.city,
          role: "user",
          mode: input.accountType === "buyer" ? "buyer" : "seller",
          canBuy,
          canSell,
          avatar,
          status: "active",
        },
        select: safeUser,
      });
      return user;
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const id = (ctx.session.user as { id: string }).id;
    return ctx.db.user.findUnique({ where: { id }, select: safeUser });
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
        mode: z.enum(["buyer", "seller"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = (ctx.session.user as { id: string }).id;
      return ctx.db.user.update({ where: { id }, data: input, select: safeUser });
    }),

  switchMode: protectedProcedure
    .input(z.object({ mode: z.enum(["buyer", "seller"]) }))
    .mutation(async ({ ctx, input }) => {
      const id = (ctx.session.user as { id: string }).id;
      return ctx.db.user.update({ where: { id }, data: { mode: input.mode }, select: safeUser });
    }),

  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { email: input.email.toLowerCase().trim() } });
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "No account found with this email" });
      // TODO: send reset email via notification system
      return { message: "Reset link sent to your email address" };
    }),
});
