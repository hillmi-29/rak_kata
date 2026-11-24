import { beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/config/database';

// Global test setup
beforeAll(async () => {
  console.log('Test setup: Database connection established');
});

afterAll(async () => {
  await prisma.$disconnect();
  console.log('Test teardown: Database disconnected');
});