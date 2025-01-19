// This RPC server will announce itself as `rpc_test`
// in our Grape Bittorrent network
// When it receives requests, it will answer with 'world'

"use strict";

const { PeerRPCServer } = require("grenache-nodejs-http");
const Link = require("grenache-nodejs-link");
const OrderBook = require("./orderbook");
var AsyncLock = require("async-lock");
var lock = new AsyncLock();

const GRAPE_URL = process.env.GRAPE_URL || "http://127.0.0.1:30001";
const PORT = 1024 + Math.floor(Math.random() * 1000);

//connect grape to DHT
const link = new Link({
  grape: GRAPE_URL,
});

link.start();

const peer = new PeerRPCServer(link, {
  timeout: 300000,
});
peer.init();

const service = peer.transport("server");
service.listen(PORT);

console.log("order started with", PORT);

setInterval(function () {
  link.announce(`orderBook_service`, service.port, {});
}, 1000);

const clientOrderBooks = {};

service.on("request", async (rid, key, payload, handler) => {
  let response;
  const { clientId, action, order } = payload;
  if (!clientId) throw new Error("clientId is required");

  // Initialize an order book for the client if not already present
  if (!clientOrderBooks[clientId]) {
    clientOrderBooks[clientId] = new OrderBook();
  }
  const clientOrderBook = clientOrderBooks[clientId];

  // async lock to avoid race conditions
  await lock.acquire("orderBookLock", async () => {
    try {
      console.log("payload", payload);

      if (action === "addOrder") {
        await clientOrderBook.addOrder(order);
        console.log("clientOrderBook", JSON.stringify(clientOrderBooks));
        response = await clientOrderBook.matchOrder(
          clientOrderBooks,
          order,
          clientId
        );
        handler.reply(null, {
          message: "Order added",
          orders: JSON.stringify(response),
        });
      }
    } catch (error) {
      console.error(`Server Error ${error.message}`);
      handler.reply({ error: error.message }, null);
    }
  },{ timeout: 10000 });
  
  if (action === "getOrder") {
    response = await clientOrderBook.getOrder();
    handler.reply(null, {
      message: "Order Fetched",
      orderBooks: JSON.stringify(response),
    });
  }
});

// Catch unexpected errors and prevent server crash
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message, err.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
