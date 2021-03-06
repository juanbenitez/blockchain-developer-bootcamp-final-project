# Blockchain developer bootcamp final project 2021

## Certificate delivery dapp

Decentralized application for managing and delivering NFT certifications/badges. 

The main idea is to build a platform that is able to issue courses certifications or skill badges based on NFTs.

`Tutors` will be able to create and publish `Certificates` while `students` will be able to mint any published certificate.

Main features would be:

- Manage certificates: create / update data

- Issue the certificate to students

- Verify and prove the ownership of certificates.

  

## Deployed demo
**Frontend URL:** https://adoring-bohr-8a41e9.netlify.app/

**Contract address:** [0xac42788aE69484D2A1C757224e11fA42Db14F448](https://rinkeby.etherscan.io/address/0xac42788aE69484D2A1C757224e11fA42Db14F448)

**Ethereum testnet:** `rinkeby`

## Directory structure

`/client` (frontend dapp)

`/contracts`

`/migrations`

`/scripts`

`/tests`

## Installing locally and running tests

#### Prerequisites
- Node >= v14
- npm >= 6.14.15
- Truffle v5.4.14 (core: 5.4.14)
- Ganache v2.5.4 
- Solidity - 0.8.0 (solc-js)
- Web3.js v1.5.3
#### Local contract build & deploy

1. `git clone https://github.com/juanbenitez/blockchain-developer-bootcamp-final-project.git`
2. `npm install` in project root (will install Truffle and dependencies)
3. Install and run Ganache (local testnet), use port 7545 and network id 1337
4. `truffle compile` 
5. `truffle migrate --reset --network development` 
6. `truffle test` 

#### Local front-end run
1. Copy file `/build/contracts/Certification.json`  to  `/client` folder.
2. Start the dapp frontend: `npm run dev` (on http://localhost:3000/ )
3. Set Metamask local testnet, use http://localhost:7545 and network id 1337

#### Setting TUTOR role

The first Ganache account address is granted with all roles. If you need to grant the TUTOR role to other accounts you can use a utility script located in `scripts` folder.

1. open file `grant_tutor_role.js` and set this lines:

```
const adminAddress      = "your admin address"; // admin
const authorizedAddress = "your new tutor address"; // new authorized tutor
```

2. run `truffle exec scripts/grant_tutor_role.js` 

## Video demo

- https://youtu.be/s8qNk6JjLxU

## My public Ethereum address for certification
`0x36619E81F6BA88104E64D7ac58Fb5A5a44Cc1855`

## Project details

Each certificate will be an ERC721 NFT so students could redeem them individually and prove their ownership.

- NFT data certificates will be fully on-chain including the token image by using SVG code.
- Certificate details:
  - id
  - tittle
  - status
  - issued by
  - issued date
  - valid days
- Only certificates in `published` status could be redeemed/minted.

### Functions

**TUTOR functions**

- create a new certificate
- publish a certificate
- register a new tutor 

**STUDENT functions**

- mint a certificate

**Public functions**

- verify if a student owns a certificate

### Proposed Structures 

certificates = mapping [uint] => certificate struct

### Simple workflow

1. `tutor` user create a new certificate
2. `tutor` user **publish** the certificate (now certificate is available to mint/redeem)
3. `student` mint the certificate (the delivery is recorded in contract plus the ownership of the token)

## Future improvements
- Each TUTOR should only controls its created certificates.
- Unique SVG for each certificate (randomly generated could be fun to implement)
- More data could be attached to a certificate off-chain.
- Public verification is implemented in the contract but not in the front-end.
- A way to 'pre approve' students to mint a certificate, could be interesting to be able to automate the approvement when the student delivers a task or finish some goal in a course.
- UI improvements are needed since my skills working in frontend are too basics.