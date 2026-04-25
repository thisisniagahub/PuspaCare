import { db } from '@/lib/db';
import { PrismaClient } from '@prisma/client';

const BRANCH_AWARE_MODELS = ['Member', 'Case'];

export function getScopedDb(branchId?: string): PrismaClient {
  if (!branchId) {
    return db as unknown as PrismaClient;
  }

  return db.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const supportedOperations = [
            'findMany',
            'findUnique',
            'findFirst',
            'update',
            'updateMany',
            'delete',
            'deleteMany',
            'count',
          ];

          if (
            model &&
            BRANCH_AWARE_MODELS.includes(model) &&
            supportedOperations.includes(operation as string)
          ) {
            (args as any).where = { ...(args as any).where, branchId };
          }

          return query(args);
        },
      },
    },
  }) as unknown as PrismaClient;
}
