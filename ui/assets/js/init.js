var spMinterContract = subsMinterContract = spContract = subsContract = ptContract = null;
var spPrice, subsPrice;
var enoughFund = false;
var val = 0;
var dai = 0;
var business = true;

ethereum.autoRefreshOnNetworkChange = false;

window.onload = function() {
  init();
};

ethereum.on("networkChanged", function(){
	init();
	return;
})

ethereum.on("accountsChanged", function(){
	init();
	return;
})

function init() {
  var web3 = window.web3;
  if (typeof web3 === "undefined") {
    Swal.fire({
      type: "error",
      title: "MetaMask is not installed",
      text: "Please install MetaMask from below link",
      footer: '<a href="https://metamask.io">Install MetaMask</a>'
    });
    return;
  }

  web3.eth.getAccounts(function (err, accounts) {
    if (err != null) {
      Swal.fire({
        type: "error",
        title: "Something wrong",
        text: "Check this error: " + err,
        footer: ""
      });
    } else if (accounts.length === 0) {
      Swal.fire({
        type: "info",
        title: "MetaMask is locked",
        text: "Please unlocked MetaMask",
        footer: ""
      });
    }
  });

  if (window.ethereum) {
    window.web3 = new Web3(ethereum);
    try {
      Web3.providers.HttpProvider.prototype.sendAsync =
        Web3.providers.HttpProvider.prototype.send;
      ethereum.enable();
    } catch (error) {
      console.log("User denied account access...");
      return;
    }
  } else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.log("You should consider trying MetaMask!");
    return;
  }

  web3.eth.defaultAccount = web3.eth.accounts[0];

  var pt_contract = web3.eth.contract(abies.pt);
  ptContract = pt_contract.at(addresses.pt);

  var sp_contract = web3.eth.contract(abies.sp);
  spContract = sp_contract.at(addresses.sp);

  var subs_contract = web3.eth.contract(abies.subs);
  subsContract = subs_contract.at(addresses.subs);

  var sp_minter_contract = web3.eth.contract(abies.sp_minter);
  spMinterContract = sp_minter_contract.at(addresses.sp_minter);

  var subs_minter_contract = web3.eth.contract(abies.subs_minter);
  subsMinterContract = subs_minter_contract.at(addresses.subs_minter);

  // var InfuraWeb3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

  // var sp_minter_contract = InfuraWeb3.eth.contract(abies.sp_minter);
  // spMinterContract = sp_minter_contract.at(addresses.sp_minter);

  // var subs_minter_contract = InfuraWeb3.eth.contract(abies.subs_minter);
  // subsMinterContract = subs_minter_contract.at(addresses.subs_minter);

  // var sp_contract = InfuraWeb3.eth.contract(abies.sp);
  // spContract = sp_contract.at(addresses.sp);

  // var subs_contract = InfuraWeb3.eth.contract(abies.subs);
  // subsContract = subs_contract.at(addresses.subs);

  // var pt_contract = InfuraWeb3.eth.contract(abies.pt);
  // ptContract = pt_contract.at(addresses.pt);


  spMinterContract.price(function (error, result) {
    if (error) {
      return;
    }
    spPrice = parseInt(result.c[0] / 10000);
    $("#spPrice").html(spPrice);
  });

  spContract.totalSold(function (error, result) {
    if (error) {
      return;
    }
    $("#spTotalSold").html(parseInt(result.c[0]));
  });

  subsMinterContract.price(function (error, result) {
    if (error) {
      return;
    }
    subsPrice = parseInt(result.c[0] / 10000);
    $("#subsPrice").html(subsPrice);
  });

  subsContract.totalSold(function (error, result) {
    if (error) {
      return;
    }
    $("#subsTotalSold").html(parseInt(result.c[0]));
  });

  subsContract.balanceOf(web3.eth.defaultAccount, function (error, result) {
    if (error) {
      return;
    }
    $("#subsBalance").html(parseInt(result.c[0]));
  });

  spContract.balanceOf(web3.eth.defaultAccount, function (error, result) {
    if (error) {
      return;
    }
    $("#spBalance").html(parseInt(result.c[0]));
  });

}
