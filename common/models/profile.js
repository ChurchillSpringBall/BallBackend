'use strict';

const ldap = require('ldapjs');
const ldapClient = ldap.createClient({
  url: 'ldap://ldap.lookup.cam.ac.uk'
});

module.exports = function(Profile) {
  Profile.isChurchill = (crsid) => {
    return Profile.ldapLookup(crsid)
      .then(results => {
        if (!(results && results.length === 1)) {
          throw new Error('Invalid number of responses for crsid ' + crsid);
        }

        const profile = results[0];
        return profile.ou.includes('Churchill College');
      });
  };

  Profile.ldapLookup = (crsid) => {
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
          return reject(err);
        });

        ldapRes.on('end', (result) => {
          console.log('status: ' + result.status);
          return resolve(results);
        });
      });
    });
  };

  Profile.remoteMethod('isChurchill', {
    accepts: {arg: 'crsid', type: 'string', required: true},
    returns: {arg: 'isChurchill', type: 'boolean'},
    http: {path: '/ischurchill', verb: 'get'}
    // isStatic: false
  });

  Profile.remoteMethod('ldapLookup', {
    accepts: {arg: 'crsid', type: 'string', required: true},
    returns: {arg: 'data', type: 'Object'},
    http: {path: '/ldap', verb: 'get'}
  });
};
