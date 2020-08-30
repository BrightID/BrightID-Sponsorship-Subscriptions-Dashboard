async function assignSpForm() {
  await unlockProvider();
  if (!window.ethereum) {
    return;
  }
  $("#spAppMsg").html("Waiting for input");
  $("#spAppMsg").css("color", "white");

  $(".totalAssigned").html("");
  $(".youAssigned").html("");
  $(".usedSponsorships").html("");

  $(".sp-assign-step").hide();
  $(".sp-assign-input").show();
  $("#spAssignModal").modal({
    backdrop: "static",
    keyboard: false
  });
  clearInputs();
  $("#assignBtn").prop("disabled", false);
  $(".confirm-icon").hide();
  $(".loading-icon").hide();
  $(".loader").hide();
};

function assignSp() {
  let amount = $("#spAssign").val();
  let app = $("#assignAppName").val();
  if (amount < 1) {
    Swal.fire({
      type: "error",
      title: "Amount too small",
      text: "Please enter a value greater than 0",
      footer: ""
    });
    return;
  }
  if (!app) {
    Swal.fire({
      type: "error",
      title: "Missing app",
      text: "Please enter the name of the app",
      footer: ""
    });
    return;
  }
  app = web3.utils.fromAscii(app);
  $(".sp-assign-input").hide();
  $(".sp-assign-step").show();
  changeActiveStep(3);
  spContract.methods.assignContext(app, amount).send({ from: web3.eth.defaultAccount }, function(error, hash) {
    if (error) {
      console.log(error);
      return;
    }
    checkTX(hash, 'assignApp');
  });
}

function checkSpBalance() {
  spContract.methods.balanceOf(web3.eth.defaultAccount).call(function(error, result) {
    if (error) {
      return;
    }
    updateSpBalanceState(parseInt(result));
  });
}

function updateSpBalanceState(spBalance) {
  amount = $("#spAssign").val();
  if (!amount || parseFloat(amount) <= 0) {
    $("#spAppMsg").css("color", "white");
    $("#spAssign").val("");
    return;
  }
  if (spBalance < amount) {
    $("#spAppMsg").css("color", "red");
    $("#spAppMsg").html("Insufficient Sp");
  } else {
    $("#spAppMsg").css("color", "green");
    $("#spAppMsg").html("Sufficient Sp");
  }
}
