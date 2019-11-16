function activateInit() {
  $("#subsActivateMsg").html("Waiting for input");
  $("#subsActivateMsg").css("color", "white");

  $(".subs-activate-step").hide();
  $(".subs-activate-input").show();
  $("#subsActivateModal").modal({
    backdrop: "static",
    keyboard: false
  });
  clearInputs();
  $("#subsActivateModal").prop("disabled", false);
  $(".confirm-icon").hide();
  $(".loading-icon").hide();
  $(".loader").hide();
};

function activateForm() {
  checkMetaMask();
  activateInit();
}

function activate() {
  let amount = $("#subsActivate").val();
  if (amount < 1 ) {
    Swal.fire({
      type: "error",
      title: "Incorect Value",
      text: "Your value should biger than 0",
      footer: ""
    });
    return;
  }
  $(".subs-activate-input").hide();
  $(".subs-activate-step").show();
  changeActiveStep(3);
  subsContract.activate.sendTransaction(context, amount, function (error, result) {
    if (error) {
      console.log(error);
      return;
    }
    checkTX(result, 'activateSubs');
  });
}

function checkSubsBalance() {
  subsContract.balanceOf(web3.eth.defaultAccount, function (error, result) {
    if (error) {
      return;
    }
    updateBalanceState(result.c[0]);
  });
}

function updateBalanceState(subsBalance) {
  amount = $("#subsActivate").val();
  if (!amount || parseFloat(amount) <= 0) {
    $("#subsActivateMsg").css("color", "white");
    $("#subsActivate").val("");
    return;
  }
  if (subsBalance < amount) {
    $("#subsActivateMsg").css("color", "red");
    $("#subsActivateMsg").html("Insufficient Subs");
  } else {
    $("#subsActivateMsg").css("color", "green");
    $("#subsActivateMsg").html("Sufficient Subs");
  }
}
