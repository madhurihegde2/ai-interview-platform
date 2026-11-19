const { Kafka, logLevel, Partitioners } = require("kafkajs");
const { config } = require("./env");

const TOPICS = {
  ANSWER_SUBMITTED: "interview.answer.submitted",
};

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
  logLevel: logLevel.WARN,
});

let producer = null;
let producerReady = null;

async function getProducer() {
  if (!producerReady) {
    producer = kafka.producer({
      allowAutoTopicCreation: true,
      createPartitioner: Partitioners.DefaultPartitioner,
    });
    producerReady = producer.connect().catch((error) => {
      // allow a later call to retry the connection
      producerReady = null;
      throw error;
    });
  }

  await producerReady;
  return producer;
}

async function publishEvent(topic, key, payload) {
  const activeProducer = await getProducer();

  await activeProducer.send({
    topic,
    messages: [{ key: String(key), value: JSON.stringify(payload) }],
  });
}

async function ensureTopics() {
  const admin = kafka.admin();
  await admin.connect();

  try {
    const existing = await admin.listTopics();

    if (existing.includes(TOPICS.ANSWER_SUBMITTED)) {
      return;
    }

    await admin.createTopics({
      waitForLeaders: true,
      topics: [{ topic: TOPICS.ANSWER_SUBMITTED, numPartitions: 3 }],
    });
  } finally {
    await admin.disconnect();
  }
}

async function disconnectProducer() {
  if (producer) {
    await producer.disconnect().catch(() => {});
  }
}

module.exports = {
  kafka,
  TOPICS,
  publishEvent,
  ensureTopics,
  disconnectProducer,
};
