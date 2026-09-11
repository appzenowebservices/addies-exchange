import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc";

export const cmsRouter = createTRPCRouter({
  pages: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.cmsPage.findMany({ where: { published: true } });
  }),

  all: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.cmsPage.findMany({ orderBy: { slug: "asc" } });
  }),

  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    return ctx.db.cmsPage.findUnique({ where: { slug: input.slug } });
  }),

  save: adminProcedure
    .input(z.object({
      id: z.string().optional(), slug: z.string(), title: z.string(),
      published: z.boolean().default(false), content: z.string().optional(),
      faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const data = { slug: input.slug, title: input.title, published: input.published, content: input.content, faqs: input.faqs ?? [], lastEdited: new Date() };
      const existing = input.id
        ? await ctx.db.cmsPage.findUnique({ where: { id: input.id } }).catch(() => null)
        : await ctx.db.cmsPage.findUnique({ where: { slug: input.slug } }).catch(() => null);
      let page;
      if (existing) {
        page = await ctx.db.cmsPage.update({ where: { id: existing.id }, data });
      } else {
        page = await ctx.db.cmsPage.create({ data });
      }
      // audit
      const adminId = (ctx.session.user as { id: string }).id;
      const admin = await ctx.db.user.findUnique({ where: { id: adminId } }).catch(() => null);
      await ctx.db.auditLog.create({
        data: { adminId, adminName: admin?.name ?? "Admin", action: "cms_updated", module: "cms", target: page.title, detail: `Page "${page.title}" saved` },
      }).catch(() => undefined);
      return true;
    }),
});

export const auditRouter = createTRPCRouter({
  list: adminProcedure
    .input(z.object({ limit: z.number().default(100) }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.auditLog.findMany({ orderBy: { timestamp: "desc" }, take: input?.limit ?? 100 });
    }),
});
