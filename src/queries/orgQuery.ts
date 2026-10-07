import "server-only";

import { db } from "@/lib/db/db";
import { organizations, organizationUsers } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
export const getOrgByUserId = async (userId: string) => {
  const [userOrgs] = await db
    .select({
      orgId: organizations.id,
      webName: organizations.doctorWebName,
      serviceStartDate: organizations.serviceStartDate,
      serviceEndDate: organizations.serviceEndDate,
      userLimit: organizations.userLimit,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
    })
    .from(organizationUsers)
    .innerJoin(
      organizations,
      eq(organizationUsers.organizationId, organizations.id),
    )
    .where(eq(organizationUsers.userId, userId))
    .orderBy(
      sql`CASE WHEN ${organizations.serviceEndDate} >= NOW() THEN 1 ELSE 0 END DESC`,
      desc(organizations.serviceEndDate),
      desc(organizationUsers.createdAt),
    )
    .limit(1);

  if (!userOrgs) {
    return null;
  }

  return userOrgs;
};
