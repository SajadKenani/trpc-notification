import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '@/server/routers/_app';

export const createContext = () => ({});

export type Context = ReturnType<typeof createContext>;

export default createNextApiHandler({
  router: appRouter,
  createContext,
});
