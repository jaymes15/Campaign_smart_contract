require('dotenv').config({path: '../.env'});

const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/CampaignFactory.json');

const mnemonic = process.env['ACC_MNEMONIC'];
const rinkeby_network = process.env['RINKEBY_NETWORK'];

const provider = new HDWalletProvider(mnemonic, rinkeby_network);
const web3 = new Web3(provider);

const deploy = async () => {
  console.log("deploy start");

  accounts = await web3.eth.getAccounts();

  const contract = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
  .deploy({data: compiledFactory.bytecode})
  .send({from: accounts[0], gas: '1000000'});

  console.log("deploy ..");

  console.log("Contract address", contract.options.address);

  provider.engine.stop();
}

deploy();
