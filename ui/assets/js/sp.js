var $spPrivacyCheckbox = $('#spPrivacyCheckbox').change(function() {
  $("#spBuyBtn").prop('disabled', !$spPrivacyCheckbox.is(":checked"));
});

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
  $(".confirm-icon").hide();
  $(".loader").hide();
};

function spPurchaseForm() {
	val = 0;
	dai = 0;
	business = true;
  privacyAgreement = false;
  enoughFund = false;
  checkMetaMask();
  spInit();
}

function purchaseSp() {
  val = $("#sp").val();
  business = $("#spCheckbox").prop('checked');
  privacyAgreement = $("#spPrivacyCheckbox").prop('checked');
  if ( !privacyAgreement ) {
    Swal.fire({
      type: "error",
      title: "Attention",
      text: "Please read and agree to the privacy policy and terms of use.",
      footer: ""
    });
    return;
  }
  if (val < 1 ) {
    Swal.fire({
      type: "error",
      title: "Amount too small",
      text: "Please enter a value greater than 0",
      footer: ""
    });
    return;
  }
  if (!enoughFund) {
    Swal.fire({
      type: "error",
      title: "Insufficient funds",
      text: "Please add more of the purchase token to your account and try again",
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
        title: "Something went wrong",
        text: "Error message: " + (error.message || error),
        footer: ""
      });
      return;
    }
    checkApproveResult(result, buySpConfirm);
  });
  $("#spBuyBtn").prop("disabled", true);
}

function buySpConfirm() {
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