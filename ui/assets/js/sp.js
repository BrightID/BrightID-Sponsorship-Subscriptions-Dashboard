var $spPrivacyCheckbox = $('#spPrivacyCheckbox').change(function(){
  $("#spBuyBtn").prop('disabled', ! $spPrivacyCheckbox.is(":checked"));
});

async function spPurchaseForm(){
  await unlockProvider();
  if (! window.ethereum ) {
    return;
  }
  val = 0;
  dai = 0;
  business = true;
  privacyAgreement = false;
  $("#spPrivacyCheckbox").prop('checked', false);
  enoughFund = false;
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
}

function purchaseSp(){
  val = $("#sp").val();
  business = $("#spCheckbox").prop('checked');
  privacyAgreement = $("#spPrivacyCheckbox").prop('checked');
  if (! privacyAgreement) {
    Swal.fire({
      type: "error",
      title: "Attention",
      text: "Please read and agree to the privacy policy and terms of use.",
      footer: ""
    });
    return;
  }
  if (val < 1) {
    Swal.fire({
      type: "error",
      title: "Amount too small",
      text: "Please enter a value greater than 0",
      footer: ""
    });
    return;
  }
  if (! enoughFund) {
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
  dai = web3.utils.toBN($("#spDai").val() + "000000000000000000");
  ptContract.methods.approve(addresses.sp_minter, dai).send( {from: web3.eth.defaultAccount}, function(error, hash){
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
    checkApproveResult(hash, buySpConfirm);
  });
  $("#spBuyBtn").prop("disabled", true);
}

function buySpConfirm(){
  spMinterContract.methods.purchase().send( {from: web3.eth.defaultAccount}, function(error, hash){
    if (error) {
      console.log(error);
      return;
    }
    let account = web3.eth.defaultAccount;
    checkTX(hash, 'buy', account, 'Sp', val, dai.toString(), business);
  });
}

function checkSpState(){
  ptContract.methods.balanceOf(web3.eth.defaultAccount).call(function(error, result){
    if (error) {
      return;
    }
    updateSpState(result / 10 ** 18);
  });
}

function updateSpState(ptBalance){
  amount = $("#sp").val();
  if (! amount || parseFloat(amount) <= 0) {
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