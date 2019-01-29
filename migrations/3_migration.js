var Reenrolment = artifacts.require("./Reenrolment.sol");
const fs = require('fs');

module.exports = function(deployer) {
    deployer.deploy(Reenrolment).then(res=>{
        //saves the contract address locally in order to automatically load it on the client
        var text = 'var contractAddress = '+JSON.stringify(res.address)+';';
        fs.writeFileSync('contractAddress.js', text);
    });
};

