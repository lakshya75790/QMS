import { Hono } from "hono";
import { and, asc, count, desc, eq, gte, ilike, like, lte, or } from "drizzle-orm";
import { db } from "@/lib/db/db";
import { organizations, orgTransaction, users } from "@/lib/db/schema";
import { zValidator } from "@hono/zod-validator";
import { transactionPaginationSchema } from "@/zodSchema/paginationSchema";
import { tableLimitArr } from "@/content";
import { z } from "zod";
import { orgTransactionSchema } from "@/zodSchema/transactionSchema";
import { currentUser } from "@/action/currentUser";

export const transactionRoutes = new Hono()
  .get(
    "/:orgWebName",
    zValidator(
      "query",
      z.object({
        transactionId: z.string().optional(),
      }),
    ),
    async (c) => {
      try {
        const orgWebName = c.req.param("orgWebName");
        const { transactionId } = c.req.valid("query");

        const baseQuery = db
          .select({
            total: orgTransaction.total,
            paid: orgTransaction.paid,
            due: orgTransaction.due,
            createdAt: orgTransaction.createdAt,
            organizationId: orgTransaction.organizationId,
            id: orgTransaction.id,
            updatedAt: orgTransaction.updatedAt,
          })
          .from(orgTransaction)
          .innerJoin(
            organizations,
            eq(orgTransaction.organizationId, organizations.id),
          )
          .where(
            transactionId
              ? and(
                  eq(organizations.doctorWebName, orgWebName),
                  eq(orgTransaction.id, transactionId),
                )
              : eq(organizations.doctorWebName, orgWebName),
          );

        if (!transactionId) {
          baseQuery.orderBy(desc(orgTransaction.createdAt)).limit(1);
        }

        const transaction = await baseQuery;

        if (!transaction.length) {
          return c.json({ error: "Transaction not found" }, 404);
        }

        return c.json(transaction[0]);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        return c.json({ error: "Failed to fetch transactions" }, 500);
      }
    },
  )
  .get("/", zValidator("query", transactionPaginationSchema), async (c) => {
    const queryParam = c.req.valid("query");

    const {
      limit = tableLimitArr[0],
      page = 1,
      // search,
      // startTime: startTimeString,
      // endOfDay: endOfDayString,
      search,
      fromDate,
      toDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = transactionPaginationSchema.parse(queryParam);

    const offset = (page - 1) * limit;

    try {
      // let query = db
      //   .select({
      //     transaction: orgTransaction,
      //     organization: organizations,
      //   })
      //   .from(orgTransaction)
      //   .innerJoin(
      //     organizations,
      //     eq(orgTransaction.organizationId, organizations.id),
      //   )
      //   .$dynamic();

      let query = db
        .select({
          transaction: {
            id: orgTransaction.id,
            total: orgTransaction.total,
            paid: orgTransaction.paid,
            due: orgTransaction.due,
            createdAt: orgTransaction.createdAt,
            updatedAt: orgTransaction.updatedAt,
            organizationId: orgTransaction.organizationId,
          },
          organization: {
            id: organizations.id,
            doctorWebName: organizations.doctorWebName,
            // serviceStartDate: organizations.serviceStartDate,
            // serviceEndDate: organizations.serviceEndDate,
            // userLimit: organizations.userLimit,
          },
        })
        .from(orgTransaction)
        .innerJoin(
          organizations,
          eq(orgTransaction.organizationId, organizations.id),
        )
        .$dynamic();

      // Apply filters
      const filters = [];

      // Search by doctor name
      if (search) {
        filters.push(
          like(organizations.doctorWebName, `%${decodeURIComponent(search)}%`),
        );
      }

      if (fromDate) {
        filters.push(gte(orgTransaction.createdAt, new Date(fromDate)));
      }

      if (toDate) {
        filters.push(lte(orgTransaction.createdAt, new Date(toDate)));
      }

      if (filters.length > 0) {
        query = query.where(and(...filters));
      }

      // if (search) {
      //   filters.push(like(organizations.doctorWebName, `%${search}%`));
      // }

      // // Date range for createdAt
      // if (dateFrom) {
      //   filters.push(gte(orgTransaction.createdAt, new Date(dateFrom)));
      // }

      // if (dateTo) {
      //   filters.push(lte(orgTransaction.createdAt, new Date(dateTo)));
      // }

      // if (filters.length > 0) {
      //   query = query.where(and(...filters));
      // }

      // // Apply sorting
      // if (sortOrder === "desc") {
      //   if (sortBy === "createdAt") {
      //     query = query.orderBy(desc(orgTransaction.createdAt));
      //   } else if (sortBy === "updatedAt") {
      //     query = query.orderBy(desc(orgTransaction.updatedAt));
      //   } else if (sortBy === "total") {
      //     query = query.orderBy(desc(orgTransaction.total));
      //   } else if (sortBy === "due") {
      //     query = query.orderBy(desc(orgTransaction.due));
      //   }
      // } else {
      //   if (sortBy === "createdAt") {
      //     query = query.orderBy(asc(orgTransaction.createdAt));
      //   } else if (sortBy === "updatedAt") {
      //     query = query.orderBy(asc(orgTransaction.updatedAt));
      //   } else if (sortBy === "total") {
      //     query = query.orderBy(asc(orgTransaction.total));
      //   } else if (sortBy === "due") {
      //     query = query.orderBy(asc(orgTransaction.due));
      //   }
      // }

      // Apply sorting
      query = query.orderBy(
        sortOrder === "desc"
          ? desc(orgTransaction[sortBy])
          : asc(orgTransaction[sortBy]),
      );

      // const results = await query.execute();
      // Fetch paginated data
      const [transactionsData, totalRecords] = await Promise.all([
        query.offset(offset).limit(limit).execute(),
        db
          .select({ total: count() })
          .from(orgTransaction)
          .innerJoin(
            organizations,
            eq(orgTransaction.organizationId, organizations.id),
          )
          .where(and(...filters))
          .execute(),
      ]);

      const formattedData = {
        query: transactionPaginationSchema.parse(queryParam),
        // data: transactionsData.map(({ transaction, organization }) => ({
        //   ...transaction,
        //   organization,
        // })),
        data: transactionsData,
        pagination: {
          total: totalRecords[0].total,
          page,
          limit,
        },
      };

      return c.json(formattedData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return c.json({ error: "Failed to fetch transactions" }, 500);
    }
  })

  // Get a single transaction by ID
  //
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const result = await db
        .select({
          transaction: orgTransaction,
          organization: organizations,
        })
        .from(orgTransaction)
        .innerJoin(
          organizations,
          eq(orgTransaction.organizationId, organizations.id),
        )
        .where(eq(orgTransaction.id, id))
        .limit(1);

      if (result.length === 0) {
        return c.json({ error: "Transaction not found" }, 404);
      }

      const { transaction, organization } = result[0];

      return c.json({
        ...transaction,
        organization,
      });
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return c.json({ error: "Failed to fetch transaction" }, 500);
    }
  })
  // .get("/", async (c) => {
  //   try {
  //     const transactions = await db.query.orgTransaction.findMany({
  //       orderBy: (transaction, { desc }) => [desc(transaction.createdAt)],
  //     });

  //     return c.json(transactions);
  //   } catch (error) {
  //     console.error("Error fetching transactions:", error);
  //     return c.json({ error: "Failed to fetch transactions" }, 500);
  //   }
  // })
  // // Create a new transaction
  // .post(
  //   "/",
  //   zValidator(
  //     "json",
  //     z.object({
  //       total: z.number().positive(),
  //       organizationId: z.string().min(1),
  //     }),
  //   ),
  //   async (c) => {
  //     try {
  //       const { total, organizationId } = c.req.valid("json");

  //       const newTransaction = await db
  //         .insert(orgTransaction)
  //         .values({
  //           total: total.toString(),
  //           paid: String(0),
  //           due: total.toString(),
  //           organizationId,
  //           createdAt: new Date(),
  //           updatedAt: new Date(),
  //         })
  //         .returning();

  //       return c.json(newTransaction[0]);
  //     } catch (error) {
  //       console.error("Error creating transaction:", error);
  //       return c.json({ error: "Failed to create transaction" }, 500);
  //     }
  //   },
  // )

  // // Get transaction by ID
  // .get("/api/transactions/:id", async (c) => {
  //   try {
  //     const id = c.req.param("id");

  //     const transaction = await db.query.orgTransaction.findFirst({
  //       where: eq(orgTransaction.id, id),
  //     });

  //     if (!transaction) {
  //       return c.json({ error: "Transaction not found" }, 404);
  //     }

  //     return c.json(transaction);
  //   } catch (error) {
  //     console.error("Error fetching transaction:", error);
  //     return c.json({ error: "Failed to fetch transaction" }, 500);
  //   }
  // })
  // // Get payments for a transaction
  // .get("/api/transactions/:id/payments", async (c) => {
  //   try {
  //     const id = c.req.param("id");

  //     const payments = await db.query.orgPayments.findMany({
  //       where: eq(orgPayments.transactionId, id),
  //       with: {
  //         paymentMethod: true,
  //       },
  //       orderBy: (payment, { desc }) => [desc(payment.paidAt)],
  //     });

  //     return c.json(payments);
  //   } catch (error) {
  //     console.error("Error fetching payments:", error);
  //     return c.json({ error: "Failed to fetch payments" }, 500);
  //   }
  // })
  // // Add a payment to a transaction
  // .post(
  //   "/api/transactions/:id/payments",
  //   zValidator(
  //     "json",
  //     z.object({
  //       paymentMethodId: z.string().min(1),
  //       amount: z.number().positive(),
  //     }),
  //   ),
  //   async (c) => {
  //     try {
  //       const id = c.req.param("id");
  //       const { paymentMethodId, amount } = c.req.valid("json");

  //       // Get the transaction
  //       const transaction = await db.query.orgTransaction.findFirst({
  //         where: eq(orgTransaction.id, id),
  //       });

  //       if (!transaction) {
  //         return c.json({ error: "Transaction not found" }, 404);
  //       }

  //       // Check if payment amount is valid
  //       if (amount > +transaction.due) {
  //         return c.json({ error: "Payment amount exceeds due amount" }, 400);
  //       }

  //       // Create the payment
  //       const newPayment = await db
  //         .insert(orgPayments)
  //         .values({
  //           //   id: crypto.randomUUID(),
  //           transactionId: id,
  //           paymentMethodId,
  //           amount: amount.toString(),
  //           paidAt: new Date(),
  //           createdAt: new Date(),
  //           updatedAt: new Date(),
  //         })
  //         .returning();

  //       // Update the transaction
  //       const updatedPaid = transaction.paid + amount;
  //       const updatedDue = +transaction.total - +updatedPaid;

  //       await db
  //         .update(orgTransaction)
  //         .set({
  //           paid: updatedPaid,
  //           due: updatedDue.toString(),
  //           updatedAt: new Date(),
  //         })
  //         .where(eq(orgTransaction.id, id));

  //       // Get the payment method for the response
  //       const paymentMethod = await db.query.orgPaymentMethods.findFirst({
  //         where: eq(orgPaymentMethods.id, paymentMethodId),
  //       });

  //       return c.json({
  //         ...newPayment[0],
  //         paymentMethod,
  //       });
  //     } catch (error) {
  //       console.error("Error adding payment:", error);
  //       return c.json({ error: "Failed to add payment" }, 500);
  //     }
  //   },
  // )
  // // Get all payment methods
  // .get("/api/payment-methods", async (c) => {
  //   try {
  //     const paymentMethods = await db.query.orgPaymentMethods.findMany();
  //     return c.json(paymentMethods);
  //   } catch (error) {
  //     console.error("Error fetching payment methods:", error);
  //     return c.json({ error: "Failed to fetch payment methods" }, 500);
  //   }
  // })
  // // Create a new payment method
  // .post(
  //   "/api/payment-methods",
  //   zValidator(
  //     "json",
  //     z.object({
  //       name: z.string().min(1),
  //     }),
  //   ),
  //   async (c) => {
  //     try {
  //       const { name } = c.req.valid("json");

  //       const newPaymentMethod = await db
  //         .insert(orgPaymentMethods)
  //         .values({
  //           id: crypto.randomUUID(),
  //           name,
  //           createdAt: new Date(),
  //           updatedAt: new Date(),
  //         })
  //         .returning();

  //       return c.json(newPaymentMethod[0]);
  //     } catch (error) {
  //       console.error("Error creating payment method:", error);
  //       return c.json({ error: "Failed to create payment method" }, 500);
  //     }
  //   },
  // );
  .post("/", zValidator("json", orgTransactionSchema), async (c) => {
    try {
      const user = await currentUser();
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [existingUser] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, user.id));

      if (existingUser?.role !== "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
        return c.json(
          { error: "Forbidden. You don't have access to these resources!" },
          403,
        );
      }

      const body = c.req.valid("json");
      const normalizedWebName = decodeURIComponent(body.orgWebName).toLowerCase().trim();

      const [getOrg] = await db
        .select({
          id: organizations.id,
          doctorWebName: organizations.doctorWebName,
        })
        .from(organizations)
        .where(
          or(
            eq(organizations.doctorWebName, body.orgWebName),
            ilike(organizations.doctorWebName, normalizedWebName),
          ),
        );

      if (!getOrg) {
        return c.json(
          {
            error: "Organization not found",
          },
          404,
        );
      }

      if (body.transactionId) {
        const [updateTransaction] = await db
          .update(orgTransaction)
          .set({
            total: String(body.total),
            paid: String(body.paid),
            due: String(body.due),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(orgTransaction.id, body.transactionId),
              eq(orgTransaction.organizationId, getOrg.id),
            ),
          )
          .returning({
            id: orgTransaction.id,
          });

        if (!updateTransaction) {
          const [updateById] = await db
            .update(orgTransaction)
            .set({
              total: String(body.total),
              paid: String(body.paid),
              due: String(body.due),
              updatedAt: new Date(),
            })
            .where(eq(orgTransaction.id, body.transactionId))
            .returning({
              id: orgTransaction.id,
            });

          return c.json({
            message: "Transaction updated successfully",
            transaction: updateById,
          });
        }

        return c.json({
          message: "Transaction updated successfully",
          transaction: updateTransaction,
        });
      }

      const [insertTransaction] = await db
        .insert(orgTransaction)
        .values({
          total: String(body.total),
          paid: String(body.paid),
          due: String(body.due),
          organizationId: getOrg.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({
          id: orgTransaction.id,
        });

      return c.json({
        message: "Transaction created successfully",
        transaction: insertTransaction,
      });
    } catch (error) {
      console.error("Error processing transaction:", error);
      return c.json({ error: "Failed to process transaction" }, 500);
    }
  })



  export type AppType = typeof transactionRoutes
