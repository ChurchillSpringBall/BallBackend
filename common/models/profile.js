'use strict';

const loopback = require('loopback');
const ldap = require('ldapjs');
const ldapClient = ldap.createClient({
  url: 'ldap://ldap.lookup.cam.ac.uk'
});

module.exports = function (Profile) {
  /**
   * Loads a profile from LDAP for a user. Does not return this user's identity as we should only release that
   * to the user themselves.
   * @param userId
   * @returns {Promise.<boolean>}
   */
  Profile.loadProfile = (userId) => {
    return Profile.findOne({where: {userId: userId}})
      .then(profile => {
        if (profile) {
          return true;
          // TODO: refresh if LDAP lookup occurred in the last 24h
          // TODO: check why LDAP stopped!? Is there a request limit or throttling, or an error with the following code?
        } else {
          return Profile.app.models.UserIdentity.findOne({where: {userId: userId}})
            .then(identity => Profile.ldapLookup(identity.externalId))
            .then(ldap => {
              if (!(ldap && ldap.length === 1)) {
                throw new Error('Could not fetch user Raven profile via LDAP');
              }

              const user = ldap[0];

              return Profile.upsertWithWhere({userId: userId}, {
                name: user.displayName,
                crsid: user.uid,
                institution: user.ou,
                email: user.mail,
                isChurchill: user.ou.startsWith('Churchill College'),
                userId: userId
              });
            });
        }
      })
      .then(() => true);
  };

  /**
   * Perform an LDAP lookup on a user's crsid
   * @param crsid
   * @returns {Promise}
   */
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

  Profile.remoteMethod('loadProfile', {
    accepts: {arg: 'userid', type: 'number', required: true},
    returns: {arg: 'success', type: 'boolean'},
    http: {path: '/load', verb: 'get'}
  });
};
