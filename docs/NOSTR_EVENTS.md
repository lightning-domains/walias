# Nostr Events

## User Domain List

Handles and updated list of user domains. Used by walias as user settings storage.
Emitted by the user. (Could be encrypted in the future)

```json
{
  "pubkey": "$USER",
  "kind": 31200,
  "tags": [
    ["d", "domains"],
  ],
  "content": JSON.stringify([
    {
      "title": "La Crypta",
      "name": "lacrypta.ar",
      "logo": "https://pbs.twimg.com/profile_images/1755606302951411712/5HjGkdHm_400x400.jpg",
      "waliases": ["satoshi"],
      "isAdmin": true,
    },
    {
      "title": "LABITCONF",
      "name": "labitconf.com",
      "logo": "https://pbs.twimg.com/profile_images/1659211049491640322/YC1BIJzG_400x400.jpg",
      "waliases": ["agustin"],
    },
    {
      "title": "Ripio",
      "name": "ripio.com",
      "logo": "https://pbs.twimg.com/profile_images/1668306347895472135/BzpLV7F7_400x400.jpg",
      "waliases": ["ricardo"],
    }
  ]),
  ...
}
```

## Walias publication

Emitted by the Lightning Domain Admin.

```json
{
  "pubkey": "$DOMAIN_ADMIN",
  "kind": 31201,
  "tags": [
    ["d", "walias:$USER_PUBKEY"],
    ["p", "$USER_PUBKEY"],
    ["i", "walias_handle"] // username (without domain)
  ],
  "content": ""
  ...
}
```
