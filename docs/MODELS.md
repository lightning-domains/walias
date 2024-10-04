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
  pubkey    String   @id @unique
  waliases  Walias[]
  wallets   Wallet[]
  relays    String   @default("[]")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Walias {
  id        Int      @id
  name      String
  domainId  String
  domain    Domain   @relation(fields: [domainId], references: [id])
  pubkey    String
  user      User     @relation(fields: [pubkey], references: [pubkey])
  wallets   Wallet[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([pubkey])
}

model Domain {
  id             String   @id
  waliases       Walias[]
  rootPrivateKey String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Wallet {
  id          Int      @id
  lastEventId String?
  config      String
  provider    String
  pubkey      String
  waliasId    Int
  priority    Int      @default(0) // Default priority is 0
  user        User     @relation(fields: [pubkey], references: [pubkey])
  walias      Walias   @relation(fields: [waliasId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([pubkey])
  @@index([waliasId])
}

model Payment {
  id       String @id
  pubkey   String
  waliasId Int

  @@index([pubkey])
  @@index([waliasId])
}

```
