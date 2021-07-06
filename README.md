# 🐜 The Anthill Contracts

This is the repository for The Anthill protocol smart-contracts.

The Anthill contracts is a lightweight implementation of the [Basis Protocol](basis.io), based on [Basis Gold](https://basis.gold/) but ported to Binance Smart Chain. You can find us at [theanthill.io](http://www.theanthill.io).

## 🚄🐜 TLDR

```
 $ npm install
 $ npm run ganache:local-testnet
 $ yarn migrate:local-testnet
```

## 💻🐜 Set Up Environment

To begin, you need to install dependencies with npm:

```
 $ npm install
```

## 💻🐜 Compiling the contracts

```
 $ truffle compile
```

## 🖧🐜 Deploying the contracts

First you need to start a local blockchain branching off the current testnet:

```
 $ npm ganache:local-testnet
```

Then you can deploy the contracts with:

```
$ npm migrate:local-testnet
```

## 🗺 History of Basis

Basis is an algorithmic stablecoin protocol where the money supply is dynamically adjusted to meet changes in money demand.

- When demand is rising, the blockchain will create more Basis Gold. The expanded supply is designed to bring the Basis price back down.
- When demand is falling, the blockchain will buy back Basis Gold. The contracted supply is designed to restore Basis price.
- The Basis protocol is designed to expand and contract supply similarly to the way central banks buy and sell fiscal debt to stabilize purchasing power. For this reason, we refer to Basis Gold as having an algorithmic central bank.

Read the [Basis Whitepaper](http://basis.io/basis_whitepaper_en.pdf) for more details into the protocol.

Basis was shut down in 2018, due to regulatory concerns its AntBond and Share tokens have security characteristics. The project team opted for compliance, and shut down operations, returned money to investors and discontinued development of the project.

## TODO: Explanation of the Tokenconomy

_© Copyright 2020, The Anthill_
