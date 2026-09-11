import { createCallerFactory, createTRPCRouter } from "./trpc";
import { authRouter } from "./routers/auth";
import { itemRouter } from "./routers/item";
import { orderRouter } from "./routers/order";
import { userRouter } from "./routers/user";
import { categoryRouter } from "./routers/category";
import { adRouter } from "./routers/ad";
import { kycRouter } from "./routers/kyc";
import { revenueRouter } from "./routers/revenue";
import { reportRouter } from "./routers/report";
import { chatRouter } from "./routers/chat";
import { notificationRouter } from "./routers/notification";
import { cmsRouter, auditRouter } from "./routers/cms";
import { adminRouter } from "./routers/admin";

/**
 * Addies Exchange — primary tRPC router (T3 base).
 * All exchange domain routers are mounted here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  item: itemRouter,
  order: orderRouter,
  user: userRouter,
  category: categoryRouter,
  ad: adRouter,
  kyc: kycRouter,
  revenue: revenueRouter,
  report: reportRouter,
  chat: chatRouter,
  notification: notificationRouter,
  cms: cmsRouter,
  audit: auditRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 */
export const createCaller = createCallerFactory(appRouter);
