<p align="center">
  <a href="https://github.com/authcompanion/authcompanion" rel="noopener">
 <img width=200px height=200px src="https://i.imgur.com/VjsHEC9.png" alt="Project logo"></a>
</p>

<h2 align="center">AuthCompanion</h2>

<p align="center"> An effortless, token-based user management server - well suited for modern web projects.
</p>

<div align="center">

<a href="">
     <img alt="Active" src="https://img.shields.io/badge/status-early%20development-orange?">
   </a>
   <a href="https://github.com/pmprosociety/authcompanion/stargazers">
     <img alt="GitHub stars" src="https://img.shields.io/github/stars/pmprosociety/authcompanion">
   </a>
   <a href="https://github.com/denoland/deno/releases/tag/v1.21.2">
     <img src="https://img.shields.io/badge/deno-v1.22.2-green?logo=deno"/>
   </a>

</div>
<br />
<p align="center">  <a href="https://docs.authcompanion.com/"> Read the AuthCompanion Documentation</a>
</p>

---

## Introduction

AuthCompanion aims to satisfy the most common identity and user management needs
for single factor authentication. With AuthC you can:

- Securely handle user registration, login, logout, and account recovery.
- Generate and validate [JWTs](https://jwt.io/introduction), a token used for
  authenticating users into your application APIs.

## Get Started

Start by downloading AuthCompanion on your preferred platform

| Platform    | Download                                                                                                  |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| Windows x64 | ![download](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white) |
| MacOS x64   | ![download](https://img.shields.io/badge/macOS-5F85CE?style=for-the-badge&logo=apple&logoColor=white)     |
| MacOS ARM   | ![download](https://img.shields.io/badge/macOS_ARM-999999?style=for-the-badge&logo=apple&logoColor=white) |
| Linux x64   | ![download](https://img.shields.io/badge/Linux-EBA201?style=for-the-badge&logo=linux&logoColor=white)     |

To run AuthCompanion for the first time, begin with the setup wizard and follow
the prompts to start the server

```sh
$ ./authcompanion setup
```

## From Source

Downloading the source code or clone this repository

```sh
$ git clone https://github.com/authcompanion/authcompanion.git
```

Make sure to change the working directory

```sh
$ cd authcompanion/
```

And install the authcompanion server using the setup wizard if you're starting
for the first time

```sh
$ deno run -A --unstable bin/cmd.ts setup
```

### With Docker

Make sure you have the respository cloned as in the previous step. If you have
it cloned already you can skip this step

```sh
$ git clone https://github.com/authcompanion/authcompanion.git
```

Start up the AuthCompanion server by running this
[docker compose](https://docs.docker.com/compose/install/) command:

```sh
$ docker-compose up
```

Or you could instead build and run locally using docker:

```sh
$ docker build -t authc_server .
```

```sh
$ docker run --name authcompanion \
 --env-file .env \
 -v $(pwd)/db/:/app/db/ \
 -p 3002:3002 \
authc_server
```

---

## Features

- [x] **Web Forms for User Auth:** Use pre-built and customizable web forms for
      your application users to: log in with their credentials, register an
      account, update their profile, and issue forgotten passwords.

- [x] **Manage User Profiles and JWTs:** Update the password and profile
      information of your users - all account information is stored in a SQLite
      database. Easily manage the life-cycle of your user's JWT used for
      authentication.

- [x] **User Account Recovery:** Restore a user's access to their account using
      the **Forgot Password** flow which sends a special link via email for
      helping users quickly recover their account.

The default AuthC server configuration strives to be reasonable and sane for
getting started with user authentication easily.

### Web Forms for Authentication

The web forms for login, registration and forgot password are built using
[Vue.js](https://v3.vuejs.org/) and [Tailwindcss](https://tailwindcss.com/) -
making them easily customizable for your specific branding and auth needs (no
build step required, restart the AuthC to view your code changes). 👍

After successful login or registration using the web forms, the user's Access
Token (a JWT) is made available for developers to use when authenticating a user
into your web application APIs.

|             Login Screen              |            Registration Screen             |
| :-----------------------------------: | :----------------------------------------: |
| ![Login](./.github/public/login.png)  | ![Register](./.github/public/register.png) |
| http://localhost:3002/client/v1/login |  http://localhost:3002/client/v1/register  |

Other helpful web forms include: the profile page, available at `/profile` and
the forgot password page at `/recovery`.

---

## Explore

### 1. Create a user

AuthC comes with pre-built [Web Forms](#web-forms-for-authentication) to help
you quickly integrate user auth alongside your web application and backend APIs.

With the AuthC server running, start first by registering an account using this
web form: http://localhost:3002/client/v1/register

### 2. Login as the new user

Next, log in with the account you just created using your email and password at
this web form: http://localhost:3002/client/v1/login.

### 3. Examine the APIs

Lastly, check out the [Authentication API](#authentication-api) for information
on how you can manage user authentication.

---

## Authentication API Docs

The RESTful Authentication API powers the web forms and can be used to build
your own authentication flows.

### Server URL

http://localhost:3002/api/v1/

### Paths

Returns Content-Type: application/json

### auth/register

Description: Register your first user. Returns a JWT access token and sets a
refresh token (as a http only cookie). JWTs are used by your application to
authenticate a user.

**POST** Request Body:

```yaml
{
    "name": "Authy Person",
    "email": "hello_world@authcompanion.com",
    "password": "mysecretpass"
}
```

Response:

```yaml
{
  "data": {
    "id": "6eee5ca5-d68f-4698-906d-62af6d705f05",
    "type": "Register",
    "attributes": {
      "name": "Authy Person",
      "email": "hello_world@authcompanion.com",
      "created": "2021-05-12T00:05:13.243Z",
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZlZWU1Y2E1LWQ2OGYtNDY5OC05MDZkLTYyYWY2ZDcwNWYwNSIsIm5hbWUiOiJBdXRoeSBQZXJzb24iLCJlbWFpbCI6ImhlbGxvX3dvcmxkQGF1dGhjb21wYW5pb24uY29tIiwiZXhwIjoxNjIwNzkyMzEzfQ.VpkhYRnAzIE75dWVOKLMKHocB2R0kCRsEV6DDctx2h8",
      "access_token_expiry": 1620792313
    }
  }
}
```

---

### auth/login

Description: If the request provides a valid username and password, return a JWT
access token and set a refresh token (as a http only cookie).

**POST** Request Body:

```yaml
{
    "email": "hello@authcompanion.com",
    "password": "mysecretpass"
}
```

Response:

```yaml
{
  "data": {
    "id": "6eee5ca5-d68f-4698-906d-62af6d705f05",
    "type": "Login",
    "attributes": {
      "name": "Authy Person",
      "email": "hello_world@authcompanion.com",
      "created": "2021-05-12T00:05:13.243Z",
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZlZWU1Y2E1LWQ2OGYtNDY5OC05MDZkLTYyYWY2ZDcwNWYwNSIsIm5hbWUiOiJBdXRoeSBQZXJzb24iLCJlbWFpbCI6ImhlbGxvX3dvcmxkQGF1dGhjb21wYW5pb24uY29tIiwiZXhwIjoxNjIwNzkyNDg2fQ.XPRAwMtkus2gd1MaTW2wDEs2SF048uOco_aAiQfTYhQ",
      "access_token_expiry": 1620792486
    }
  }
}
```

---

### auth/refresh

Description: If the request has a valid refresh token (stored as http only
cookie) return an access token and set a new refresh token http only cookie.

Sometimes your access token (JWTs) will expire. When they do, you can refresh
the access token without asking your user to log in again.

**POST** Request Body: None Required

Cookie required: refreshToken={user's refresh token}

Response:

```yaml
{
  "data": {
    "id": "6eee5ca5-d68f-4698-906d-62af6d705f05",
    "type": "Refresh",
    "attributes": {
      "name": "Authy Person",
      "email": "hello_world@authcompanion.com",
      "created": "2021-05-12T00:05:13.243Z",
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZlZWU1Y2E1LWQ2OGYtNDY5OC05MDZkLTYyYWY2ZDcwNWYwNSIsIm5hbWUiOiJBdXRoeSBQZXJzb24iLCJlbWFpbCI6ImhlbGxvX3dvcmxkQGF1dGhjb21wYW5pb24uY29tIiwiZXhwIjoxNjIwODAwODYwfQ.dqPcv27hxmWcYastcXgRyrHKE3lFvz4OD8wPz6yAmPM",
      "access_token_expiry": 1620800860
    }
  }
}
```

---

### auth/users/me

Description: Update the user's record by changing their name, email and
password.

**POST** Request Body:

```yaml
{
    "name": "Authy Person1",
    "email": "hello_world1@authcompanion.com",
    "password": "mysecretpass"
}
```

*password field is optional

Authorization Required: Bearer {user's access token}

Response:

```yaml
{
  "data": {
    "id": "6eee5ca5-d68f-4698-906d-62af6d705f05",
    "type": "Updated User",
    "attributes": {
      "name": "Authy Person1",
      "email": "hello_world1@authcompanion.com",
      "created": "2021-05-12T00:05:13.243Z",
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZlZWU1Y2E1LWQ2OGYtNDY5OC05MDZkLTYyYWY2ZDcwNWYwNSIsIm5hbWUiOiJBdXRoeSBQZXJzb24xIiwiZW1haWwiOiJoZWxsb193b3JsZDFAYXV0aGNvbXBhbmlvbi5jb20iLCJleHAiOjE2MjA4MDA5NDd9.44lKad-6le-wmofkQ9QebIkdB6QtotnvAW7aApxfiA0",
      "access_token_expiry": 1620800947
    }
  }
}
```

---

### auth/recovery

Description: If the request has a valid user email, issue an account recovery
email which contains a URL with a recovery token in the query parameters
(referred to as a Magic Link). Works together with '/auth/recovery/' to restore
a user's access to an account. Your application UI will be responsible for 1)
trading the recovery token for an access token using 'auth/recovery/token'
below 2) handling where to route the user within the application once
successful.

**POST** Request Body:

```yaml
{
    "email": "hello_world@authcompanion.com"
}
```

Response:

```yaml
{
  "data": {
    "type": "Recover User",
    "detail": "An email containing a recovery link has been sent to the email address provided."
  }
}
```

---

### auth/recovery/token

Description: If the request has a valid and short lived recovery token (issued
from the recovery email), trade it for a new access token, so the user can
login. This completed the "Forgot Password" user flow!

**POST** Request Body:

```yaml
{
    "token": "{user's recovery token here}"
}
```

Response:

```yaml
{
  "data": {
    "type": "Recovery Login",
    "attributes": {
      "name": "Authy Person1",
      "email": "hello_world1@authcompanion.com",
      "created": "2021-05-12T00:05:13.243Z",
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZlZWU1Y2E1LWQ2OGYtNDY5OC05MDZkLTYyYWY2ZDcwNWYwNSIsIm5hbWUiOiJBdXRoeSBQZXJzb24xIiwiZW1haWwiOiJoZWxsb193b3JsZDFAYXV0aGNvbXBhbmlvbi5jb20iLCJleHAiOjE2MjA4MDE0MDl9.sUhT-tDK_ZW4zADhfBku6Z9mMDm6yuELYfDgmwLojz4",
      "access_token_expiry": 1620801409
    }
  }
}
```

---

### auth/logout

Description: Call this endpoint when the user clicks 'log out'. Only the user's
refresh token will be invalidated using this route. Authorization tokens are
still valid for the period of their expiration date. This means, the UI is
responsible for implementation of these APIs should remove the Authorization
token from the application memory and require the user to login again to receive
a new token.

**GET** Request Body: None Required

Authorization Required: Bearer {user's access token}

Response:

```yaml
{
  "data": {
    "id": "6eee5ca5-d68f-4698-906d-62af6d705f05",
    "type": "Logout User",
    "attributes": {
      "name": "Authy Person1",
      "email": "hello_world1@authcompanion.com"
    }
  }
}
```

---

## Reference Architecture

![landscape](./.github/public/authcLandscape.png)

## Related Readings

Be sure to familiarize yourself with token-based authentication using JSON Web
Tokens.

- [The Ultimate Guide to handling JWTs on frontend
  clients](https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/)

- [Web Authentication Method Comparison](https://testdriven.io/blog/web-authentication-methods/#token-based-authentication)

## License

AuthCompanion is licensed under the
[Big Time Public License](https://bigtimelicense.com/versions/2.0.1). Read more
about the license rationale
[here](https://docs.authcompanion.com/guide/licenseoverview.html).

## Contributions

Thank you for
[considering a contribution](https://docs.authcompanion.com/contributing/), here
to help.

Cheers for the logo design - Timothy Reeder
[(Github)](https://github.com/tokonoma)

---

Take AuthCompanion, the useful sidekick, into your next web project! 👏
