// This client will as the DHT for a service called `rpc_test`
// and then establishes a P2P connection it.
// It will then send { msg: 'hello' } to the RPC server

"use strict";

const { PeerRPCClient } = require("grenache-nodejs-http");
const Link = require("grenache-nodejs-link");
const readline = require("readline");

const GRAPE_URL = process.env.GRAPE_URL || "http://127.0.0.1:30001";
const CLIENT_ID = `client_${Math.floor(Math.random() * 1000)}`;

//connect grape to DHT
const link = new Link({
  grape: GRAPE_URL,
});
link.start();

const peer = new PeerRPCClient(link, {});
peer.init();

/**
 * Function to submit an order to the RPC server
 * @param {Object} order - The order object containing type, price, and quantity
 */

async function submitOrder(order) {
  try {
    console.log("Order matched:", order);

    // for (let i = 0; i < reqs; i++) {
    peer.request(
      `orderBook_service`,
      { clientId: CLIENT_ID, action: "addOrder", order },
      { timeout: 10000 },
      (err, data) => {
        if (err) {
          console.error("Error submitting order:", err);
        }
        console.log("Order matched:", data);
      }
    );
    // }
  } catch (err) {
    console.error("Error submitting order:", err);
  }
}

/**
 * Function to fetch the client's order books from the RPC server
 */

async function getOrderBooks() {
  try {
    peer.request(
      `orderBook_service`,
      { clientId: CLIENT_ID, action: "getOrder" },
      { timeout: 10000 },
      (err, data) => {
        if (err) {
          console.error("Error getting order:", err);
        }
        console.log("Order Books", data);
      }
    );
  } catch (err) {
    console.error("Error getting order:", err);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function mainMenu() {
  rl.question(
    "\nChoose an action:\n1. Match Order\n2. View Order Books\n3. Exit\nEnter your choice: ",
    (choice) => {
      switch (choice.trim()) {
        case "1":
          handleOrderInput();
          break;
        case "2":
          getOrderBooks();
          mainMenu();
          break;
        case "3":
          rl.close();
          break;
        default:
          console.log("Invalid choice. Try again.");
          mainMenu();
      }
    }
  );
}

function handleOrderInput() {
  rl.question("Enter order type (buy/sell): ", (type) => {
    rl.question("Enter price: ", (price) => {
      rl.question("Enter quantity: ", (quantity) => {
        const order = {
          type: type.toLowerCase(),
          price: parseFloat(price),
          quantity: parseInt(quantity, 10),
        };

        console.log("\nOrder input received:", order);
        submitOrder(order);

        // Go back to main menu after processing the order
        mainMenu();
      });
    });
  });
}

// Start the application
mainMenu();

// Catch unexpected errors and prevent server crash
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message, err.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
