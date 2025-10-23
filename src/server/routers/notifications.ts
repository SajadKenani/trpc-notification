import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { PrismaClient } from "@prisma/client";
import { EventEmitter } from "events";

const prisma = new PrismaClient();
const ee = new EventEmitter();

type NotificationData = {
  id: string;
  message: string | null;
  title: string | null;
  type: string;
  userId: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

export const notificationRouter = router({
  list: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return prisma.notification.findMany({
        where: { userId: input.userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              notifications: true
            },
          },
        },
      });
    }),
    
  subscribeToUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .subscription(async function* ({ input, signal }) {
      const { userId } = input;
      const queue: NotificationData[] = [];

      const handler = (data: NotificationData) => queue.push(data);
      ee.on(`notify-${userId}`, handler);

      signal?.addEventListener("abort", () => ee.off(`notify-${userId}`, handler));

      while (!signal?.aborted) {
        const item = queue.shift();
        if (item) {
          yield item;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    }),

  addNotification: publicProcedure
    .input(
      z.object({
        message: z.string().min(1),
        userId: z.string(),
        title: z.string(),
        type: z.enum(["bonus", "info", "success", "warning", "error"]),
      })
    )
    .mutation(async ({ input }) => {
      const notification = await prisma.notification.create({
        data: {
          message: input.message,
          title: input.title,
          type: input.type,
          userId: input.userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      ee.emit(`notify-${input.userId}`, notification);
      return notification;
    }),

    markAsRead: publicProcedure
  .input(z.object({ ids: z.array(z.string()) }))
  .mutation(async ({ input }) => {
    await prisma.notification.updateMany({
      where: { id: { in: input.ids } },
      data: { read: true },
    });
    return true;
  }),

});