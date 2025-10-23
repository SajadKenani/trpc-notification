import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';
import SuperJSON from 'superjson';

const t = initTRPC.create({
  transformer: SuperJSON,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      zodError:
        error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
          ? error.cause.flatten()
          : null,
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;



// // server/trpc.ts
// import { initTRPC } from '@trpc/server';
// import SuperJSON from 'superjson';

// const t = initTRPC.create({
//   transformer: SuperJSON,
// });
