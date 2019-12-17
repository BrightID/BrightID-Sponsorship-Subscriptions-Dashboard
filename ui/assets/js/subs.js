var $subsPrivacyCheckbox = $('#subsPrivacyCheckbox').change(function() {
  $("#subsBuyBtn").prop('disabled', !$subsPrivacyCheckbox.is(":checked"));
});

function subsInit() {
  $("#subsMsg").html("Waiting for input");
  $("#subsMsg").css("color", "white");
  $(".subs-step").hide();
  $(".subs-input").show();
  $("#subsModal").modal({
    backdrop: "static",
    keyboard: false
  });
  clearInputs();
  $(".confirm-icon").hide();
  $(".loading-icon").hide();
  $(".loader").hide();
};

function subsPurchaseForm() {
  val = 0;
  dai = 0;
  business = true;
  privacyAgreement = false;
  enoughFund = false;
  unlockProvider();
  subsInit();
}

function purchaseSubs() {
  val = $("#subs").val();
  business = $("#subsCheckbox").prop('checked');
  privacyAgreement = $("#subsPrivacyCheckbox").prop('checked');
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
  $(".subs-input").hide();
  $(".subs-step").show();
  changeActiveStep(1);
  dai = parseFloat($("#subsDai").val()) * 10 ** 18;
  ptContract.methods.approve(addresses.subs_minter, dai).send(function (error, result) {
    if (error) {
      console.log(error);
      Swal.fire({
        type: "error",
        title: "Something went wrong",
        text: error.message || error,
        footer: ""
      });
      return;
    }
    checkApproveResult(result, buySubsConfirm);
  });
  $("#subsBuyBtn").prop("disabled", true);
}

function buySubsConfirm() {
  subsMinterContract.methods.purchase().send(function(error, result) {
    if (error) {
      console.log(error);
      return;
    }
    let account = web3.eth.defaultAccount;
    checkTX(result, 'buy', account, 'Subs', val, dai, business);
  });
}


function checkSubsState() {
  ptContract.methods.balanceOf(web3.eth.defaultAccount).call(function (error, result) {
    if (error) {
      return;
    }
    updateSubsState(result.c[0] / 10000);
  });
}

function updateSubsState(ptBalance) {
  let amount = $("#subs").val();
  if (!amount || parseFloat(amount) <= 0) {
    $("#subsMsg").css("color", "white");
    $("#subsDai").val("");
    return;
  }
  let ptAmount = amount * subsPrice;
  $("#subsDai").val(ptAmount);
  if (ptBalance < ptAmount) {
    $("#subsMsg").css("color", "red");
    $("#subsMsg").html("INSUFFICIENT DAI BALANCE");
    enoughFund = false;
  } else {
    $("#subsMsg").css("color", "green");
    $("#subsMsg").html("ENOUGH DAI BALANCE");
    enoughFund = true;
  }
}
