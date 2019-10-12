var bstMinterContract = bsstMinterContract = bstContract = bsstContract = ptContract = null;
var bstPrice, bsstPrice;
var enoughFund = false;

window.onload = function() {
  init();
};

$("#js-rotating").Morphext({
    animation: "fadeInLeftBig",
    separator: ",",
    speed: 10000,
    complete: function () {
    }
});

$(".just-number").keypress(function (eve) {
  if (
    ((eve.which != 46 ||
        $(this)
        .val()
        .indexOf(".") != -1) &&
      (eve.which < 48 || eve.which > 57)) ||
    (eve.which == 46 && $(this).caret().start == 0)
  ) {
    eve.preventDefault();
  }

  $(".just-number").keyup(function (eve) {
    if (
      $(this)
      .val()
      .indexOf(".") == 0
    ) {
      $(this).val(
        $(this)
        .val()
        .substring(1)
      );
    }
  });
});

function clearInputs() {
  $("#bst").val("");
  $("#bst-dai").val("");
  $("#bsst").val("");
  $("#bsst-dai").val("");
}

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
    $("#bst-price").html(bstPrice);
  });

  bstContract.totalSupply(function (error, result) {
    if (error) {
      return;
    }
    $("#bst-supply").html(parseInt(result.c[0]));
  });

  bsstMinterContract.price(function (error, result) {
    if (error) {
      return;
    }
    bsstPrice = parseInt(result.c[0] / 10000);
    $("#bsst-price").html(bsstPrice);
  });

  bsstContract.totalSupply(function (error, result) {
    if (error) {
      return;
    }
    $("#bsst-supply").html(parseInt(result.c[0]));
    $("#bsst-available").html(100000 - parseInt(result.c[0]));

  });
}

function checkMetaMask() {
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
}

bstInit = function () {
  $("#bst-msg").html("Waiting for input");
  $("#bst-msg").css("color", "white");
  $(".bst-step").hide();
  $(".bst-input").show();
  // model just exit by close btn
  $("#bstModal").modal({
    backdrop: "static",
    keyboard: false
  });
  clearInputs();
  $("#buy-btn").prop("disabled", false);
  $(".confirm-icon").hide();
  $(".loader").hide();
};

function bstPurchaseForm() {
  enoughFund = false;
  checkMetaMask();
  bstInit();
}

bsstInit = function () {
  $("#bsst-msg").html("Waiting for input");
  $("#bsst-msg").css("color", "white");
  $(".bsst-step").hide();
  $(".bsst-input").show();
  // model just exit by close btn
  $("#bsstModal").modal({
    backdrop: "static",
    keyboard: false
  });
  clearInputs();
  $("#buy-btn").prop("disabled", false);
  $(".confirm-icon").hide();
  $(".loading-icon").hide();
  $(".loader").hide();
};

function bsstPurchaseForm() {
  enoughFund = false;
  checkMetaMask();
  bsstInit();
}

function changeActiveStep(step) {
  $(".step-box").removeClass("active");
  $(".step-box-" + step).addClass("active done");
  $(".step-box-" + step)
    .find(".loader")
    .show();
  $(".step-box-" + (step - 1))
    .find(".loader")
    .hide();
  $(".step-box-" + (step - 1))
    .find(".confirm-icon")
    .show();
}

function purchaseBst() {
  val = $("#bst").val();
  if (val < 1 ) {
    Swal.fire({
      type: "error",
      title: "incorect value",
      text: "Your value should biger than 1",
      footer: ""
    });
    return;
  }
  if (!enoughFund) {
    Swal.fire({
      type: "error",
      title: "Your stable coin balance is not enough",
      text: "Please recharge your account and try again",
      footer: ""
    });
    return;
  }
  $(".bst-input").hide();
  $(".bst-step").show();
  changeActiveStep(1);
  let dai = parseFloat($("#bst-dai").val()) * 10 ** 18;
  ptContract.approve.sendTransaction(addresses.bst_minter, dai, function (error, result) {
    if (error) {
      console.log(error);
      Swal.fire({
        type: "error",
        title: "Something wrong",
        text: "Error message: " + String(error),
        footer: ""
      });
      return;
    }
    checkApproveResult(result, buyBstConfrim);
  });
  $("#buy-btn").prop("disabled", true);
}

