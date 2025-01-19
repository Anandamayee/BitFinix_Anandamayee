class OrderBook {
  constructor() {
    this.orders = {
      buy: [],
      sell: [],
    };
    console.log("Order Book Initialized");
  }

  /**
   * Add an order to the appropriate order book
   * @param {Object} order - The order to be added
   * @returns {Array} - Matched orders
   */

  async addOrder(order) {
    console.log("Add order Invoked");
    if (!this.isValidOrder(order))
      throw new Error(`Invalid Order : ${JSON.stringify(order)}`);
    if (order?.type === "buy") {
      this.orders.buy.push(order);
      this.orders.buy.sort((a, b) => b.price - a.price);
    } else if (order?.type === "sell") {
      this.orders.sell.push(order);
      this.orders.sell.sort((a, b) => b.price - a.price);
    }
    return this.order;
  }

  /**
   * Get the current state of the order books
   * @returns {Object} - The buy and sell order books
   */
  async getOrder() {
    console.log("get order Invoked");
    return this.orders;
  }

  /**
   * Match buy and sell orders in the order book
   * @returns {Array} - List of matched orders
   */
  async matchOrder(orderBook, order, clientId) {
    console.log("match order Invoked");

    const matchedOrders = [];

    for (const [key, value] of Object.entries(orderBook)) {
      if (key == clientId) break;
      const { buy, sell } = value.orders;
      // Match buy orders (if order is sell) or sell orders (if order is buy)
      const counterpartyOrders = order.type === "buy" ? sell : buy;

      counterpartyOrders.forEach((counterpartyOrder, counterpartyOrderIndex) => {
        const priceMatch =
          (order.type === "buy" && order.price >= counterpartyOrder.price) ||
          (order.type === "sell" && order.price <= counterpartyOrder.price);
        if (priceMatch) {
          const tradedQuantity = Math.min(order.quantity, counterpartyOrder.quantity);
          const tradedPrice = counterpartyOrder.price;
          order.quantity -= tradedQuantity;
          counterpartyOrder.quantity -= tradedQuantity;
          matchedOrders.push({
            buyOrder: order.type === "buy" ? order : counterpartyOrder,
            sellOrder: order.type === "sell" ? counterpartyOrder : order,
            tradedPrice,
            tradedQuantity,
          });
        }
        // Remove fully filled counterparty order
        if (counterpartyOrder.quantity === 0) {
          counterpartyOrders.splice(counterpartyOrderIndex, 1);
        }
        // Exit loop if order is fully filled
        if (order.quantity === 0) {
          return;
        }
      });
    }

    return matchedOrders;
  }

  /**
   * Validate the structure and values of an order
   * @param {Object} order - The order to validate
   * @returns {Boolean} - True if the order is valid, otherwise false
   */

  isValidOrder(order) {
    return (
      order &&
      ["buy", "sell"].includes(order.type) &&
      order.price > 0 &&
      order.quantity > 0
    );
  }
}

module.exports = OrderBook;
