const fastify = require("fastify")({ logger: true });

fastify.get("/health", async () => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
});

fastify.get("/products", async () => {
  return {
    products: [
      { id: "p-001", name: "Desk", price: 129 },
      { id: "p-002", name: "Chair", price: 89 },
      { id: "p-003", name: "Lamp", price: 24 },
    ],
  };
});

fastify.post("/orders", async (request, reply) => {
  const { customerId, productId, quantity } = request.body || {};

  if (!customerId || !productId || !quantity) {
    return reply.code(400).send({
      error: "Missing required fields",
    });
  }

  return reply.code(201).send({
    orderId: `order-${Date.now()}`,
    customerId,
    productId,
    quantity,
    status: "created",
  });
});

fastify.listen({ port: 3000, host: "0.0.0.0" });
