var bstMinterContract = bsstMinterContract = bstContract = bsstContract = ptContract = null;
var bstPrice, bsstPrice;
var enoughFund = false;
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

$("#jsRotating").Morphext({
    animation: "fadeInLeftBig",
    separator: ",",
    speed: 10000,
    complete: function () {
    }
});

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

  var bst_contract = web3.eth.contract(abies.bst);
  bstContract = bst_contract.at(addresses.bst);

  var bsst_contract = web3.eth.contract(abies.bsst);
  bsstContract = bsst_contract.at(addresses.bsst);

  var bst_minter_contract = web3.eth.contract(abies.bst_minter);
  bstMinterContract = bst_minter_contract.at(addresses.bst_minter);

  var bsst_minter_contract = web3.eth.contract(abies.bsst_minter);
  bsstMinterContract = bsst_minter_contract.at(addresses.bsst_minter);

  // var InfuraWeb3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

  // var bst_minter_contract = InfuraWeb3.eth.contract(abies.bst_minter);
  // bstMinterContract = bst_minter_contract.at(addresses.bst_minter);

  // var bsst_minter_contract = InfuraWeb3.eth.contract(abies.bsst_minter);
  // bsstMinterContract = bsst_minter_contract.at(addresses.bsst_minter);

  // var bst_contract = InfuraWeb3.eth.contract(abies.bst);
  // bstContract = bst_contract.at(addresses.bst);

  // var bsst_contract = InfuraWeb3.eth.contract(abies.bsst);
  // bsstContract = bsst_contract.at(addresses.bsst);

  // var pt_contract = InfuraWeb3.eth.contract(abies.pt);
  // ptContract = pt_contract.at(addresses.pt);


  bstMinterContract.price(function (error, result) {
    if (error) {
      return;
    }
    bstPrice = parseInt(result.c[0] / 10000);
    $("#bstPrice").html(bstPrice);
  });

  bstContract.totalSupply(function (error, result) {
    if (error) {
      return;
    }
    $("#bstSupply").html(parseInt(result.c[0]));
  });

  bsstMinterContract.price(function (error, result) {
    if (error) {
      return;
    }
    bsstPrice = parseInt(result.c[0] / 10000);
    $("#bsstPrice").html(bsstPrice);
  });

  bsstContract.totalSupply(function (error, result) {
    if (error) {
      return;
    }
    $("#bsstSupply").html(parseInt(result.c[0]));
  });

  bstContract.unassignedBalance(web3.eth.defaultAccount, function (error, result) {
    if (error) {
      return;
    }
    $("#bstUnassignedBalance").html(parseInt(result.c[0]));
  });

  bsstContract.balanceOf(web3.eth.defaultAccount, function (error, result) {
    if (error) {
      return;
    }
    $("#bsstBalance").html(parseInt(result.c[0]));
  });

  bstContract.balanceOf(web3.eth.defaultAccount, function (error, result) {
    if (error) {
      return;
    }
    $("#bstBalance").html(parseInt(result.c[0]));
  });

}
