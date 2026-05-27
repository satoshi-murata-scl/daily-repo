import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { Prisma, PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  /** 生成クライアントのスキーマ指標（フィールド追加時に変わる） */
  prismaSchemaMarker?: string;
};

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return url;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is not set. On Railway, mount a volume and set DATABASE_URL=file:/data/prod.db",
    );
  }
  return "file:./dev.db";
}

function createPrismaClient() {
  const url = resolveDatabaseUrl();
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

function prismaSchemaMarker(): string {
  return Object.keys(Prisma.StoreScalarFieldEnum).sort().join(",");
}

/** スキーマ変更後に dev サーバーを再起動せず残る古いクライアントを捨てる */
function getPrismaClient(): PrismaClient {
  const marker = prismaSchemaMarker();
  const cached = globalForPrisma.prisma;
  if (
    cached &&
    "roleGuideline" in cached &&
    globalForPrisma.prismaSchemaMarker === marker
  ) {
    return cached;
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaSchemaMarker = marker;
  }
  return client;
}

export const prisma = getPrismaClient();
