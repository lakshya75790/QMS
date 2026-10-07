import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { normalizePhoneNumber } from "@/lib/utils/numberUtils";
import { eq } from "drizzle-orm";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const authProvidersConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const phone = normalizePhoneNumber(credentials.phone as string);
        if (!phone) return null;

        // If user is already verified and passed with ID from authRoute, return immediately
        if (credentials.id) {
          return {
            id: String(credentials.id),
            name: String(credentials.name || ""),
            role: (credentials.role || "USER") as any,
            phone,
          };
        }

        // Fallback: Query only required fields with indexed lookup and limit 1
        const [userInfo] = await db
          .select({
            id: users.id,
            name: users.name,
            role: users.role,
            phone: users.phone,
          })
          .from(users)
          .where(eq(users.phone, phone))
          .limit(1);

        if (userInfo) {
          return {
            ...userInfo,
            phone,
          };
        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;

export default authProvidersConfig;
