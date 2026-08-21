import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { EXTERNAL_SESSION_COOKIE } from "../shared/const";
import { createAdminSession, externalCookieOptions, validateAdminCredentials } from "./externalAuth";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { siteRouter } from "./routers/site";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure.input(z.object({ email: z.string().email(), password: z.string().min(1).max(256) })).mutation(async ({ input, ctx }) => {
      if (!validateAdminCredentials(input.email, input.password)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "بيانات الدخول غير صحيحة." });
      }
      const token = await createAdminSession();
      ctx.res.cookie(EXTERNAL_SESSION_COOKIE, token, externalCookieOptions(ctx.req));
      return { success: true } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(EXTERNAL_SESSION_COOKIE, { ...externalCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  site: siteRouter,
});

export type AppRouter = typeof appRouter;
