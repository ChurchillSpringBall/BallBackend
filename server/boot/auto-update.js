'use strict';

module.exports = function AutoUpdate(server) {
  const dataSource = server.dataSources.db;

  return dataSource.autoupdate()
    .then(() => console.log('Updated schema.'))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
};
