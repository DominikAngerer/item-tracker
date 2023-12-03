import { and, eq, gte, sum } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { itemConsumption } from "~/server/db/schema";
import { itemConsumtionSchema } from "~/types";

export const itemRouter = createTRPCRouter({
  create: publicProcedure
    .input(itemConsumtionSchema)
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await ctx.db.insert(itemConsumption).values({
        amount: input.amount,
        time: input.time,
        item: input.item,
      });
    }),

  getYtd: publicProcedure
    .input(z.object({ item: z.string() }))
    .query(async ({ ctx, input }) => {
      const firstDayOfYear = new Date();
      firstDayOfYear.setUTCMonth(0, 0);
      firstDayOfYear.setUTCHours(0, 0, 0, 0);

      const query = await ctx.db
        .select({
          sum: sum(itemConsumption.amount),
        })
        .from(itemConsumption)
        .where(
          and(
            eq(itemConsumption.item, input.item),
            gte(itemConsumption.time, firstDayOfYear),
          ),
        );

      return query.at(0)?.sum;
    }),
});