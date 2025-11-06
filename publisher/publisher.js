#!/usr/bin/env node
import { connect, StringCodec } from 'nats.ws';

const sc = StringCodec();

// Обработка аргументов
const args = process.argv.slice(2);

const subjectIndex = args.indexOf('--subject');
const subject = subjectIndex !== -1 && args[subjectIndex + 1] ? args[subjectIndex + 1] : 'updates.live';

const onceIndex = args.indexOf('--once');
const onceMsg = onceIndex !== -1 && args[onceIndex + 1] ? args[onceIndex + 1] : null;

const streamIndex = args.indexOf('--stream');
const streamInterval = streamIndex !== -1 && args[streamIndex + 1] ? Number(args[streamIndex + 1]) : null;

const stdin = args.includes('--stdin');

// Подключаемся к WebSocket NATS
const server = 'ws://localhost:9222';

async function main() {
  const nc = await connect({ servers: server });
  console.log(`✅ Connected to NATS WS at ${server}`);

  // Функция формирования сообщения с email
  const createMessage = (text) => JSON.stringify({
    email: 'martin.musinn@gmail.com', // конкретный пользователь
    id: Date.now(),
    ts: new Date().toISOString(),
    body: text,
  })

  // Отправка одного сообщения
  if (onceMsg) {
    nc.publish(subject, sc.encode(createMessage(onceMsg)));
    console.log(`Published once to ${subject}:`, onceMsg);
    await nc.flush();
    await nc.close();
    return;
  }

  // Отправка через stdin
  if (stdin) {
    process.stdin.setEncoding('utf8');
    let input = '';
    process.stdin.on('data', chunk => { input += chunk; });
    process.stdin.on('end', async () => {
      const msg = input.trim();
      if (msg) nc.publish(subject, sc.encode(createMessage(msg)));
      console.log(`Published from stdin to ${subject}:`, msg);
      await nc.flush();
      await nc.close();
    });
    return;
  }

  // Потоковая отправка
  if (streamInterval) {
    let counter = 1;
    console.log(`Publishing every ${streamInterval}ms to ${subject}. CTRL+C to stop.`);
    const timer = setInterval(() => {
      const text = `msg-${counter++}-${Math.random().toString(36).slice(2, 6)}`;
      const body = createMessage(text);
      nc.publish(subject, sc.encode(body));
      console.log('Published', body);
    }, streamInterval);

    process.on('SIGINT', async () => {
      clearInterval(timer);
      console.log('\nShutting down...');
      await nc.flush();
      await nc.close();
      process.exit(0);
    });
    return;
  }

  console.log('Nothing to do — use --once, --stdin or --stream');
}

main().catch(err => console.error(err));
