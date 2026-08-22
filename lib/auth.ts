import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod } from "better-auth/plugins";
import { Resend } from "resend";
import ForgotPasswordEmail from "@/components/emails/reset-password";
import "@/lib/env";
import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      console.log("\n--- [DEVELOPMENT TOOL] PASSWORD RESET LINK ---");
      console.log(`To: ${user.email}`);
      console.log(`URL: ${url}`);
      console.log("----------------------------------------------\n");

      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey && apiKey !== "your-resend-api-key") {
        try {
          await resend.emails.send({
            from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
            to: user.email,
            subject: "Reset your password",
            react: ForgotPasswordEmail({
              username: user.name,
              resetUrl: url,
              userEmail: user.email,
            }),
          });
        } catch (error) {
          console.error("Failed to send email via Resend:", error);
        }
      }
    },
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STAFF",
        input: true,
      },
      storeId: {
        type: "string",
        input: false,
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [lastLoginMethod(), nextCookies()],
});
