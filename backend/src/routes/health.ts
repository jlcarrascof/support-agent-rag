import { Router } from "express";
import { Pool } from "pg";
import { Redis } from "ioredis";
import amqplib from "amqplib";

const router = Router();

router.get("/health", async (_req, res) => {
  const checks = {
    postgres: await checkPostgres(),
    redis: await checkRedis(),
    rabbitmq: await checkRabbitMQ(),
  };

  const allHealthy = Object.values(checks).every((status) => status === "ok");

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "ok" : "degraded",
    checks,
  });
});

async function checkPostgres(): Promise<"ok" | "error"> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query("SELECT 1");
    return "ok";
  } catch {
    return "error";
  } finally {
    await pool.end();
  }
}

async function checkRedis(): Promise<"ok" | "error"> {
  const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });
  redis.on("error", () => {
    // Swallow connection errors here; the catch block below reports health status.
  });
  try {
    await redis.connect();
    await redis.ping();
    return "ok";
  } catch {
    return "error";
  } finally {
    redis.disconnect();
  }
}

async function checkRabbitMQ(): Promise<"ok" | "error"> {
  try {
    const connection = await amqplib.connect(
      process.env.RABBITMQ_URL ?? "amqp://localhost:5672"
    );
    await connection.close();
    return "ok";
  } catch {
    return "error";
  }
}

export { router as healthRouter };
