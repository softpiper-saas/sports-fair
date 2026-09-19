import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail } from "@/lib/email";

export const staffRoles = ["admin", "editor", "journalist", "ad_manager"] as const;
export type StaffRole = (typeof staffRoles)[number];

export const auth = betterAuth({
  appName: "Sportsfair",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 10,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your Sportsfair password",
        text: `Reset your Sportsfair password using this link: ${url}`
      });
    }
  },
  plugins: [
    admin({
      defaultRole: "journalist",
      adminRoles: ["admin"]
    }),
    nextCookies()
  ]
});

export type AuthSession = typeof auth.$Infer.Session;
