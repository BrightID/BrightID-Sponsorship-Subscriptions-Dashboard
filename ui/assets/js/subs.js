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
  $("#subsBuyBtn").prop("disabled", false);
  $(".confirm-icon").hide();
  $(".loading-icon").hide();
  $(".loader").hide();
};

function subsPurchaseForm() {
  val = 0;
  dai = 0;
  business = true;
  enoughFund = false;
  checkMetaMask();
  subsInit();
}

function purchaseSubs() {
  val = $("#subs").val();
  business = $("#subsCheckbox").prop('checked');
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
  $(".subs-input").hide();
  $(".subs-step").show();
  changeActiveStep(1);
  dai = parseFloat($("#subsDai").val()) * 10 ** 18;
  ptContract.approve.sendTransaction(addresses.subs_minter, dai, function (error, result) {
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
    checkApproveResult(result, buySubsConfrim);
  });
  $("#subsBuyBtn").prop("disabled", true);
}

function buySubsConfrim() {
  subsMinterContract.purchase.sendTransaction(function(error, result) {
    if (error) {
      console.log(error);
      return;
    }
    let account = web3.eth.defaultAccount;
    checkTX(result, 'buy', account, 'Subs', val, dai, business);
  });
}


function checkSubsState() {
  ptContract.balanceOf(web3.eth.defaultAccount, function (error, result) {
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
