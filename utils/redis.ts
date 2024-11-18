import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined,
//   tls: process.env.REDIS_TLS
//     ? { rejectUnauthorized: false } // Para conexões seguras
//     : undefined,
  connectTimeout: 9999999999999999999, // Timeout aumentado para 10 segundos
});

redis.on("error", (err) => {
  console.error("Erro no Redis:", err);
});

redis.on("connect", () => {
  console.log("Conectado ao Redis com sucesso!");
});

export default redis;
