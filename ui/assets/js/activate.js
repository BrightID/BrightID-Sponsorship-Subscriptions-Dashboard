var $activatePrivacyCheckbox = $('#activatePrivacyCheckbox').change(function() {
  $("#activateBtn").prop('disabled', !$activatePrivacyCheckbox.is(":checked"));
});

function activateInit() {
  subsContract.balanceOf(web3.eth.defaultAccount, function (error, result) {
    if (error) {
      return;
    }
    $("#subsActivate").val(parseInt(result.c[0]));
  });

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
  privacyAgreement = false;
  checkMetaMask();
  activateInit();
}

function activate() {
  let amount = $("#subsActivate").val();
  privacyAgreement = $("#activatePrivacyCheckbox").prop('checked');
  if ( !privacyAgreement ) {
    Swal.fire({
      type: "error",
      title: "Attention",
      text: "Please read and agree to the privacy policy and terms of use.",
      footer: ""
    });
    return;
  }
  if (amount < 1 ) {
    Swal.fire({
      type: "error",
      title: "Amount too small",
      text: "Please enter a value greater than 0",
      footer: ""
    });
    return;
  }
  $(".subs-activate-input").hide();
  $(".subs-activate-step").show();
  changeActiveStep(3);
  subsContract.activate.sendTransaction(amount, function (error, result) {
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
