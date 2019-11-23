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

function clearInputs() {
  $("#sp").val("");
  $("#spDai").val("");
  $("#subs").val("");
  $("#subsDai").val("");
  $("#spAssign").val("");
  $("#context").val("");
  $("#subsActivate").val("");
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

function checkTX(hash, type, buyer, token, amount, daiAmount, business) {
  changeActiveStep(4);
  web3.eth.getTransactionReceipt(hash, function (error, result) {
    if (error) {
      console.error(error);
      return;
    }
    if (result == null) {
      setTimeout(function () {
        checkTX(hash, type, buyer, token, amount, daiAmount, business);
      }, 5000);
      return;
    }
    if(result.status == '0x1' || result.status == 1) {
      if (type == 'assignContext' || type == 'activateSubs') {
        changeActiveStep(5);
        Swal.fire({
          type: "success",
          title: "Done Successfully",
          text: "Please Check Your Account",
          footer: ""
        });
        return;
      }
      submitPurchase(buyer, token, amount, daiAmount, business);
    } else{
  		changeActiveStep(5);
      Swal.fire({
        type: "error",
        title: "Something wrong",
        text: "Error occured during contract execution",
        footer: ""
      });

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

function submitPurchase(buyer, token, amount, daiAmount, business) {
  let data = {'token': token, 'amount': amount, 'daiAmount': daiAmount, 'business': business};
  $.post('/submit-purchase', data).then(function(data) {
    var response = jQuery.parseJSON(data);
    changeActiveStep(5);
    if (!response.status) {
      Swal.fire({
        type: "error",
        title: "Something wrong",
        text: "Error occured during contract execution",
        footer: ""
      });
      return;
    }
    Swal.fire({
      type: "success",
      title: "Done Successfully",
      text: "Please Check Your Account",
      footer: ""
    });
  },function(response){
  })
}