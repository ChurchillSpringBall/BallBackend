'use strict';

const ldap = require('ldapjs');
const ldapClient = ldap.createClient({
  url: 'ldap://ldap.lookup.cam.ac.uk'
});

module.exports = function (User) {
  User.ldapLookup = (crsid) => {
    const search = {
      filter: `(uid=${crsid})`,
      scope: 'sub'
    };

    return new Promise((resolve, reject) => {
      ldapClient.search('ou=people,o=University of Cambridge,dc=cam,dc=ac,dc=uk', search, (err, ldapRes) => {
        if (err) throw err;

        const results = [];

        ldapRes.on('searchEntry', (entry) => {
          console.log('entry: ' + JSON.stringify(entry.object));
          results.push(entry.object);
        });

        // NOTE: not entirely sure what this is
        ldapRes.on('searchReference', (referral) => {
          console.log('referral: ' + referral.uris.join());
        });

        ldapRes.on('error', (err) => {
          console.error('error: ' + err.message);
          reject(err);
        });

        ldapRes.on('end', (result) => {
          console.log('status: ' + result.status);
          resolve(results);
        });
      });
    });
  };

  User.remoteMethod('ldapLookup', {
    accepts: {arg: 'crsid', type: 'string', required: true},
    http: {path: '/:crsid/ldap', verb: 'get'}
  });
};
