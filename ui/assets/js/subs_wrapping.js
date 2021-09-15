async function subsWrappingForm() {
  await unlockProvider();
  if (!window.provider) {
    return;
  }
  fAmountSubs = 0;
  tAmountSubs = 0;
  enoughFund = false;
  $("#subsWrappingMsg").html("Waiting for input");
  $("#subsWrappingMsg").css("color", "white");
  $(".subs-wrapping-step").hide();
  $(".subs-wrapping-input").show();
  $("#subsWrappingModal").modal({
    backdrop: "static",
    keyboard: false
  });
  clearInputs();
  $(".confirm-icon").hide();
  $(".loader").hide();
}

function wrapSubs() {
  const fTokenSubs = $("#fTokenSubs").val();
  let fAmountSubs = $("#fAmountSubs").val();
  if (fTokenSubs == 'IdSubs') {
    fAmountSubs = web3.utils.toWei(fAmountSubs.toString(), 'ether');
  }

  if (!fAmountSubs) {
    Swal.fire({
      type: "error",
      title: "Attentions",
      text: "Please fill out all required fields",
      footer: ""
    });
    return;
  }

  if (!enoughFund) {
    Swal.fire({
      type: "error",
      title: "Insufficient funds",
      text: `Please add more of the ${fTokenSubs} token to your account and try again`,
      footer: ""
    });
    return;
  }
  $(".subs-wrapping-input").hide();
  $(".subs-wrapping-step").show();
  changeActiveStep(1);
  const fContractSubs = (fTokenSubs == 'Subs') ? bridgeSubsContract : subsContract;
  fContractSubs.methods.approve(addresses.idchain.wrapper, fAmountSubs).send({ from: web3.eth.defaultAccount }, function(error, hash) {
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
    checkApproveResult(hash, wrappingSubsConfirm);
  });
  $("#subsWrappingBtn").prop("disabled", true);
}

function wrappingSubsConfirm() {
  const fTokenSubs = $("#fTokenSubs").val();
  const account = web3.eth.defaultAccount;
  if (fTokenSubs == 'Subs') {
    wrapperContract.methods.wrapSubs().send({ from: account }, function(error, hash) {
      if (error) {
        console.log(error);
        return;
      }
      checkTX(hash, 'wrap Subs');
    });
  } else if (fTokenSubs == 'IdSubs') {
    wrapperContract.methods.unWrapSubs().send({ from: account }, function(error, hash) {
      if (error) {
        console.log(error);
        return;
      }
      checkTX(hash, 'unWrap Subs');
    });
  }
}

function checkWrappingSubsState() {
  const fTokenSubs = $("#fTokenSubs").val();
  const fContractSubs = (fTokenSubs == 'Subs') ? bridgeSubsContract : subsContract;
  fContractSubs.methods.balanceOf(web3.eth.defaultAccount).call(function(error, result) {
    if (error) {
      console.log('error: ', error);
      return;
    }
    updateWrappingSubsState(parseInt(result));
  });
}

function updateWrappingSubsState(fBalanceSubs) {
  const fTokenSubs = $("#fTokenSubs").val();
  let fAmountSubs = $("#fAmountSubs").val();
  if (!fAmountSubs || parseFloat(fAmountSubs) <= 0) {
    $("#subsWrappingMsg").css("color", "white");
    $("#tAmountSubs").val("");
    return;
  }
  $("#tAmountSubs").val(fAmountSubs);
  if (fTokenSubs == 'IdSubs') {
    fAmountSubs = web3.utils.toWei(fAmountSubs.toString(), 'ether');
  }
  if (fBalanceSubs < fAmountSubs) {
    $("#subsWrappingMsg").css("color", "red");
    $("#subsWrappingMsg").html("INSUFFICIENT BALANCE");
    enoughFund = false;
  } else {
    $("#subsWrappingMsg").css("color", "green");
    $("#subsWrappingMsg").html("ENOUGH BALANCE");
    enoughFund = true;
  }
}

function reversePairSubs(fBalanceSubs) {
  const fTokenSubs = $("#fTokenSubs").val();
  const tTokenSubs = $("#tTokenSubs").val();
  const fAmountSubs = $("#fAmountSubs").val();
  const tAmountSubs = $("#tAmountSubs").val();
  $("#fLabelSubs").text(tTokenSubs);
  $("#tLabelSubs").text(fTokenSubs);
  $("#fTokenSubs").val(tTokenSubs);
  $("#tTokenSubs").val(fTokenSubs);
  $("#fAmountSubs").val(tAmountSubs);
  $("#tAmountSubs").val(fAmountSubs);
  checkWrappingSubsState();
}