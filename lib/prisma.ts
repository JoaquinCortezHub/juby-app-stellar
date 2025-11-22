/**
 * Prisma Client Singleton with In-Memory Fallback
 *
 * If DATABASE_URL is not set, uses in-memory mock for demos.
 * Otherwise, uses real Prisma Client.
 */

import { mockPrisma } from "./mock-db";

// Check if we should use the mock database
const useMockDatabase = !process.env.DATABASE_URL;

if (useMockDatabase) {
  console.log("⚠️  DATABASE_URL not set - using in-memory mock database");
  console.log("   Perfect for demos! Data persists only while server runs.");
}

// Export either mock or real prisma client
let prisma: any;

if (useMockDatabase) {
  prisma = mockPrisma;
} else {
  const { PrismaClient } = require('@prisma/client');

  const globalForPrisma = globalThis as unknown as {
    prisma: typeof PrismaClient | undefined;
  };

  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
}

export { prisma };
export default prisma;
