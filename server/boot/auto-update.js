'use strict';

module.exports = function AutoUpdate(server) {
  const dataSource = server.dataSources.db;

  return dataSource.autoupdate()
    .then(() => console.log('Updated schema.'))
    // TODO: make lng25 an admin user
    .then(() => {
      return server.models.TicketType.upsertWithWhere({name: 'Standard'}, {
        name: 'Standard',
        description: 'Unlimited food and drink with all entertainment and acts included.',
        price: 85,
        quantity: 750,
      })
    })
    .then(() => {
      return server.models.TicketType.upsertWithWhere({name: 'Queue Jump'}, {
        name: 'Queue Jump',
        description: 'All the Standard perks with priority entry into the ball.',
        price: 95,
        quantity: 150
      });
    })
    // testing LDAP
    // .then(() => server.models.Profile.ldapLookup('lng25'))
    // .then(profile => console.log(profile))
    // .then(() => server.models.Profile.ldapLookup('sg768'))
    // .then(profile => console.log(profile))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
};
