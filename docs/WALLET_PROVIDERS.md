# Wallet Providers

This document describes the wallet providers planned to be supported for Lightning payments.

## Exchanges

### Binance

Generate read-only `api-key` to generate lightning invoices. We could listen for the payment somehow.

```js
const { Spot } = require("@binance/connector");
const client = new Spot("API_KEY", "API_SECRET");

client
  .depositAddress("BTC", {
    amount: 0.00005,
    network: "LIGHTNING",
  })
  .then((res) => console.dir(res.data));
```

### Bitget

Generate read-only api-key, api-secret and api-passphrase to generate lightning invoices. We could listen for the payment somehow.

```js
const { RestClientV2 } = require("bitget-api");

const client = new RestClientV2({
  apiKey: "API_KEY",
  apiSecret: "API_SECRET",
  apiPass: "API_PASS",
});

client.getSpotDepositAddress({
  coin: "BTC",
  chain: "LIGHTNING",
  size: 0.0001,
});
```

### Bitfinex

Generate read-only api-key and api secreto to generate lightning invoices.

```js
const { RESTv2 } = require("bfx-api-node-rest");

const bitfinex = new RESTv2({
  apiKey: "API_KEY",
  apiSecret: "API_SECRET",
});

const res = await bitfinex.generateInvoice({
  wallet: "exchange",
  currency: "LNX",
  amount: "0.00001",
});
```

### Strike

Mirror LUD16 `@strike.me`.

### Ripio

Mirror LUD16 `@ripio.com`.

## Wallets

### LaWallet

Via same `pubkey` from any LaWallet federation.

### LNBits

Requires `read invoice` api key. **`* Alby`**

### Blink

Requires API key

### LND

LND Api Rest **`* Alby`**

### Lightning Terminal (LNC)

LNC Pairing Phrase **`* Alby`**

### Core Lightning

Core Lightning api data via web sockets **`* Alby`**

### Citadel

Citadel api url **`* Alby`**

### Alby

Connect with Alby

### BTC Pay Server

Config string URL **`* Alby`**

### Voltage

Voltage Node URL **`* Alby`**

### Blink

Blink API Key **`* Alby`**

### Bitcoin Jungle

Blink API Key **`* Alby`**

### LNDHub

`lndhub://` url **`* Alby`**

### Eclair

URL and password for Eclair **`* Alby`**

## Procotol

### Bolt12

Use Pay Offer to generate lightning invoices.

### NWC

Needs secret NWC URL string with read invoice permission. **`* Alby`**

### LUD06

Copy LUD06 response content

### LUD16

Mirror LUD16 response content

### NIP05

Looks for LUDs on kind 0. (Might need some caching).

### CashuMint

Store payments and encrypt it with user pubkeys

## Swap Services

### FixedFloat

Choose coin and network

### SimpleSwap

API Keys
