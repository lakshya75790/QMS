import { authRoute } from "@/feature/auth/server/route";
import dashBoardRoute from "@/feature/admin/dashboard/server/route";
import { enrollmentRoute } from "@/feature/enroll/server/route";
import { schedulesRoutes } from "@/feature/schedules/server/route";
import { tokenRoute } from "@/feature/token/server/route";
import { uploads } from "@/feature/uploads/server/route";
import { userRoutes } from "@/feature/user/server/route";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import organizationRoutes from "@/feature/organization/server/route";
import { orgUsersRoute } from "@/feature/organization/users/server/route";
import { transactionRoutes } from "@/feature/transaction/server/route";
import { subscriptionRoute } from "@/feature/subscription/server/route";
import appointmentRoutes from "@/feature/payments/appointmentPayments/server/route";
import { paymentWebhook } from "@/feature/payments/webhooks/server/route";
import appointmentReasonsTypeRoutes from "@/feature/appointmentReasonType/server/route";
import { notificationRoutes } from "@/feature/notifications/server/route";

// export const runtime = "edge"

const app = new Hono().basePath("/api/main");

const isAllowedOrigin = (origin: string): boolean => {
  if (!origin) return true;
  if (
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.endsWith(".onrender.com") ||
    origin.endsWith(".vercel.app")
  ) {
    return true;
  }
  if (process.env.NEXT_PUBLIC_URL) {
    const cleanPublicUrl = process.env.NEXT_PUBLIC_URL.replace(/\/$/, "");
    if (origin === cleanPublicUrl) return true;
  }
  return false;
};

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin || isAllowedOrigin(origin)) {
        return origin || "*";
      }
      return null;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    maxAge: 86400,
  })
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/enroll", enrollmentRoute)
  .route("/token", tokenRoute)
  .route("/auth", authRoute)
  .route("/admin/dashboard", dashBoardRoute)
  .route("/uploads", uploads)
  .route("/schedules", schedulesRoutes)
  .route("/user", userRoutes)
  .route("/org", organizationRoutes)
  .route("/org/transactions", transactionRoutes)
  .route("/org/users", orgUsersRoute)
  .route("/org/subscription", subscriptionRoute)
  .route("/features/appointment-reasons", appointmentReasonsTypeRoutes)
  .route("/payments/appointment", appointmentRoutes)
  .route("/payments/webhook", paymentWebhook)
  .route("/notifications", notificationRoutes);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);

export type AppType = typeof routes;
