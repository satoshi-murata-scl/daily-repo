// Prisma CLI 設定（Prisma 7）
// DATABASE_URL は Railway Variables / .env から読み込む
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

function resolveDatasourceUrl(): string {
  // Railway Variables や .env の DATABASE_URL（dotenv/config で .env も読み込み）
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    return databaseUrl;
  }

  // 本番の migrate deploy では DATABASE_URL 必須
  const isMigrate =
    process.argv.some((arg) => arg.includes("migrate")) ||
    process.argv.some((arg) => arg.includes("db"));

  if (process.env.NODE_ENV === "production" && isMigrate) {
    return env("DATABASE_URL");
  }

  // prisma generate / next build（DB 接続不要）
  return "file:./dev.db";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: resolveDatasourceUrl(),
  },
});
