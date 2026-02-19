#!/usr/bin/env node
import { connect, StringCodec } from "nats";

const sc = StringCodec();

// Обработка аргументов
const args = process.argv.slice(2);
const subjectIndex = args.indexOf("--subject");
const subject =
  subjectIndex !== -1 && args[subjectIndex + 1]
    ? args[subjectIndex + 1]
    : "updates.live";
const onceIndex = args.indexOf("--once");
const onceMsg =
  onceIndex !== -1 && args[onceIndex + 1] ? args[onceIndex + 1] : null;
const streamIndex = args.indexOf("--stream");
const streamInterval =
  streamIndex !== -1 && args[streamIndex + 1]
    ? Number(args[streamIndex + 1])
    : null;
const stdin = args.includes("--stdin");

const server = "nats://localhost:4222"; // TCP клиент

async function main() {
  const nc = await connect({ servers: server });
  console.log(`✅ Connected to NATS TCP at ${server}`);

  const createMessage = (text) =>
    JSON.stringify({
      email: "fuegohayes@gmail.com",
      id: Date.now(),
      ts: new Date().toISOString(),
      body: text,
    });

  // Одно сообщение
  if (onceMsg) {
    nc.publish(subject, sc.encode(createMessage(onceMsg)));
    console.log(`Published once to ${subject}:`, onceMsg);
    await nc.flush();
    await nc.close();
    return;
  }

  // Потоковая отправка
  if (streamInterval) {
    let counter = 1;
    console.log(
      `Publishing every ${streamInterval}ms to ${subject}. CTRL+C to stop.`,
    );
    const timer = setInterval(() => {
      const text = `msg-${counter++}-${Math.random().toString(36).slice(2, 6)}`;
      nc.publish(subject, sc.encode(createMessage(text)));
      console.log("Published", text);
    }, streamInterval);

    process.on("SIGINT", async () => {
      clearInterval(timer);
      console.log("\nShutting down...");
      await nc.flush();
      await nc.close();
      process.exit(0);
    });
    return;
  }

  console.log("Nothing to do — use --once, --stdin or --stream");
}

main().catch((err) => console.error(err));
