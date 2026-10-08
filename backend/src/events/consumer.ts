import { getChannel, EXCHANGE } from "./rabbitmq.js";
import { pool } from "../db/client.js";

const QUEUE = "support_agent_events_processor";

interface EventMessage {
  messageId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

/**
 * Returns true if this is the first time we've seen this message_id (i.e. we
 * should process it), false if it's a duplicate delivery that was already
 * processed before.
 */
async function markProcessed(messageId: string, eventType: string): Promise<boolean> {
  try {
    await pool.query("INSERT INTO processed_events (message_id, event_type) VALUES ($1, $2)", [
      messageId,
      eventType,
    ]);
    return true;
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return false;
    }
    throw error;
  }
}

export async function startConsumer(): Promise<void> {
  const channel = await getChannel();
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(QUEUE, EXCHANGE, "");

  await channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    const event = JSON.parse(msg.content.toString()) as EventMessage;
    const isNew = await markProcessed(event.messageId, event.eventType);

    if (isNew) {
      console.log(`[events] processed ${event.eventType}`, event.payload);
    } else {
      console.log(`[events] skipped duplicate ${event.eventType} (${event.messageId})`);
    }

    channel.ack(msg);
  });

  console.log("[events] consumer listening on", QUEUE);
}
