# 🐜 The Anthill Contracts

This is the contracts repository of the Anthill.

The Anthill contracts is a lightweight implementation of the [Basis Protocol](basis.io), based on [Basis Gold](https://basis.gold/) but ported to Binance Smart Chain. You can find us at [theanthill.io](http://www.theanthill.io).

## 🚄🐜 TLDR

```
 $ yarn
 $ ganache-cli -f https://bsc-dataseed1.binance.org --chainId 56
 $ yarn build
```

## 💻🐜 Set Up Environment

To begin, you need to install dependencies with Yarn.

```
 $ yarn
```

## 💻🐜 Compiling the contracts

```
 $ yarn compile
```

## 🖧🐜 Deploying the contracts

First you need to start a local blockchain. We'll do this using `ganache-cli` and
forking the BSC `mainnet`. Open a new terminal and run:

```
 $ ganache-cli -f https://bsc-dataseed1.binance.org --chainId 56
```

Then you can deploy the contracts with:

```
$ yarn migrate
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
