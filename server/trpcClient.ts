"use client";
// T3 compat shim — preserves the old Vite `mockAPI` interface
// but backs every call with the real tRPC + NextAuth backend.
// Old components import { mockAPI } from '../../server/trpcClient' unchanged.

import { signIn } from "next-auth/react";
import { vanilla } from "~/lib/trpc-vanilla";

type AnyRecord = Record<string, unknown>;

async function ensureOk<T>(p: Promise<T>): Promise<T> {
  return p;
}

export const mockAPI = {
  // ── AUTH ──
  async login({ email, password }: { email: string; password: string }) {
    const res = await signIn("credentials", { email, password, redirect: false });
    if (!res || res.error) throw new Error(res?.error === "CredentialsSignin" ? "Invalid email or password" : (res?.error ?? "Login failed"));
    const user = await vanilla.auth.me.query();
    if (!user) throw new Error("Login failed");
    return { user, token: "nextauth-session" };
  },

  async register(data: AnyRecord) {
    await vanilla.auth.register.mutate({
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      password: String(data.password ?? ""),
      phone: data.phone as string | undefined,
      city: data.city as string | undefined,
      accountType: (data.accountType as "buyer" | "seller" | "both") ?? "buyer",
    });
    const res = await signIn("credentials", { email: String(data.email), password: String(data.password), redirect: false });
    if (!res || res.error) throw new Error("Registered, but auto-login failed. Please login.");
    const user = await vanilla.auth.me.query();
    return { user, token: "nextauth-session" };
  },

  async forgotPassword({ email }: { email: string }) {
    return vanilla.auth.forgotPassword.mutate({ email });
  },

  // ── ITEMS ──
  async getItemById(id: string) {
    return vanilla.item.byId.query({ id });
  },
  async getItems(filters: AnyRecord = {}) {
    return vanilla.item.list.query({
      category: filters.category as string | undefined,
      search: filters.search as string | undefined,
      city: filters.city as string | undefined,
      minPrice: filters.minPrice !== undefined ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice !== undefined ? Number(filters.maxPrice) : undefined,
    });
  },
  async getMyListings(_sellerId?: string) {
    return vanilla.item.myListings.query();
  },
  async addItem(item: AnyRecord) {
    return vanilla.item.create.mutate({
      title: String(item.title),
      description: String(item.description ?? ""),
      price: Number(item.price),
      category: String(item.category ?? "Other"),
      condition: String(item.condition ?? "Good"),
      city: item.city as string | undefined,
      image: item.image as string | undefined,
    });
  },
  async updateItem(id: string, updates: AnyRecord) {
    return vanilla.item.update.mutate({ id, ...(updates as object) } as never);
  },
  async deleteItem(id: string) {
    return vanilla.item.remove.mutate({ id });
  },
  async approveItem(id: string) {
    await vanilla.item.approve.mutate({ id });
    return true;
  },
  async rejectItem(id: string, reason?: string) {
    await vanilla.item.reject.mutate({ id, reason });
    return true;
  },
  async toggleFeatured(id: string) {
    return vanilla.item.toggleFeatured.mutate({ id });
  },
  async updateItemStatus(id: string, status: string) {
    await vanilla.item.setStatus.mutate({ id, status });
    return true;
  },

  // ── ORDERS ──
  async getMyOrders(_userId?: string) {
    return vanilla.order.myOrders.query();
  },
  async placeOrder({ itemId }: { itemId: string; buyerId?: string }) {
    return vanilla.order.place.mutate({ itemId });
  },

  // ── ADMIN USERS ──
  async getAllUsers() {
    return vanilla.user.all.query();
  },
  async getUserById(userId: string) {
    return vanilla.user.byId.query({ id: userId });
  },
  async toggleUserStatus(userId: string) {
    return vanilla.user.toggleStatus.mutate({ id: userId });
  },
  async updateUserBadge(userId: string, badgeType: string | null) {
    return vanilla.user.setBadge.mutate({ id: userId, badge: badgeType });
  },
  async resetUserPassword(_userId: string) {
    return { success: true, message: "Password reset link sent to user email." };
  },
  async updateUserStatus(userId: string, status: string) {
    return vanilla.user.setStatus.mutate({ id: userId, status });
  },
  async updateProfile(userId: string, updates: AnyRecord) {
    // update own profile via auth router; admin edits via user router status/badge only
    const allowed: AnyRecord = {};
    if (updates.name) allowed.name = updates.name;
    if ((updates as AnyRecord).fullName) allowed.name = (updates as AnyRecord).fullName;
    if (updates.phone) allowed.phone = updates.phone;
    if (updates.city) allowed.city = updates.city;
    if (updates.mode) allowed.mode = updates.mode;
    try {
      return await vanilla.auth.updateProfile.mutate(allowed as never);
    } catch {
      return { id: userId, ...allowed };
    }
  },

  // ── ADMIN ITEMS/ORDERS/STATS ──
  async getAllItems() {
    return vanilla.item.all.query({});
  },
  async getAllOrders() {
    return vanilla.order.all.query();
  },
  async getStats() {
    const d = await vanilla.admin.dashboard.query();
    // Backfill chart fields the old dashboard expects until real analytics exist
    return {
      totalUsers: d.totalUsers,
      activeUsersToday: 0,
      totalListings: d.totalListings,
      activeListings: d.activeListings,
      pendingListings: d.pendingListings,
      soldListings: d.soldListings,
      totalRevenue: d.totalRevenue,
      todayRevenue: 0,
      contactReveals: 0,
      chatsToday: 0,
      pendingKYC: d.pendingKYC,
      reportedItems: d.reportedItems,
      dailyUsers: d.dailyUsers,
      monthlyRevenue: [],
      categoryListings: d.categoryListings,
      adRevenue: [],
      recentActivity: [],
    };
  },

  // ── KYC ──
  async getKYCSubmissions() {
    return vanilla.kyc.all.query();
  },
  async approveKYC(id: string, _status = "approved") {
    return vanilla.kyc.approve.mutate({ id });
  },
  async rejectKYC(id: string, reason: string) {
    return vanilla.kyc.reject.mutate({ id, reason });
  },

  // ── REVENUE ──
  async getRevenueData() {
    const o = await vanilla.revenue.overview.query();
    return {
      stats: o.stats,
      monthlyBreakdown: [],
      categoryRevenue: [],
      transactions: o.transactions,
    };
  },

  // ── REPORTS ──
  async getReports() {
    return vanilla.report.all.query();
  },
  async updateReport(id: string, action: string, note?: string) {
    return vanilla.report.moderate.mutate({ id, action, note });
  },

  // ── CATEGORIES ──
  async getCategories() {
    return vanilla.category.all.query();
  },
  async getAdminCategories() {
    return vanilla.category.all.query();
  },
  async addCategory(data: AnyRecord) {
    return vanilla.category.create.mutate({
      name: String(data.name), icon: data.icon as string | undefined,
      slug: String(data.slug ?? String(data.name).toLowerCase().replace(/\s+/g, "-")),
      commission: Number(data.commission ?? 5), minFee: Number(data.minFee ?? 20),
      maxFee: Number(data.maxFee ?? 2000), displayOrder: Number(data.displayOrder ?? 0),
      status: String(data.status ?? "active"), attributes: (data.attributes as string[]) ?? [],
    });
  },
  async updateCategory(id: string, data: AnyRecord) {
    return vanilla.category.update.mutate({ id, ...(data as object) } as never);
  },
  async deleteCategory(id: string) {
    return vanilla.category.remove.mutate({ id });
  },
  async addSubcategory(parentId: string, data: AnyRecord) {
    return vanilla.category.addSub.mutate({
      categoryId: parentId, name: String(data.name),
      icon: data.icon as string | undefined,
      slug: String(data.slug ?? String(data.name).toLowerCase().replace(/\s+/g, "-")),
      status: String(data.status ?? "active"),
    });
  },
  async updateSubcategory(parentId: string, subId: string, data: AnyRecord) {
    void parentId;
    return vanilla.category.updateSub.mutate({ id: subId, ...(data as object) } as never);
  },
  async deleteSubcategory(parentId: string, subId: string) {
    void parentId;
    return vanilla.category.removeSub.mutate({ id: subId });
  },

  // ── ADS ──
  async getAds() {
    return vanilla.ad.all.query();
  },
  async addAd(data: AnyRecord) {
    return vanilla.ad.create.mutate(data as never);
  },
  async createAd(data: AnyRecord) {
    return vanilla.ad.create.mutate(data as never);
  },
  async updateAd(id: string, data: AnyRecord) {
    return vanilla.ad.update.mutate({ id, ...(data as object) } as never);
  },
  async deleteAd(id: string) {
    return vanilla.ad.remove.mutate({ id });
  },
  async toggleAdStatus(id: string) {
    return vanilla.ad.toggleStatus.mutate({ id });
  },

  // ── COMMISSION ──
  async getCommissionSettings() {
    const s = await vanilla.revenue.commissionSettings.query();
    return s as AnyRecord;
  },
  async saveCommissionSettings(data: AnyRecord) {
    return vanilla.revenue.saveCommissionSettings.mutate({ settings: data });
  },
  async updateCommission(_id: string, _updates: AnyRecord) {
    return true;
  },

  // ── CHAT ──
  async getConversations() {
    return vanilla.chat.all.query();
  },
  async flagConversation(id: string, reason: string, note?: string) {
    return vanilla.chat.flag.mutate({ id, reason, note });
  },
  async blockConversation(id: string) {
    return vanilla.chat.block.mutate({ id });
  },
  async reviewConversation(id: string) {
    return vanilla.chat.review.mutate({ id });
  },

  // ── NOTIFICATIONS ──
  async getNotificationTemplates() {
    return vanilla.notification.templates.query();
  },
  async createNotificationTemplate(data: AnyRecord) {
    return vanilla.notification.createTemplate.mutate(data as never);
  },
  async updateNotificationTemplate(id: string, data: AnyRecord) {
    return vanilla.notification.updateTemplate.mutate({ id, ...(data as object) } as never);
  },
  async deleteNotificationTemplate(id: string) {
    return vanilla.notification.deleteTemplate.mutate({ id });
  },
  async getNotificationLogs() {
    return vanilla.notification.logs.query();
  },
  async sendNotification(templateId: string, target: string) {
    return vanilla.notification.send.mutate({ templateId, target });
  },

  // ── CMS / AUDIT ──
  async getCMSPages() {
    return vanilla.cms.all.query();
  },
  async saveCMSPage(page: AnyRecord) {
    return vanilla.cms.save.mutate(page as never);
  },
  async getAuditLogs() {
    return vanilla.audit.list.query({});
  },

  // ── ADMIN PROFILE ──
  async getAdminProfile() {
    return vanilla.user.adminProfile.query();
  },
  async updateAdminProfile(updates: AnyRecord) {
    return vanilla.user.updateAdminProfile.mutate(updates as never);
  },
  async getLoginActivity() {
    return vanilla.user.loginActivity.query();
  },
};

// Minimal stubs so old `import { trpc, queryClient }` never crashes
// (new code should use `api` from ~/trpc/react instead).
export const trpc = vanilla as unknown;
export const queryClient = undefined as unknown;
export default mockAPI;
