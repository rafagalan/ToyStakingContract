# Staking contract

This is an implementation of the staking algorith described in [this paper](http://batog.info/papers/scalable-reward-distribution.pdf).

## Possible improvements
- **Minter role instead of owner in TKN contract**: gives more flexibility if the TKN contract were to be deployed in a more complex/real ecosystem.

- **Distributor role instead of owner in Staking contract**: AS in the previous point, it eases the implementation of more complex architectures.
  
- **Foundry instead of Hardhat**: Foundry allows to test Solidity code natively. It also allows to test the contract using fuzzing the inputs, which is very useful to find buggy edge cases (symbolic testing further increase the safty of the contract, still being worked on in Foundry).

# Disclaimer

This contract is just a toy, **DO NOT USE** in production environments. There are multiple implementation out there with a more pleasant UX & production ready.  

