var enoughFund = false;

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
  $("#bst").val("");
  $("#bstDai").val("");
  $("#bsst").val("");
  $("#bsstDai").val("");
  $("#bstAssign").val("");
  $("#context").val("");
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
    if(result.status == '0x1' || result.status == 1) {
      Swal.fire({
        type: "success",
        title: "Done Successfully",
        text: "Please Check Your Account",
        footer: ""
      });
    } else{
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
