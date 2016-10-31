'use strict';

module.exports = function AutoUpdate(server) {
  const dataSource = server.dataSources.db;

  return dataSource.autoupdate()
    .then(() => console.log('Updated schema.'))
    // TODO: make lng25 an admin user
    .then(() => {
      return server.models.TicketType.upsertWithWhere({name: 'Standard'}, {
        name: 'Standard',
        description: 'Very short sentence about what the standard ticket offers.',
        price: 85,
        quantity: 750,
      })
    })
    .then(() => {
      return server.models.TicketType.upsertWithWhere({name: 'Queue Jump'}, {
        name: 'Queue Jump',
        description: 'Very short sentence about what the queue jump ticket offers.',
        price: 95,
        quantity: 150
      });
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
};
