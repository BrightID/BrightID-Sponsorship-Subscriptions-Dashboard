$('a[href$="#Modal"]').on("click", function () {
  $('#privacyPolicyModal').modal('show');
});

async function unlockProvider() {
  if (window.ethereum) {
    Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
    web3 = new Web3(ethereum);
    try {
      // Request account access if needed
      await ethereum.enable();
    } catch (error) {
      window.provider = false;
      Swal.fire({
        type: "error",
        title: "Something went wrong",
        text: error.message || error,
        footer: ""
      });
    }
  } else {
    window.provider = false;
    Swal.fire({
      type: "error",
      title: "MetaMask is not installed",
      text: "Please install MetaMask from below link",
      footer: '<a href="https://metamask.io">Install MetaMask</a>'
    });
    return;
  }

  await web3.eth.getAccounts(function(error, accounts){
    if (error != null) {
      window.provider = false;
      Swal.fire({
        type: "error",
        title: "Something went wrong",
        text: error.message || error,
        footer: ""
      });
      return;
    }
    if (accounts.length === 0) {
      window.provider = false;
      Swal.fire({
        type: "info",
        title: "Your wallet provider is locked",
        text: "Please unlock your wallet",
        footer: ""
      });
      return;
    } else {
      web3.eth.defaultAccount = accounts[0];
      load_data();
    }
    web3.eth.net.getNetworkType(function(error, network){
      if (error != null) {
        window.provider = false;
        Swal.fire({
          type: "error",
          title: "Something went wrong",
          text: error.message || error,
          footer: ""
        });
        return;
      }
      if (network !== 'main') {
        window.provider = false;
        Swal.fire({
          type: "info",
          title: "Wrong network",
          text: "Please select the main network in your wallet and try again.",
          footer: ""
        });
        return;
      }
      window.provider = true;
    });
  });
}

function clearInputs() {
  $("#sp").val("");
  $("#spDai").val("");
  $("#subs").val("");
  $("#subsDai").val("");
  $("#spAssign").val("");
  $("#assignAppName").val("");
  $("#balanceAppName").val("");
  $("#subsActivate").val("");
  $("#reference").val("");
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

function checkTX(hash, type, buyer, token, amount, daiAmount, business, reference) {
  confirmed = false;
  changeActiveStep(4);
  web3.eth.getTransactionReceipt(hash, function (error, result) {
    if (error) {
      console.error(error);
      return;
    }
    if (result == null) {
      setTimeout(function () {
        checkTX(hash, type, buyer, token, amount, daiAmount, business, reference);
      }, 5000);
      return;
    }
    if (result.status) {
      isConfirmed(result.blockNumber, type);
      if (type == 'buy' || type == 'claim') {
        recordAction({
          type,
          token,
          amount,
          daiAmount,
          business,
          reference
        });
      }
    } else {
      changeActiveStep(5);
      Swal.fire({
        type: "error",
        title: "Error",
        text: "There was a problem with the contract execution",
        footer: ""
      });
    }
  });
}

function isConfirmed(txBlockNumber, type) {
  web3.eth.getBlockNumber(function (error, blockNumber) {
    if (error) {
      console.error(error);
      return false;
    } else if (1 <= blockNumber - txBlockNumber) {
      changeActiveStep(5);
      let alertText;
      if (type == 'assignApp') {
        alertText = 'Sponsorships were assigned.';
      } else if (type == 'activateSubs') {
        alertText = 'Subscriptions were activated.';
      } else if (type == 'claim') {
        alertText = 'Claim succeeded.';
      } else if (type == 'buy') {
        alertText = 'Purchase succeeded.';
      }
      Swal.fire({
        type: "success",
        title: "Success",
        text: alertText,
        footer: ""
      });
    } else {
      setTimeout(function () {
        isConfirmed(txBlockNumber, type);
      }, 5000);
      return;
    }
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

function recordAction(data) {
  $.post('/action', data);
}

function numberDecorator(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
