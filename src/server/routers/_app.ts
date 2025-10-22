import { router } from '../trpc';
import { accountRouter } from './account';
import { notificationRouter } from './notifications';

export const appRouter = router({
  notifications: notificationRouter,
  account: accountRouter,
});

export type AppRouter = typeof appRouter;
