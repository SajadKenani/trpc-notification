import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const accountRouter = router({
  signUp: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.account.create({
        data: {
          name: input.name,
          email: input.email,
          password: input.password,
        },
      });
    }),
  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const user = await prisma.account.findUnique({
        where: { email: input.email },
      });

      if (!user || user.password !== input.password) {
        throw new Error("Invalid email or password");
      }

      return {
        message: "Signed in successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    }),

    getAccounts: publicProcedure
    .query(async () => {
      const users = await prisma.account.findMany()
      return users
    })
});
