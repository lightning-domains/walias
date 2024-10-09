# API Endpoints

> version: 0.5.1

The API extends all [Lightning Domains standard](https://github.com/lightning-domains/lightning-domains/tree/main/api) for each domain with a `/domains/{domain}/` prefix.
Example: `https://api.walias.io/domains/lacrypta.ar/walias/gorila`

---

## Register Domain

`POST domains/{domain}`

#### Description:

Registers a new domain.

#### Request Body:

```json
{
  "relays": ["wss://relay.domain.com"]
}
```

#### Response:

- **201 Created** (Domain Registered, pending verification)

```json
{
  "domain": "lacrypta.ar",
  "relays": ["wss://relay.domain.com"],
  "verifyUrl": "https://lacrypta.ar/.well-known/walias.json"
}
```

- **400 Bad Request** (Invalid Input)

```json
{
  "reason": "Invalid domain"
}
```

- **409 Conflict**

```json
{
  "reason": "Already taken or not available"
}
```

## Verify Domain

**POST** `domains/{domain}/verify`

#### Description:

Verify domain.

#### Request Body:

> Empty body

#### Response:

- **200** (Domain Verified)

```json
{
  "success": true,
  "domain": "lacrypta.ar",
  "relays": ["wss://relay.domain.com"],
  "adminPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd",
  "rootPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd"
}
```

- **208** (Already Verified)

```json
{
  "success": true,
  "domain": "lacrypta.ar",
  "relays": ["wss://relay.domain.com"],
  "adminPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd",
  "rootPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd"
}
```

- **400 Bad Request** (Invalid Input)

```json
{
  "reason": "Invalid domain"
}
```

- **409 Conflict**

```json
{
  "reason": "Validation failed"
}
```

---

## Update Domain (Authenticated)

**PUT** `domains/{domain}`

#### Description:

Update data from the domain

#### Request Body:

```json
{
  "relays": ["wss://relay.domain.com"],
  "adminPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd",
  "rootPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd" // Optional
}
```

#### Response:

- **200 OK** (Success)

```json
{
  "domain": "lacrypta.ar",
  "relays": ["wss://relay.domain.com"],
  "adminPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd",
  "rootPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd"
}
```

- **400 Bad Request** (Invalid pubkey)

```json
{
  "success": false,
  "reason": "Invalid pubkey"
}
```

- **401 Unauthorized** (Authentication Required)

```json
{
  "success": false,
  "reason": "Authentication required"
}
```

- **403 Forbidden** (Invalid or Expired Authentication)

```json
{
  "success": false,
  "reason": "Invalid authentication. Must be admin or root"
}
```

---

## Delete Domain (Authenticated)

**DELETE** `domains/{domain}`

#### Description:

Deletes an existing domain.

#### Response:

- **200 OK** (Success)

```json
{
  "success": true
}
```

- **404 Not Found** (Domain Not Found)

```json
{
  "success": false,
  "reason": "Domain not found"
}
```

- **401 Unauthorized** (Authentication Required)

```json
{
  "success": false,
  "reason": "Authentication required"
}
```

- **403 Forbidden** (Invalid or Expired Authentication)

```json
{
  "success": false,
  "reason": "Invalid authentication. Must be admin or root"
}
```

---

## Get Domain Information

**GET** `domains/{domain}`

#### Description:

Retrieves information about a specific domain.

#### Response:

- **200 OK** (Success)

For a verified domain:

```json
{
  "domain": "example.com",
  "relays": ["wss://relay.example.com"],
  "adminPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd",
  "rootPubkey": "3cd91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fe",
  "verified": true
}
```

For an unverified domain:

```json
{
  "domain": "unverified.com",
  "relays": ["wss://relay.unverified.com"],
  "adminPubkey": "4ed91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fg",
  "rootPubkey": "5fd91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fh",
  "verified": false,
  "verifyUrl": "https://unverified.com/.well-known/walias.json"
}
```

- **404 Not Found** (Domain Not Found)

```json
{
  "success": false,
  "reason": "Domain not found"
}
```

---

## Get User Data

**GET** `domains/{domain}/users/{pubkey}`

#### Description:

Fetches the details (names and relays) associated with a given public key.

#### Response:

- **200 OK** (Success)

```json
{
  "names": ["some", "handles"],
  "relays": ["wss://relay.url"]
}
```

- **404 Not Found** (User Not Found)

```json
{
  "success": false,
  "reason": "User not found"
}
```

## Update User Data (Authenticated)

**PUT** `domains/{domain}/users/{pubkey}`

#### Description:

Update relay list for the user.

#### Request Body:

```json
{
  "relays": ["wss://relay.newurl.com"]
}
```

#### Response:

- **200 OK** (Success)

```json
{
  "names": ["some", "handles"],
  "relays": ["wss://relay.newurl.com"]
}
```

- **400 Bad Request** (Invalid pubkey)

```json
{
  "success": false,
  "reason": "Invalid pubkey"
}
```

- **401 Unauthorized** (Authentication Required)

```json
{
  "success": false,
  "reason": "Authentication required"
}
```

- **403 Forbidden** (Invalid or Expired Authentication)

```json
{
  "success": false,
  "reason": "Invalid authentication"
}
```

- **404 Not Found** (User Not Found)

```json
{
  "success": false,
  "reason": "User not found"
}
```

---

## Get Wallets from a Specific User (Authenticated)

**GET** `domains/{domain}/users/{pubkey}/wallets`

#### Description:

Gets the wallets associated with a specific user.

#### Response:

- **200 OK** (Success)

```json
[
  {
    "id": "wallet_id",
    "config": {
      "tag": "payRequest",
      "callback": "https://callback.url",
      "maxSendable": 100000,
      "minSendable": 1000,
      "metadata": "metadata"
    },
    "priority": 1,
    "provider": "json",
    "pubkey": "pubkey",
    "walias": ["some_walias"]
  }
]
```

- **401 Unauthorized** (Authentication Required)

```json
{
  "success": false,
  "reason": "Authentication required"
}
```

- **403 Forbidden** (Invalid or Expired Authentication)

```json
{
  "success": false,
  "reason": "Invalid authentication"
}
```

- **404 Not Found** (User Not Found)

```json
{
  "success": false,
  "reason": "User not found"
}
```

---

## Get Walias Public Data

**GET** `domains/{domain}/walias/{name}`

#### Description:

Checks if a walias name is available or already registered.

#### Response:

- **200 OK** (Success)

For an available walias:

```json
{
  "available": true,
  "quote": {
    "price": 10000,
    "data": {
      "type": "short"
    }
  }
}
```

For a taken walias:

```json
{
  "available": false,
  "pubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd"
}
```

- **404 Not Found** (Walias Not Found)

```json
{
  "success": false,
  "reason": "Walias not found"
}
```

## Register Walias

**POST** `domains/{domain}/walias/{name}`

#### Description:

Registers a new walias to the given pubkey.

#### Request Body:

```json
{
  "pubkey": "23123123..."
}
```

#### Response:

- **201 Created** (Walias Registered - Free)

```json
{
  "walias": "name@domain",
  "pubkey": "23123123..."
}
```

- **202 Accepted** (Walias Pending Payment)

```json
{
  "walias": "name@domain",
  "invoice": "lnbc700u1pn0fewqpp...",
  "referenceId": "9j47dzaqrykna2pjnaepjgnv3wsdp4fey4qtfsx5sx7u",
  "relays": ["wss://relay.domain.com"],
  "verify": "https://url_lnurl21_compatible.com/check"
}
```

- **400 Bad Request** (Invalid Input)

```json
{
  "reason": "Invalid pubkey"
}
```

- **409 Conflict** (Already Taken or Not Available)

```json
{
  "reason": "Already taken or not available"
}
```

## Transfer Walias (Authenticated)

**PUT** `domains/{domain}/walias/{name}`

#### Description:

Transfers the walias ownership to a new pubkey.

#### Request Body:

```json
{
  "pubkey": "newpubkey..."
}
```

#### Response:

- **200 OK** (Success)

```json
{
  "success": true
}
```

- **400 Bad Request** (Invalid pubkey)

```json
{
  "success": false,
  "reason": "Invalid pubkey"
}
```

- **401 Unauthorized** (Authentication Required)

```json
{
  "success": false,
  "reason": "Authentication required"
}
```

- **403 Forbidden** (Invalid or Expired Authentication)

```json
{
  "success": false,
  "reason": "Invalid authentication"
}
```

- **404 Not Found** (Walias Not Found)

```json
{
  "success": false,
  "reason": "Walias not found"
}
```

## Delete Walias (Authenticated)

**DELETE** `domains/{domain}/walias/{name}`

#### Description:

Deletes an existing walias.

#### Response:

- **200 OK** (Success)

```json
{
  "success": true
}
```

- **404 Not Found** (Walias Not Found)

```json
{
  "success": false,
  "reason": "Walias not found"
}
```

- **401 Unauthorized** (Authentication Required)

```json
{
  "success": false,
  "reason": "Authentication required"
}
```

- **403 Forbidden** (Invalid or Expired Authentication)

```json
{
  "success": false,
  "reason": "Invalid authentication"
}
```

---

## Verify Walias Payment

**GET** `domains/{domain}/walias/payment/{verificationId}`

#### Description:

Checks if payment is already settled.

#### Response:

- **200 OK** (Success)

```json
{
  "status": "OK",
  "settled": true,
  "preimage": "123456...",
  "pr": "lnbc10..."
}
```

- **402 Payment Required**

```json
{
  "status": "OK",
  "settled": false,
  "preimage": null,
  "pr": "lnbc10..."
}
```

- **404 Not Found** (Payment Not Found)

```json
{
  "status": "ERROR",
  "reason": "Not found"
}
```

---

## Get Wallets from a Specific Walias (Authenticated)

**GET** `domains/{domain}/walias/{name}/wallets`

#### Description:

Gets the wallets associated with a specific walias.

#### Response:

- **200 OK** (Success)

```json
[
  {
    "id": "wallet_id",
    "config": {
      "tag": "payRequest",
      "callback": "https://callback.url",
      "maxSendable": 100000,
      "minSendable": 1000,
      "metadata": "metadata"
    },
    "priority": 1,
    "provider": "json",
    "pubkey": "pubkey",
    "walias": ["some_walias"]
  }
]
```

- **401 Unauthorized** (Authentication Required)

```json
{
  "success": false,
  "reason": "Authentication required"
}
```

- **403 Forbidden** (Invalid or Expired Authentication)

```json
{
  "success": false,
  "reason": "Invalid authentication"
}
```

- **404 Not Found** (Walias Not Found)

```json
{
  "success": false,
  "reason": "Walias not found"
}
```

## Create Wallet for a Specific Walias (Authenticated)

**POST** `domains/{domain}/walias/{name}/wallets`

#### Description:

Creates a wallet for a specific walias. You can choose the wallet ID.

#### Request Body:

```json
{
  "id": "optional_wallet_id",
  "config": {
    "tag": "payRequest",
    "callback": "https://callback.url",
    "maxSendable": 100000,
    "minSendable": 1000,
    "metadata": "metadata"
  },
  "priority": 1,
  "provider": "json"
}
```

#### Response:

- **201 Created** (Wallet Created)

```json
{
  "id": "wallet_id",
  "config": {
    "tag": "payRequest",
    "callback": "https://callback.url",
    "maxSendable": 100000,
    "minSendable": 1000,
    "metadata": "metadata"
  },
  "priority": 1,
  "provider": "json",
  "pubkey": "pubkey",
  "walias": ["some_walias"]
}
```

- **401 Unauthorized** (Authentication Required)

```json
{
  "success": false,
  "reason": "Authentication required"
}
```

- **403 Forbidden** (Invalid or Expired Authentication)

```json
{
  "success": false,
  "reason": "Invalid authentication"
}
```

---

## Get Wallet by ID (Authenticated)

**GET** `domains/{domain}/wallets/{walletId}`

#### Description:

Retrieves the wallet by its ID.

#### Response:

- **200 OK** (Success)

```json
{
  "id": "wallet_id",
  "config": {
    "tag": "payRequest",
    "callback": "https://callback.url",
    "maxSendable": 100000,
    "minSendable": 1000,
    "metadata": "metadata"
  },
  "priority": 1,
  "provider": "json",
  "pubkey": "pubkey",
  "walias": ["some_walias"]
}
```

- **401 Unauthorized** (Authentication Required)

```json
{
  "success": false,
  "reason": "Authentication required"
}
```

- **403 Forbidden** (Invalid or Expired Authentication)

```json
{
  "success": false,
  "reason": "Invalid authentication"
}
```

- **404 Not Found** (Wallet Not Found)

```json
{
  "success": false,
  "reason": "Wallet not found"
}
```

## Update Wallet by ID (Authenticated)

**PUT** `domains/{domain}/wallets/{walletId}`

#### Description:

Updates the wallet configuration.

#### Request Body:

```json
{
  "config": {
    "tag": "payRequest",
    "callback": "https://new-callback.url",
    "maxSendable": 200000,
    "minSendable": 2000,
    "metadata": "updated metadata"
  },
  "priority": 2
}
```

#### Response:

- **200 OK** (Success)

```json
{
  "id": "wallet_id",
  "config": {
    "tag": "payRequest",
    "callback": "https://new-callback.url",
    "maxSendable": 200000,
    "minSendable": 2000,
    "metadata": "updated metadata"
  },
  "priority": 2,
  "provider": "json",
  "pubkey": "pubkey",
  "walias": ["some_walias"]
}
```

- **400 Bad Request** (Invalid Input)

```json
{
  "success": false,
  "reason": "Invalid input"
}
```

- **401 Unauthorized** (Authentication Required)

```json
{
  "success": false,
  "reason": "Authentication required"
}
```

- **403 Forbidden** (Invalid or Expired Authentication)

```json
{
  "success": false,
  "reason": "Invalid authentication"
}
```

- **404 Not Found** (Wallet Not Found)

```json
{
  "success": false,
  "reason": "Wallet not found"
}
```

## Delete Wallet by ID (Authenticated)

**DELETE** `domains/{domain}/wallets/{walletId}`

#### Description:

Permanently deletes the wallet configuration.

#### Response:

- **200 OK** (Success)

```json
{
  "success": true
}
```

- **401 Unauthorized** (Authentication Required)

```json
{
  "success": false,
  "reason": "Authentication required"
}
```

- **403 Forbidden** (Invalid or Expired Authentication)

```json
{
  "success": false,
  "reason": "Invalid authentication"
}
```

- **404 Not Found** (Wallet Not Found)

```json
{
  "success": false,
  "reason": "Wallet not found"
}
```

---

## Get Wallet LNURLP by ID

**GET** `domains/{domain}/wallets/{walletId}/lnurlp`

#### Description:

Retrieves the LNURL-Pay response for the wallet ID. Compatible with [LUD-06](https://github.com/lnurl/luds/blob/luds/06.md).

#### Response:

- **200 OK** (Success)

```json
{
  "tag": "payRequest",
  "callback": "https://callback.url",
  "maxSendable": 100000,
  "minSendable": 1000,
  "metadata": "metadata"
}
```

- **404 Not Found** (Wallet Not Found)

```json
{
  "status": "ERROR",
  "reason": "Wallet not found"
}
```

## Get Wallet LNURLP Callback by ID

**GET** `domains/{domain}/wallets/{walletId}/lnurlp/callback`

#### Description:

Retrieves the LNURL-Pay callback response for the wallet ID. Compatible with [LUD-06](https://github.com/lnurl/luds/blob/luds/06.md).

#### Query Parameters:

- `amount`: Amount in millisatoshis (required)

#### Response:

- **200 OK** (Success)

```json
{
  "pr": "lnbc...",
  "routes": [],
  "verify": "https://verify.url"
}
```

- **400 Bad Request** (Invalid Request Parameters)

```json
{
  "status": "ERROR",
  "reason": "Invalid request parameters"
}
```

- **404 Not Found** (Wallet Not Found)

```json
{
  "status": "ERROR",
  "reason": "Wallet not found"
}
```

---

## Get User Information

**GET** `/users/{pubkey}`

#### Description:

Retrieves information about a user.

#### Response:

- **200 OK** (Success)

```json
{
  "pubkey": "user_pubkey",
  "name": "User Name",
  "about": "User description",
  "picture": "https://example.com/user_picture.jpg"
}
```

- **404 Not Found** (User Not Found)

## Update User Information

**PUT** `/users/{pubkey}`

#### Description:

Updates user information.

#### Request Body:

```json
{
  "name": "Updated Name",
  "about": "Updated description",
  "picture": "https://example.com/updated_picture.jpg"
}
```

#### Response:

- **200 OK** (Success)

```json
{
  "pubkey": "user_pubkey",
  "name": "Updated Name",
  "about": "Updated description",
  "picture": "https://example.com/updated_picture.jpg"
}
```

- **400 Bad Request** (Invalid Input)
- **404 Not Found** (User Not Found)

---

# Authentication (Nostr-based)

Authenticated methods should use an HTTP Nostr Header as defined in [NIP-98](https://github.com/nostr-protocol/nips/blob/master/98.md) .

```js
const body = JSON.stringify({
  domain: "lacrypta.ar",
  relays: ["wss://relay.domain.com"],
  adminPubkey:
    "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd",
  rootPubkey:
    "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd", // Optional
});

const event = {
  kind: 27235,
  tags: [
    ["u", "https://api.walias.io/domains/lacrypta.ar"],
    ["method", "POST"],
    ["payload", sha256Hex(body)],
  ],
  content: "",
};

const encodedEvent = btoa(JSON.stringify(event));

const headers = `Authorization: Nostr ${encodedEvent}`;
```
