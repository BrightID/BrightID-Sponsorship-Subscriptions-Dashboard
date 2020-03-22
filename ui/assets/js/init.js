var spMinterContract = null;
var subsMinterContract = null;
var spContract = null;
var subsContract = null;
var ptContract = null;
var spPrice, subsPrice;
var enoughFund = false;
var val = 0;
var dai = 0;
var business = true;
var reference = null;

if (window.ethereum) {
  ethereum.autoRefreshOnNetworkChange = false;
  ethereum.on("networkChanged", init);
  ethereum.on("accountsChanged", init);
}

window.addEventListener('load', init);

async function init(){
  load_data();
  load_contexts();
  await unlockProvider();
  if (window.ethereum) {
    ptContract = new web3.eth.Contract(abies.pt, addresses.pt);
    spContract = new web3.eth.Contract(abies.sp, addresses.sp);
    subsContract = new web3.eth.Contract(abies.subs, addresses.subs);
    spMinterContract = new web3.eth.Contract(abies.sp_minter, addresses.sp_minter);
    subsMinterContract = new web3.eth.Contract(abies.subs_minter, addresses.subs_minter); 
  }

}
