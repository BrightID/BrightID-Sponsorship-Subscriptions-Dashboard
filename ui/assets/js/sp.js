var val = 0;
var dai = 0;
var business = true;

function spInit() {
  $("#spMsg").html("Waiting for input");
  $("#spMsg").css("color", "white");
  $(".sp-step").hide();
  $(".sp-input").show();
  $("#spModal").modal({
    backdrop: "static",
    keyboard: false
  });
  clearInputs();
  $("#spBuyBtn").prop("disabled", false);
  $(".confirm-icon").hide();
  $(".loader").hide();
};

function spPurchaseForm() {
  enoughFund = false;
  checkMetaMask();
  spInit();
}

function purchaseSp() {
  val = $("#sp").val();
  business = $("#spCheckbox").prop('checked');
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
  $(".sp-input").hide();
  $(".sp-step").show();
  changeActiveStep(1);
  dai = parseFloat($("#spDai").val()) * 10 ** 18;
  ptContract.approve.sendTransaction(addresses.sp_minter, dai, function (error, result) {
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
    checkApproveResult(result, buySpConfrim);
  });
  $("#spBuyBtn").prop("disabled", true);
}

function buySpConfrim() {
  spMinterContract.purchase.sendTransaction(function(error, result) {
    if (error) {
      console.log(error);
      return;
    }
    let account = web3.eth.defaultAccount;
    checkTX(result, 'buy', account, 'Sp', val, dai, business);
  });
}

function checkSpState() {
  ptContract.balanceOf(web3.eth.defaultAccount, function (error, result) {
    if (error) {
      return;
    }
    updateSpState(result.c[0] / 10000);
  });
}

function updateSpState(ptBalance) {
  amount = $("#sp").val();
  if (!amount || parseFloat(amount) <= 0) {
    $("#spMsg").css("color", "white");
    $("#spDai").val("");
    return;
  }
  ptAmount = amount * spPrice;
  $("#spDai").val(ptAmount);
  if (ptBalance < ptAmount) {
    $("#spMsg").css("color", "red");
    $("#spMsg").html("INSUFFICIENT DAI BALANCE");
    enoughFund = false;
  } else {
    $("#spMsg").css("color", "green");
    $("#spMsg").html("ENOUGH DAI BALANCE");
    enoughFund = true;
  }
}