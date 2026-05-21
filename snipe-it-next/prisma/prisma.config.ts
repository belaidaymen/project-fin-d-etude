import path from "path";
import type { PrismaConfig } from "prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;

export default {
  earlyAccess: true,
  schema: path.join(__dirname, "schema.prisma"),
  migrate: {
    adapter: () => {
      const pool = new Pool({ connectionString });
      return new PrismaPg(pool);
    },
  },
} satisfies PrismaConfig;
