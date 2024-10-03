# Models

A **walias** is the resulting address of `name@domain`.
There are three models: `walias`, `user` and `wallet`.
`user` can have multiple `waliases`.
`user` can have multiple `wallets`.
`wallet` must have a `walias`.
`wallet` must have a `user`.

---

# Prisma

```swift
model User {
  pubkey   String   @id @unique
  waliases Walias[]
  wallets  Wallet[]
}

model Walias {
  id        Int      @id
  name      String
  domain    String
  pubkey    String   @index
  domain    Domain   @relation(fields: [domain], references: [id])
  user      User     @relation(fields: [pubkey], references: [pubkey])
  wallets   Wallet[]
}

model Domain {
  id              String    @id
  waliases        Walias[]
  rootPrivateKey  String
}

model Wallet {
  id          Int      @id
  lastEventId String?
  config      Json
  provider    String
  pubkey      String   @index
  waliasId    Int      @index
  priority    Int      @default(0) // Default priority is 0
  user        User     @relation(fields: [pubkey], references: [pubkey])
  walias      Walias   @relation(fields: [waliasId], references: [id])
}

```
