'use strict';

module.exports = function (Order) {
  /**
   * Validate the totals and payments
   * @param req
   * @param order
   * @returns {Promise}
   */
  Order.makeOrder = (req, order) => {
    // TODO: check billing such as stripe
    // TODO: set prices etc. on tickets as per the standard
    // TODO: totals + payment fees
    // TODO: add and validate order uuid to prevent duplicate orders
    // TODO: validate userId is from the requesting user
    console.log(req.accessToken);
    order.userId = req.accessToken.userId;

    const tickets = order.tickets;
    if (!tickets || !tickets.length) {
      throw new Error('No tickets are in the order object?');
    }

    if (tickets.length > 5) { // TODO: centralise max tickets purchasing + check already bought tickets
      throw new Error('Attempting to purchase too many tickets');
    }

    return Order.create(order)
      .then(order => {
        tickets.forEach(ticket => ticket.orderId = order.id);
        // for some reason Ticket.create doesn't return anything...
        return new Promise((resolve, reject) => {
          Order.app.models.Ticket.create(tickets, (error, tickets) => {
            if (error) {
              throw error;
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
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'order', type: 'object', required: true}
    ],
    returns: {arg: 'order', type: 'object'},
    http: {path: '/make', verb: 'post'}
  })
};
