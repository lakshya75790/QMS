import { OTP_HASH_NAME } from "@/constant";
import { PageProps } from "@/types";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError, ZodIssue } from "zod";

export const formateVerifyHashString = ({
  phone,
  otp,
}: {
  phone: string;
  otp: string | number;
}) => {
  return `${phone}|${otp}`;
};

export const createQueryString = (
  searchParams: PageProps["searchParams"],
  changeParams?: PageProps["searchParams"],
): string => {
  if (changeParams) {
    searchParams = { ...searchParams, ...changeParams };
  }
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value === "") {
      return;
    }
    params.set(key, value.toString());
  });
  return `?${params.toString()}`;
};

export const getOtpRedirectUrl = ({
  searchParams,
  phone,
  hash,
  basePath,
}: {
  hash: string;
  phone: string;
  searchParams?: string;
  basePath?: string;
}) => {
  const updateSearchParams = createQueryString(
    searchParamsToObject(searchParams || ""),
    {
      phone: phone,
      [OTP_HASH_NAME]: hash,
    },
  );
  return `${basePath || "/auth/login"}${updateSearchParams}`;
};

export function searchParamsToObject(
  searchParams: string,
): PageProps["searchParams"] {
  const params = new URLSearchParams(searchParams);
  const obj: Record<string, string> = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });

  return obj;
}

export function formatError(
  error: unknown,
  isFallback = false,
): {
  message: string;
  statusCode: Exclude<
    ContentfulStatusCode,
    | 100
    | 102
    | 103
    | 200
    | 201
    | 202
    | 203
    | 204
    | 205
    | 206
    | 207
    | 208
    | 226
    | 300
    | 301
    | 302
    | 303
    | 305
    | 306
    | 307
    | 308
  >;
} {
  if (error instanceof Error) {
    // Type assertion to access Postgres-specific fields
    const dbError = error as Error & { detail?: string };

    // Handle NOT NULL constraint violation
    if (error.message.includes("violates not-null constraint")) {
      const match = error.message.match(/column "(.+?)"/);
      const column = match ? match[1] : "a required field";
      return {
        message: `The ${column} field cannot be null. Please provide a value.`,
        statusCode: 400, // Bad Request
      };
    }

    // Handle UNIQUE constraint violation
    if (error.message.includes("unique constraint") && dbError.detail) {
      const match = dbError.detail.match(/\((.*?)\)=\((.*?)\)/);
      const field = match ? match[1] : "a unique field";
      return {
        message: `The value for ${field} must be unique. Please use a different value.`,
        statusCode: 409, // Conflict
      };
    }

    // Handle FOREIGN KEY constraint violation
    if (error.message.includes("foreign key constraint")) {
      return {
        message:
          "A related resource is missing or invalid. Please check your input.",
        statusCode: 422, // Unprocessable Entity
      };
    }
    // General fallback for other errors
    return isFallback
      ? {
          message: "An unexpected error occurred. Please try again.",
          statusCode: 500,
        } // Internal Server Error
      : { message: error.message, statusCode: 500 };
  }
  // If the error is not an instance of `Error`, return a generic message
  return isFallback
    ? {
        message: "An unknown error occurred. Please try again.",
        statusCode: 500,
      }
    : { message: "", statusCode: 500 };
}

export const getInitials = (name: string | undefined) => {
  if (!name) return "U"; // Default fallback for missing names
  const [firstName, lastName] = name
    .replaceAll("undefined", "")
    .trim()
    .split(" ");
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
};

export async function getReadableErrorMessage(error: unknown): Promise<string> {
  if (error instanceof Response) {
    try {
      const data = await error.json();

      if (typeof data === "object" && data !== null) {
        // Handle generic error message
        if (typeof data.error === "string") {
          return data.error;
        }

        // Handle array of errors
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          return data.errors.join(" ");
        }

        // Handle Zod validation errors
        if (
          typeof data.error === "object" &&
          data.error !== null &&
          data.error.name === "ZodError" &&
          Array.isArray(data.error.issues)
        ) {
          const messages = (data.error as ZodError).issues.map(
            (issue: ZodIssue) => `${issue.path?.join(".")}: ${issue.message}`,
          );
          return messages.join(" ");
        }
      }

      // Handle common HTTP status codes
      switch (error.status) {
        case 400:
          return "Bad request. Please check your input.";
        case 401:
          return "Unauthorized. Please log in.";
        case 403:
          return "Forbidden. You don't have permission to access this resource.";
        case 404:
          return "Not found. The requested resource does not exist.";
        case 500:
          return "Server error. Please try again later.";
        default:
          return `Unexpected error (Status: ${error.status}). Please try again.`;
      }
    } catch {
      return `Unexpected response error (Status: ${error.status}).`;
    }
  }

  // Handle Fetch network errors
  if (error instanceof TypeError) {
    return "Network error. Please check your connection.";
  }

  // Handle standard JS and crypto-related errors
  if (error instanceof Error) {
    // Crypto-specific error code
    if ((error as { code?: string }).code === "ERR_CRYPTO_INVALID_IV") {
      return "Data decryption failed. The data may be corrupted or has been tampered with.";
    }

    // Crypto message fallback
    if (error.message.includes("Invalid initialization vector")) {
      return "Data decryption failed. The data may be corrupted or has been tampered with.";
    }

    // Drizzle/PostgreSQL errors
    if (/relation .* does not exist/.test(error.message)) {
      return "Database error: Table not found.";
    }
    if (/violates unique constraint/.test(error.message)) {
      return "Database error: Duplicate entry.";
    }
    if (/violates not-null constraint/.test(error.message)) {
      return "Database error: Missing required field.";
    }

    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle unexpected error formats
  if (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as { error?: unknown }).error === "string"
  ) {
    return (error as { error?: string })?.error || "An unknown error occurred.";
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message?: string })?.message || "An unknown error occurred.";
  }

  return "An unknown error occurred. Please try again.";
}

export const getOrgPath = (webName?: string) => {
  return `/admin/dashboard/organization/o/${webName || ""}`;
};
