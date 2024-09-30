# API Endpoints

The API extends all Lightning Domains standard for each domain with a `/domains/{domain}/` prefix.
Example: `https://api.walias.io/domains/lacrypta.ar/walias/gorila`

---

## Register Domain

**POST** `domains/{domain}`

#### Description:

Registers a new domain.

#### Request Body:

```json
{
  "domain": "lacrypta.ar",
  "relays": ["wss://relay.domain.com"],
  "adminPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd",
  "rootPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd" // Optional
}
```

#### Response:

- **201 Created** (Domain Registered, pending verification)

```json
{
  "domain": "name@domain",
  "relays": ["wss://relay.domain.com"],
  "adminPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd",
  "rootPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd",
  "verifyUrl": "https://lacrypta.ar/.well-known/ab637c6af276b7bbfa3b7f32726376ab",
  "verifyContent": "ab637c6af276b7bbfa3b7f32726376ab"
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

- **202** (Domain Verified)

```json
{
  "success": true,
  "domain": "name@domain",
  "relays": ["wss://relay.domain.com"],
  "adminPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd",
  "rootPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd",
  "verifyUrl": "https://lacrypta.ar/.well-known/ab637c6af276b7bbfa3b7f32726376ab",
  "verifyContent": "ab637c6af276b7bbfa3b7f32726376ab"
}
```

- **208** (Already Verified)

```json
{
  "success": true,
  "domain": "name@domain",
  "relays": ["wss://relay.domain.com"],
  "adminPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd",
  "rootPubkey": "2ad91f1dca2dcd5fc89e7208d1e5059f0bac0870d63fc3bac21c7a9388fa18fd",
  "verifyUrl": "https://lacrypta.ar/.well-known/ab637c6af276b7bbfa3b7f32726376ab",
  "verifyContent": "ab637c6af276b7bbfa3b7f32726376ab"
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
  "domain": "name@domain",
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
