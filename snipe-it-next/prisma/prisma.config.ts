import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: (() => {
      const raw = process.env["SUPABASE_DATABASE_URL"];
      if (raw) {
        const match = raw.match(/(postgres(?:ql)?:\/\/\S+)/);
        return match ? match[1] : raw;
      }
      return process.env["DATABASE_URL"];
    })(),
  },
});
