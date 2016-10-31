'use strict';

const loopback = require('loopback');
const request = require('request-promise-native');

module.exports = function (Profile) {
  /**
   * Loads a profile from LDAP for a user. Does not return this user's identity as we should only release that
   * to the user themselves.
   * @param userId
   * @returns {Promise.<boolean>}
   */
  Profile.loadProfile = (userId) => {
    console.log(`Loading LDAP profile for user ${userId}`);
    return Profile.findOne({where: {userId: userId}})
      .then(profile => {
        if (profile) {
          return true;
          // TODO: refresh if LDAP lookup occurred in the last 24h
          // TODO: check why LDAP stopped!? Is there a request limit or throttling, or an error with the following code?
        } else {
          return Profile.app.models.UserIdentity.findOne({where: {userId: userId}})
            .then(identity => Profile.ldapLookup(identity.externalId))
            .then(profile => {
              profile.userId = userId;

              return Profile.upsertWithWhere({userId: userId}, profile);
            });
        }
      })
      .then(() => true);
  };

  /**
   * Perform an LDAP lookup on a user's crsid via the Churchill JCR site to proxy into the CUDN for LDAP
   * @param crsid
   * @returns {Promise}
   */
  Profile.ldapLookup = (crsid) => {
    const search = {
      filter: `(uid=${crsid})`,
      scope: 'sub',
      // sizeLimit: 10
    };

    console.log(search);

    request.get({
      uri: `http://jcr.chu.cam.ac.uk/ldap/${crsid}`,
      json: true
    })
      .then(response => {
        if (!response.count) throw new Error(`No results for ${crsid}`);

        const profile = {
          name: response[0].displayname[0],
          email: response[0].mail[0],
          institution: response[0].ou[0],
          crsid: response[0].uid[0],
          isChurchill: response[0].ou[0].startsWith('Churchill College')
        };

        if (!profile.name || !profile.email || !profile.institution || !profile.crsid) {
          throw new Error(`Invalid Raven response. Could not get user's name, email, or institution.`);
        }

        return profile;
      })
      .catch(error => {
        console.error(error);
        throw error;
      });
  };

  Profile.remoteMethod('loadProfile', {
    accepts: {arg: 'userid', type: 'number', required: true},
    returns: {arg: 'success', type: 'boolean'},
    http: {path: '/load', verb: 'get'}
  });
};
