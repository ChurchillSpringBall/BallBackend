'use strict';

module.exports = function(Ticket) {
  // TODO: name-change and admit functions
  /**
   * Allow a user to securely perform a name change on a ticket
   * @param ticket
   * @param req
   */
  Ticket.nameChange = (ticket, req) => {
    const userId = req.accessToken.userId;
    if (!userId && userId !== 0) {
      throw new Error('Authentication failed.');
    }

    if ((!ticket.id && ticket.id !== 0) || !ticket.email || !ticket.name) {
      throw new Error('Invalid ticket name change parameters. Must specify ticket ID, name, and email.');
    }

    return Ticket.findOne({where: {id: ticket.id}})
      .then(savedTicket => {
        return Ticket.app.models.Order.findOne({where: {id: savedTicket.orderId}})
          .then(savedOrder => {
            if (savedOrder.userId !== userId) {
              throw new Error('User IDs don\'t match on tickets!');
            }

            return savedTicket;
          });
      })
      .then(savedTicket => {
        return savedTicket.updateAttributes({
          name: ticket.name,
          email: ticket.email
        });
      });
  };

  Ticket.remoteMethod('nameChange', {
    accepts: [
      {arg: 'ticket', type: 'object', http: {source: 'body'}, required: true},
      {arg: 'req', type: 'object', http: {source: 'req'}},
    ],
    returns: {arg: 'ticket', type: 'object'},
    http: {path: '/name-change', verb: 'post'}
  })

  Ticket.checkTicket = (ticket, req) => {
    const userId = req.accessToken.userId;
    if (!userId && userId !== 0) {
      throw new Error('Authentication failed.');
    }
    if ((!ticket.id && ticket.id !== 0) || !ticket.email || !ticket.name) {
      throw new Error('Invalid ticket name change parameters. Must specify ticket ID, name, and email.');
    }
    return Ticket.findOne({where: {id: ticket.id}})
      .then(savedTicket => {
        return Ticket.app.models.Order.findOne({where: {id: savedTicket.orderId}})
          .then(savedOrder => {
            if (savedOrder.userId !== userId) {
              throw new Error('User IDs don\'t match on tickets!');
            }

            return ticket;
          });
      })
  };
  Ticket.remoteMethod('checkTicket', {
    accepts: [
      {arg: 'ticket', type: 'object', http: {source: 'body'}, required: true},
      {arg: 'req', type: 'object', http: {source: 'req'}},
    ],
    returns: {arg: 'ticket', type: 'object'},
    http: {path: '/check-ticket', verb: 'post'}
  });

};
