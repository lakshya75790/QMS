import { signIn } from "@/config/authConfig";
import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { normalizePhoneNumber } from "@/lib/utils/numberUtils";
import {
  formatError,
  formateVerifyHashString,
  getOtpRedirectUrl,
} from "@/lib/utils/stringUtils";
import { getOrgByUserId } from "@/queries/orgQuery";
import HashService from "@/service/hashService";
import OTPService from "@/service/otpService";
import SendService from "@/service/sendService";
import { LoginVerificationStage } from "@/types/enum";
import { loginSchema, signUpSchema } from "@/zodSchema/authSchema";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

export const authRoute = new Hono()
  .post("/signup", zValidator("json", signUpSchema), async (c) => {
    try {
      const body = c.req.valid("json");
      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.phone, body.phoneNumber));

      if (existingUser) {
        return c.json({ message: "User already exists" }, 400);
      }
      const [user] = await db
        .insert(users)
        .values({
          name: body.name,
          phone: body.phoneNumber,
        })
        .returning();

      return c.json({ message: "User created", data: user }, 201);
    } catch (error) {
      return c.json(
        { message: "Internal server error", errors: String(error) },
        500,
      );
    }
  })
  .post("/login", zValidator("json", loginSchema), async (c) => {
    try {
      // Extract and validate request body
      const body = c.req.valid("json");
      const { phoneNumber, hash: otpHash, otp, stage } = body;

      // Normalize the phone number for consistency
      const phone = normalizePhoneNumber(phoneNumber);
      if (!phone) {
        // Return an error response if the phone number is invalid
        return c.json({ message: "Invalid phone number" }, 400);
      }

      // Fetch the user based on the normalized phone number
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          role: users.role,
          phone: users.phone,
        })
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);

      // If no user is found, return a 404 error
      if (!user) {
        return c.json({ message: "User not found" }, 404);
      }

      // Handle different login verification stages
      switch (stage) {
        case LoginVerificationStage.Initial:
          // Generate a new OTP
          const generateOtp = OTPService.createOtp().toString();

          // Hash the OTP with the phone number for secure verification

          const hash = HashService.hashOtp(
            formateVerifyHashString({ phone, otp: generateOtp }),
          );
          // Send the OTP via SMS
          const isOtpSent = await SendService.sendSMS(
            phone,
            `Your ${process.env.NEXT_PUBLIC_WEB_NAME || ""} OTP is ${generateOtp}`,
          );

          // Handle failure in sending the OTP
          if (!isOtpSent) {
            return c.json(
              { message: "Failed to send OTP. Please try again later." },
              500,
            );
          }

          // Generate the OTP redirect URL
          const redirectUrl = await getOtpRedirectUrl({
            hash,
            phone,
          });
          // const devPhoneNumbers =
          //   process.env.NEXT_PUBLIC_DEV_PHONE_NUMBER?.split(",").map((num) =>
          //     normalizePhoneNumber(num.trim()),
          //   ) || [];

          const message =
            process.env.OTP_SERVICE_AVAILABLE !== "true"
              ? // devPhoneNumbers.includes(
                //   normalizePhoneNumber(phone) || "",
                // )
                `Your OTP is ${generateOtp}`
              : "OTP sent";
          // Respond with success and the redirect URL
          return c.json({
            message: message,
            stage: LoginVerificationStage.OTPSent,
            data: {
              redirect: redirectUrl,
              hash,
              otp:
                process.env.OTP_SERVICE_AVAILABLE !== "true" ? generateOtp : "",
            },
          });

        case LoginVerificationStage.OTPVerify:
          // Ensure OTP and hash are provided for verification
          if (!otpHash || !otp) {
            return c.json(
              { message: "Invalid request. Please provide OTP." },
              400,
            );
          }

          // Verify the OTP using the hashed value
          const isValid = OTPService.verifyOtp(
            otpHash,
            formateVerifyHashString({ phone, otp: otp }),
          );

          // Handle invalid OTP
          if (!isValid) {
            return c.json({ message: "Invalid OTP" }, 400);
          }

          await signIn("credentials", {
            name: user.name,
            phone: user.phone,
            role: user.role,
            redirect: false,
          });

          let redirect = "/history";
          if (user.role === "SUPER_ADMIN") {
            redirect = "/admin/dashboard/organization";
          } else if (user.role !== "USER") {
            // Only query the database if the user is not a regular USER
            const userOrg = await getOrgByUserId(user.id);
            if (!userOrg) {
              redirect = "/admin/dashboard/organization";
            } else if (user.role === "ADMIN") {
              redirect = `/admin/dashboard/organization/o/${userOrg.webName}`;
            } else {
              redirect = `/admin/dashboard/organization/o/${userOrg.webName}/token/search`;
            }
          }
          // Respond with success when OTP is verified
          return c.json({
            message: "OTP verified",
            stage: LoginVerificationStage.OTPVerified,
            data: { redirect: redirect, hash: null, otp: "" },
          });

        default:
          // Handle unsupported stages
          return c.json({ message: "Invalid stage in login flow" }, 400);
      }
    } catch (error) {
      console.error(error);
      // Handle unexpected errors
      const err = formatError(error);
      return c.json(
        {
          message: err.message || "Internal server error while login",
          error,
        },
        err.statusCode,
      );
    }
  });

export type AppType = typeof authRoute;
