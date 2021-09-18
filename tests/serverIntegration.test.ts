import { assertEquals } from "https://deno.land/std@0.107.0/testing/asserts.ts";
import { db } from "../db/db.ts";

async function purgeTestData() {
  await db.queryObject(
    "DELETE FROM users WHERE email = $1;",
    "test_pass@authcompanion.com",
  );

  db.release();
}

Deno.test({
  name: "API Endpoint Test: /auth/register",
  async fn() {
    // Clean out the test data from the DB
    await purgeTestData();

    const requestBody = {
      "name": "Authy Person Testcases",
      "email": "test_pass@authcompanion.com",
      "password": "mysecretpass",
    };

    const response = await fetch("http://localhost:3002/api/v1/auth/register", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody), // body data type must match "Content-Type" header
    });

    response.json(); // parses JSON response into native JavaScript objects

    assertEquals(
      response.status,
      201,
      "The API did not return a successful response",
    );
  },
});

Deno.test({
  name: "API Endpoint Test: /auth/login",
  async fn() {
    const requestBody = {
      "email": "test_pass@authcompanion.com",
      "password": "mysecretpass",
    };

    const response = await fetch("http://localhost:3002/api/v1/auth/login", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody), // body data type must match "Content-Type" header
    });

    response.json(); // parses JSON response into native JavaScript objects

    assertEquals(
      response.status,
      200,
      "The API did not return a successful response",
    );
  },
});

Deno.test({
  name: "API Endpoint Test: /auth/refresh",
  async fn() {
    const requestBody = {
      "email": "test_pass@authcompanion.com",
      "password": "mysecretpass",
    };

    const response = await fetch("http://localhost:3002/api/v1/auth/login", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody), // body data type must match "Content-Type" header
    });

    response.json(); // parses JSON response into native JavaScript objects

    assertEquals(
      response.status,
      200,
      "The API did not return a successful response",
    );
  },
});

Deno.test({
  name: "API Endpoint Test: /auth/users/me",
  async fn() {
    const loginRequestBody = {
      "email": "test_pass@authcompanion.com",
      "password": "mysecretpass",
    };

    const loginResponse = await fetch(
      "http://localhost:3002/api/v1/auth/login",
      {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginRequestBody), // body data type must match "Content-Type" header
      },
    );

    const loginres = await loginResponse.json(); // parses JSON response into native JavaScript objects

    const requestBody = {
      "name": "Authy Person Testcases",
      "email": "test_pass@authcompanion.com",
      "password": "mysecretpass",
    };

    const response = await fetch("http://localhost:3002/api/v1/auth/users/me", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${loginres.data.attributes.access_token}`,
      },
      body: JSON.stringify(requestBody), // body data type must match "Content-Type" header
    });

    response.json(); // parses JSON response into native JavaScript objects

    assertEquals(
      response.status,
      200,
      "The API did not return a successful response",
    );
  },
});

Deno.test({
  name: "API Endpoint Test: /auth/recovery",
  async fn() {
    const requestBody = {
      "email": "test_pass@authcompanion.com",
    };

    const response = await fetch("http://localhost:3002/api/v1/auth/recovery", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody), // body data type must match "Content-Type" header
    });

    response.json(); // parses JSON response into native JavaScript objects

    assertEquals(
      response.status,
      200,
      "The API did not return a successful response",
    );
  },
});

// TODO
// Deno.test({
//     name: "API Endpoint Test: /auth/recovery/token",
//     async fn() {
//       const requestBody = {
//         "token": "token",
//       };

//       const response = await fetch("http://localhost:3002/api/v1/recovery/token", {
//         method: "POST", // *GET, POST, PUT, DELETE, etc.
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(requestBody), // body data type must match "Content-Type" header
//       });

//       response.json(); // parses JSON response into native JavaScript objects

//       assertEquals(
//         response.status,
//         200,
//         "The API did not return a successful response",
//       );
//     },
//   });

Deno.test({
  name: "API Endpoint Test: /auth/logout",
  async fn() {
    const requestBody = {
      "email": "test_pass@authcompanion.com",
      "password": "mysecretpass",
    };

    const loginResponse = await fetch(
      "http://localhost:3002/api/v1/auth/login",
      {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody), // body data type must match "Content-Type" header
      },
    );

    const loginres = await loginResponse.json(); // parses JSON response into native JavaScript objects

    const response = await fetch("http://localhost:3002/api/v1/auth/logout", {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${loginres.data.attributes.access_token}`,
      },
    });

    await response.json();

    // Clean out the test data from the DB
    await purgeTestData();

    assertEquals(
      response.status,
      200,
      "The API did not return a successful response",
    );
  },
});
