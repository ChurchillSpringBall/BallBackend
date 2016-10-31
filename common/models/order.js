'use strict';

// TODO: centralise the keys
const stripe = require('stripe')('sk_test_kSs5RGJjZRksLYpaf6rwhywQ');

module.exports = function (Order) {
  /**
   * Validate the totals and payments
   * @param body
   * @param req
   * @returns {Promise}
   */
  Order.makeOrder = (order, req) => {
    // TODO: check billing such as stripe
    // TODO: set prices etc. on tickets as per the standard
    // TODO: totals + payment fees
    // TODO: add and validate order uuid to prevent duplicate orders
    // TODO: validate userId is from the requesting user

    console.log(req.accessToken);
    order.userId = req.accessToken.userId;
    order.paymentToken = order.paymentToken.id;

    const tickets = order.tickets;
    if (!tickets || !tickets.length) {
      throw new Error('No tickets are in the order object?');
    }

    if (tickets.length > 20) { // TODO: centralise max tickets purchasing + check already bought tickets
      throw new Error('Attempting to purchase too many tickets');
    }

    return Order.app.models.TicketType.find()
      .then(ticketTypes => {
        const types = {};
        ticketTypes.forEach(type => {
          types[type.id] = type;
        });

        let total = 0;
        tickets.forEach(ticket => {
          const type = types[ticket.ticketTypeId];
          ticket.price = type.price;
          total += ticket.price;

          if (!type.sold) {
            type.purchasing = 0;
          }

          type.purchasing += 1;
        });

        let fees = 0;
        if (order.paymentMethod === 'stripe') {
          fees = calculateStripeFees(total);
        }

        order.total = total + fees;

        // TODO: check that tickets of this type are available
        // TODO: check user hasn't bought more than x tickets already?

        if (order.paymentMethod === 'stripe') {
          return stripe.charges.create({
            amount: Math.round(order.total * 100),
            currency: 'GBP',
            source: order.paymentToken,
            description: 'Churchill Spring Ball Tickets',
            statement_descriptor: 'Chu Ball Tickets'
          });
        }
      })
      .then(() => Order.create(order))
      .then(order => {
        tickets.forEach(ticket => ticket.orderId = order.id);
        // for some reason Ticket.create doesn't return a Promise...
        return new Promise((resolve, reject) => {
          Order.app.models.Ticket.create(tickets, (error, tickets) => {
            if (error) {
              return reject(error);
            }

            // avoid getter/property permissions issues by cloning
            const clonedOrder = JSON.parse(JSON.stringify(order));

            clonedOrder.tickets = tickets;
            return resolve(clonedOrder); // return complete order object
          });
        });
      });
  };

  Order.remoteMethod('makeOrder', {
    accepts: [
      {arg: 'order', type: 'object', http: {source: 'body'}, required: true},
      {arg: 'req', type: 'object', http: {source: 'req'}},
    ],
    returns: {arg: 'order', type: 'object'},
    http: {path: '/make', verb: 'post'}
  })
};

/**
 * Calculate the cost of Stripe fees
 * @param total
 * @returns {number}
 */
function calculateStripeFees(total) {
  return 0.2 + 0.014 * total;
}
