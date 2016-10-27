'use strict';

const ldap = require('ldapjs');
const ldapClient = ldap.createClient({
  url: 'ldap://ldap.lookup.cam.ac.uk' //:1389'
});

module.exports = function(User) {
  User.checkCollege = (college) => {

  };

  User.ldapLookup = () => {
    const user = 'lng25';
    const search = {
      filter: `(uid=${user})`,
      scope: 'sub'
    };

    ldapClient.search('ou=people,o=University of Cambridge,dc=cam,dc=ac,dc=uk', search, (err, ldapRes) => {
      if (err) throw err;

      ldapRes.on('searchEntry', (entry) => {
        console.log('entry: ' + JSON.stringify(entry.object));
      });

      ldapRes.on('searchReference', (referral) => {
        console.log('referral: ' + referral.uris.join());
      });

      ldapRes.on('error', (err) => {
        console.error('error: ' + err.message);
      });

      ldapRes.on('end', (result) => {
        console.log('status: ' + result.status);
      });
    });
  };
};
