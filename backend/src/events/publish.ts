import { randomUUID } from "crypto";
import { getChannel, EXCHANGE } from "./rabbitmq.js";

export async function publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
  const channel = await getChannel();
  const messageId = randomUUID();

  const message = {
    messageId,
    eventType,
    payload,
    publishedAt: new Date().toISOString(),
  };

  channel.publish(EXCHANGE, "", Buffer.from(JSON.stringify(message)), {
    persistent: true,
    messageId,
  });
}
