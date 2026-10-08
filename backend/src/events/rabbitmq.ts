import amqplib, { type Channel, type ChannelModel } from "amqplib";

const EXCHANGE = "support_agent_events";

let connection: ChannelModel | undefined;
let channel: Channel | undefined;

export async function getChannel(): Promise<Channel> {
  if (channel) return channel;

  connection = await amqplib.connect(process.env.RABBITMQ_URL ?? "amqp://localhost:5672");
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, "fanout", { durable: true });

  return channel;
}

export async function closeConnection(): Promise<void> {
  await channel?.close();
  await connection?.close();
  channel = undefined;
  connection = undefined;
}

export { EXCHANGE };
