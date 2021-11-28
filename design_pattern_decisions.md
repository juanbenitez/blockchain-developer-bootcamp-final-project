# Design patterns decisions



## Inheritance and Interfaces

- `Certification` contract inherits the OpenZeppelin `ERC721URIStorage` and this one from `ERC721` contract which enable to create NFT tokens with unique token URIs.

## Access Control Design Patterns

- `Certification` contract also inherits the OpenZeppelin `AccessControl` contract for implementing role-based access control. The contract defined 2 roles (TUTOR, STUDENT) that allows to execute functions to different groups of users based on its role.

  Roles details:

  - **ADMIN**: has full control over the contract (default defined in AccessControl contract).
  - **TUTOR**: allowed to create new `Certificates` and change the `Certificates` status.
  - **STUDENT**: created to allow students to register in different `Certificates` (not implemented).