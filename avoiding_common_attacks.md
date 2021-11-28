  # Security measures for avoiding common attacks



## SWC-102 - Outdated Compiler Version

## SWC-103 - Floating Pragma

Contract's compiler pragma `0.8.0` makes sure to compile the contract against a recent compiler versions.



## Modifiers used only for validation

All modifiers in contract only validate data with `require` statements.



## Timestamp Dependence

The contract make use of `block.timestamp` sentence in `createCertificate` function to record the Certificate created date; but this was evaluated following the recommendations and was determined that it's safe to use it in the context of this contract.



## Explicitly label the visibility of functions and state variables

All functions and state variables are labeled with proper visibility.



## Access Control Design Patterns

Role-based access control was implemented to protect and authorize contract's functions usage.



## References

https://swcregistry.io/
https://docs.soliditylang.org/en/develop/security-considerations.html#tx-origin
https://consensys.net/blog/developers/solidity-best-practices-for-smart-contract-security/
