var $spWrappingPrivacyCheckbox = $('#spWrappingPrivacyCheckbox').change(function() {
  $("#spWrappingBtn").prop('disabled', !$spWrappingPrivacyCheckbox.is(":checked"));
});

async function spWrappingForm() {
  await unlockProvider();
  if (!window.provider) {
    return;
  }
  fAmountSp = 0;
  tAmountSp = 0;
  business = true;
  privacyAgreement = false;
  $("#spWrappingPrivacyCheckbox").prop('checked', false);
  enoughFund = false;
  $("#spWrappingMsg").html("Waiting for input");
  $("#spWrappingMsg").css("color", "white");
  $(".sp-wrapping-step").hide();
  $(".sp-wrapping-input").show();
  $("#spWrappingModal").modal({
    backdrop: "static",
    keyboard: false
  });
  clearInputs();
  $(".confirm-icon").hide();
  $(".loader").hide();
}

function wrapSp() {
  business = $("#spWrappingCheckbox").prop('checked');

  privacyAgreement = $("#spWrappingPrivacyCheckbox").prop('checked');
  if (!privacyAgreement) {
    Swal.fire({
      type: "error",
      title: "Attention",
      text: "Please read and agree to the privacy policy and terms of use.",
      footer: ""
    });
    return;
  }

  const fTokenSp = $("#fTokenSp").val();
  let fAmountSp = $("#fAmountSp").val();
  if (fTokenSp == 'IdSp') {
    fAmountSp *= 10 ** 18;
  }

  if (!enoughFund) {
    Swal.fire({
      type: "error",
      title: "Insufficient funds",
      text: `Please add more of the ${fTokenSp} token to your account and try again`,
      footer: ""
    });
    return;
  }

  $(".sp-wrapping-input").hide();
  $(".sp-wrapping-step").show();
  changeActiveStep(1);
  const fContractSp = (fTokenSp == 'Sp') ? bridgeSpContract : spContract;
  fContractSp.methods.approve(addresses.idchain.wrapper, fAmountSp).send({ from: web3.eth.defaultAccount }, function(error, hash) {
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
    checkApproveResult(hash, wrappingSpConfirm);
  });
  $("#spWrappingBtn").prop("disabled", true);
}

function wrappingSpConfirm() {
  const fTokenSp = $("#fTokenSp").val();
  const account = web3.eth.defaultAccount;

  if (fTokenSp == 'Sp') {
    wrapperContract.methods.wrapSp().send({ from: account }, function(error, hash) {
      if (error) {
        console.log(error);
        return;
      }
      checkTX(hash, 'wrap Sp');
    });
  } else if (fTokenSp == 'IdSp') {
    wrapperContract.methods.unWrapSp().send({ from: account }, function(error, hash) {
      if (error) {
        console.log(error);
        return;
      }
      checkTX(hash, 'unWrap Sp');
    });
  }
}

function checkWrappingSpState() {
  const fTokenSp = $("#fTokenSp").val();
  const fContractSp = (fTokenSp == 'Sp') ? bridgeSpContract : spContract;
  fContractSp.methods.balanceOf(web3.eth.defaultAccount).call(function(error, result) {
    if (error) {
      console.log('error: ', error);
      return;
    }
    updateWrappingSpState(parseInt(result));
  });
}

function updateWrappingSpState(fBalanceSp) {
  const fTokenSp = $("#fTokenSp").val();
  let fAmountSp = $("#fAmountSp").val();
  if (!fAmountSp || parseFloat(fAmountSp) <= 0) {
    $("#spWrappingMsg").css("color", "white");
    $("#tAmountSp").val("");
    return;
  }
  $("#tAmountSp").val(fAmountSp);
  if (fTokenSp == 'IdSp') {
    fAmountSp *= 10 ** 18;
  }
  if (fBalanceSp < fAmountSp) {
    $("#spWrappingMsg").css("color", "red");
    $("#spWrappingMsg").html("INSUFFICIENT BALANCE");
    enoughFund = false;
  } else {
    $("#spWrappingMsg").css("color", "green");
    $("#spWrappingMsg").html("ENOUGH BALANCE");
    enoughFund = true;
  }
}

function reversePairSp(fBalanceSp) {
  const fTokenSp = $("#fTokenSp").val();
  const tTokenSp = $("#tTokenSp").val();
  const fAmountSp = $("#fAmountSp").val();
  const tAmountSp = $("#tAmountSp").val();
  $("#fLabelSp").text(tTokenSp);
  $("#tLabelSp").text(fTokenSp);
  $("#fTokenSp").val(tTokenSp);
  $("#tTokenSp").val(fTokenSp);
  $("#fAmountSp").val(tAmountSp);
  $("#tAmountSp").val(fAmountSp);
  checkWrappingSpState();
}