function purchaseBsst() {
  val = $("#bsst").val();
  if (val < 1 ) {
    Swal.fire({
      type: "error",
      title: "incorect value",
      text: "Your value should biger than 1",
      footer: ""
    });
    return;
  }
  if (!enoughFund) {
    Swal.fire({
      type: "error",
      title: "Your stable coin balance is not enough",
      text: "Please recharge your account and try again",
      footer: ""
    });
    return;
  }
  $(".bsst-input").hide();
  $(".bsst-step").show();
  changeActiveStep(1);
  let dai = parseFloat($("#bsst-dai").val()) * 10 ** 18;
  ptContract.approve.sendTransaction(addresses.bsst_minter, dai, function (error, result) {
    if (error) {
      console.log(error);
      Swal.fire({
        type: "error",
        title: "Something wrong",
        text: "Error message: " + String(error),
        footer: ""
      });
      return;
    }
    checkApproveResult(result, buyBsstConfrim);
  });
  $("#buy-btn").prop("disabled", true);
}

function checkTX(hash, type='buy') {
  changeActiveStep(4);
  web3.eth.getTransactionReceipt(hash, function (error, result) {
    if (error) {
      console.error(error);
      return;
    }
    if (result == null) {
      setTimeout(function () {
        checkTX(hash, type);
      }, 5000);
      return;
    }
    changeActiveStep(5);
    let msg = type == 'buy' ? 'Purchase' : 'Claim'
    Swal.fire(
      msg + " Done Successfully",
      "Please Check Your Account",
      "success"
    );
  });
}

function buyBstConfrim() {
  bstMinterContract.purchase.sendTransaction(function(error, result) {
    if (error) {
      console.log(error);
      return;
    }
    checkTX(result, 'buy');
  });
}

function buyBsstConfrim() {
  bsstMinterContract.purchase.sendTransaction(function(error, result) {
    if (error) {
      console.log(error);
      return;
    }
    checkTX(result, 'buy');
  });
}

function checkApproveResult(hash, cb) {
  changeActiveStep(2);
  web3.eth.getTransactionReceipt(hash, function (error, result) {
    if (error) {
      console.error(error);
      return;
    }
    if (result == null) {
      setTimeout(function () {
        checkApproveResult(hash, cb);
      }, 5000);
      return;
    }
    changeActiveStep(3);
    cb();
  });
}

function checkState(coin) {
  ptContract.balanceOf(web3.eth.defaultAccount, function (error, result) {
    if (error) {
      return;
    }
    updateState(coin, result.c[0] / 10000);
  });
}

function updateState(coin, ptBalance) {
  let amount, ptAmount;
  if (coin == "bst") {
    amount = $("#bst").val();
    if (!amount || parseFloat(amount) <= 0) {
      $("#bst-msg").css("color", "white");
      $("#bst-dai").val("");
      return;
    }
    ptAmount = amount * bstPrice;
    $("#bst-dai").val(ptAmount);
  } else {
    amount = $("#bsst").val();
    if (!amount || parseFloat(amount) <= 0) {
      $("#bsst-msg").css("color", "white");
      $("#bsst-dai").val("");
      return;
    }
    ptAmount = amount * bsstPrice;
    $("#bsst-dai").val(ptAmount);
  }
  if (ptBalance < ptAmount) {
    $("#bst-msg").css("color", "red");
    $("#bsst-msg").css("color", "red");
    $("#bst-msg").html("INSUFFICIENT DAI BALANCE");
    $("#bsst-msg").html("INSUFFICIENT DAI BALANCE");
    enoughFund = false;
  } else {
    $("#bst-msg").css("color", "green");
    $("#bsst-msg").css("color", "green");
    $("#bst-msg").html("ENOUGH DAI BALANCE");
    $("#bsst-msg").html("ENOUGH DAI BALANCE");
    enoughFund = true;
  }
}

function claim() {
  bsstMinterContract.claim.sendTransaction(function (error, result) {
    if (error) {
      console.log(error);
      return;
    }
    checkTX(result, 'claim');
  });
}