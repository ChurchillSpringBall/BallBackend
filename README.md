# My Application

The project is generated by [LoopBack](http://loopback.io).

To build the Angular 2 Loopback SDK, make sure this backend project and the angular frontend project are named as `frontend` and `backend` or the `npm build:sdk` command won't work.

```
parent-dir/
  frontend/
    <angular2 part>
    src/
      admin/
      public/
      shared/
        sdk/
  backend/
    <loopback part>
    common/
    server/
```

You can also symlink the `frontend/dist` folder to `client-symlink` in this project and then configure your `server/config.development.json` to set the `client/` directory to your newly symlinked dir. Then run the frontend using `npm run watch:prod` to build the frontend `dist/` folder.

You will also need to copy set up your config files in the `server/` folder:

```
cp config.example.json config.json
cp datasources.example.json datasources.json
cp providers.example.json providers.json
```

TODO
----

- Loopback's passport support sucks, so the emails in the user column are invalid and instead are formatted as `crsid@loopback.raven.com` no matter what I try. I've also had to modify `passport-raven` to act as if it were an openid library. Finding a better Raven solution is recommended. Currently the email needs to be scraped from `User.UserIdentity.profile.email`
- LDAP lookup for raven.
