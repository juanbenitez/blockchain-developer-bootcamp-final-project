# Blockchain developer bootcamp final project 2021

## Certificate delivery dapp

A platform for issuing certifications and badges

The main idea is to build a platform that is able to issue courses certifications or skill badges based on NFTs.
## Deployed demo
**Frontend URL:** `frontend url`

**Contract address:**`deplyed address`

**Ethereum testnet:** `rinkeby`

**Admin account data (this account was created only to test this demo project):**

**Address:** `address`

**Private key:** `key`

## Directory structure

`client` (frontend dapp)

`contracts`

`migrations`

`scripts`

`tests`

## Installing locally and running tests

### Prerequisites
- Node >= v14
- npm >= 6.14.15
- Truffle v5.4.14 (core: 5.4.14)
- Ganache v2.5.4 
- Solidity - 0.8.0 (solc-js)
- Web3.js v1.5.3
#### Local contract deploy

1. `npm install` in project root (will install Truffle and dependencies)
2. Install and run Ganache (local testnet), use port 7545 and network id 1337
3. `truffle compile` 
4. `truffle migrate --reset --network development` 
5. `truffle test` 

#### Local front-end deploy
1. Start the dapp frontend: `npm run dev` (on http://localhost:3000/ )
2. Set Metamask local testnet, use http://localhost:7545 and network id 1337

#### Setting TUTOR role

The first Ganache account address is granted with all roles. If you need to grant the TUTOR role to other accounts you can use a utility script located in `scripts` folder.

1. open file `grant_tutor_role.js` and set this lines:

```
const adminAddress      = "your admin address"; // admin
const authorizedAddress = "your new tutor address"; // new authorized tutor
```

2. run `truffle exec scripts/grant_tutor_role.js` 

## Video demo

## Public Ethereum address for certificate
`0x36619E81F6BA88104E64D7ac58Fb5A5a44Cc1855`

## Project details

Each certificate will be an NFT so students could redeem them individually and prove their ownership.

- each course will have its own badge image
- course details
  - id
  - name
  - type
  - is enable
  - image
  - a students collection
  - a educators collection

### Functions

**owner only functions**

- create a new badge/cert/course 

**educators only functions**

- enable/disable a course

**students only functions**

- register in a course
- redeem a badge/cert
  - if badge/cert is enable
  - if student is registered in the course

**public functions**

- verify if a student have a course badge

### References
https://info.credly.com/about-us

### Proposed Structures 

courses = mapping [uint] => course struct

students = mapping [address] => array [course struct]


### Security
See [avoiding_common_attacks.md]()

### Future improvements
- each TUTOR only controls his own certificates
- unique SVG for each certificate (randomly generated could be fun to implment)
- more data could be attached to a certificate off-chain