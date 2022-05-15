const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;
let manager;

beforeEach(async ()=>{
  //Get list of all accounts
  accounts = await web3.eth.getAccounts();
  manager = accounts[0];

  // Deploy contract with one of the created accounts
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
  .deploy({data: compiledFactory.bytecode})
  .send({from: manager, gas: '1000000'});

  await factory.methods.createCampaign('100').send({
    from: manager, gas: '1000000'
  });

  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );

});

describe('Campaigns', () => {

  it('deploys a factory and campaign', () => {

    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);

  });

  it('marks caller as campaign manager', async() => {
    const campaignManager = await campaign.methods.manager().call();

    assert.equal(campaignManager, manager);
  });

  it('allow people to contribute and marks them as approvers', async() => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200'
    });

    const isApprover = await campaign.methods.approvers(accounts[1]).call();

    assert(isApprover);
  });


  it('require minimum contribution', async() => {
    try{
        await campaign.methods.contribute().send({
          from: accounts[1],
          value: '50'
        });
          assert(false);
      }catch (err){
        assert(err);
      }
  });

  it('allow manager to make payment request', async() => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200'
    });

    await campaign.methods.createRequest(
      'Buy batteries', '50', accounts[1]
    ).send({from: manager, gas: '1000000'});

    const requests = await campaign.methods.requests(0).call();

    assert.equal(requests.recipient, accounts[1]);
    assert.equal(requests.value, "50");


  });

});
