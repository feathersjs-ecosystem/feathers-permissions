# feathers-permissions Example

This provides a complete working example of some of the basic usage of `feathers-permissions`.

1. Start the app by running `npm start`
2. Make a request using the authenticated user.

```bash
curl -H "Content-Type: application/json" -X POST -d '{"email":"admin@feathersjs.com","password":"admin"}' http://localhost:3030/authentication
```
