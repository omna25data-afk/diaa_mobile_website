import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(role: "admin" | "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("site.admin access", () => {
  it("blocks non-admin users from reading administrative data", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.site.admin.data()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("validates site settings before an admin mutation reaches persistence", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    await expect(caller.site.admin.updateSettings({
      platformName: "",
      siteTitle: "ضياء موبايل",
      heroTitle: "عنوان",
      heroDescription: "وصف",
      aboutTitle: "من نحن",
      aboutDescription: "وصف",
      mission: "رسالة",
      values: "سهولة",
      phone: "+967780777735",
      email: "invalid-email",
      logoUrl: null,
      heroImageUrl: null,
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
