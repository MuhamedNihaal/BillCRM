# Project Details

#### Authentication Guide

**Login Endpoint**

- Endpoint: `/auth/login`
- Method: `POST`
- Description: Authenticates the user and returns an user data and refresh token.
- Request body:

```js
{
  "email": "admin",
  "password": "123456",
  "rememberMe": false
}
```

- Response:

```js
{
  "data": { name: "user", email: "user@example.com"},
  "refreshToken": "refresh_token",
}
```

**Token Storage and expire**

- access token is stored in user's cookies in 15min
- if remember is true, the refresh token expires in 30 days otherwise it expires in 7 days.

**Authentication Required Requests**

- When making requests to authenticated endpoints, you must add a custom header
- The refresh token should not be sent in plain text instead:
  - Use the `encrypt_refresh_token_generator.js` file on the server to encrypt your refresh token
  - set the encrypted value as the header `x-refresh-token: <encrypted_refresh_token>` in your request.

#### Notes

- the access token is automatically stored in the user's cookies after login
- Refresh token to automatically renew the access token when calling an authentication-required route if the access token has expired

#### Middleware Guide

```js
auth({master: true})
#or
auth({common: true})
#or
auth({menu: "/rule"})
```

| Params   | Descriptoin                                                  |
| -------- | ------------------------------------------------------------ |
| menu     | Pass here valid menu link or name                            |
| master   | Its only for administrator level checking                    |
| common   | Its usage for only common routes like user profile, activity |
| sub_menu | Pass here valid sub menu link or name                        |
