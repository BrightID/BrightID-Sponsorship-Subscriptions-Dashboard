var $activatePrivacyCheckbox = $('#activatePrivacyCheckbox').change(function() {
  $("#activateBtn").prop('disabled', !$activatePrivacyCheckbox.is(":checked"));
});

async function activateForm() {
  await unlockProvider();
  if (! window.ethereum ) {
    return;
  }
  privacyAgreement = false;
  $("#activatePrivacyCheckbox").prop('checked', false);

  subsContract.methods.balanceOf(web3.eth.defaultAccount).call(function (error, result) {
    if (error) {
      return;
    }
    $("#subsActivate").val(parseInt(result));
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
  subsContract.methods.activate(amount).send( {from: web3.eth.defaultAccount}, function (error, hash) {
    if (error) {
      console.log(error);
      return;
    }
    checkTX(hash, 'activateSubs');
  });
}

function checkSubsBalance() {
  subsContract.methods.balanceOf(web3.eth.defaultAccount).call(function (error, result) {
    if (error) {
      return;
    }
    updateBalanceState(parseInt(result));
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
