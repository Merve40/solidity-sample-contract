# Sample Smart Contract written in Solidity

Tutorial for deploying a smart contract can be found [here](https://steemit.com/utopian-io/@igormuba/part-12-ethereum-solidity-using-truffle-ganache-and-zeppelin-to-deploy-pt-12)

[Node.js](https://nodejs.org/en/)

## Steps for setting up development environment

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
