# Sample Smart Contract written in Solidity

**Tutorial** for deploying a smart contract can be found [here](https://steemit.com/utopian-io/@igormuba/part-12-ethereum-solidity-using-truffle-ganache-and-zeppelin-to-deploy-pt-12)

## Resources
[Node.js](https://nodejs.org/en/)   
[ganache-cli](https://github.com/trufflesuite/ganache-cli) for running a local blockchain   
[Web3.js](https://web3js.readthedocs.io/en/1.0/) client-side library for accessing blockchain


## Steps for setting up the development environment

1. Initialize the node.js project
```
npm install
```

2. Start ganache
```
ganache-cli
```

3. In another terminal deploy the smart contract
```
truffle migrate --reset
```

4. Now start the express Webserver
```
node demo.js
```
