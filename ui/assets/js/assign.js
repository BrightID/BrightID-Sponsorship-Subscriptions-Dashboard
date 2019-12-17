async function assignSpForm() {
  $("#spContextMsg").html("Waiting for input");
  $("#spContextMsg").css("color", "white");

  $(".totalAssigned").html("");
  $(".youAssigned").html("");

  $(".sp-assign-step").hide();
  $(".sp-assign-input").show();
  $("#spAssignModal").modal({
    backdrop: "static",
    keyboard: false
  });
  clearInputs();
  await unlockProvider();
  $("#assignBtn").prop("disabled", false);
  $(".confirm-icon").hide();
  $(".loading-icon").hide();
  $(".loader").hide();
};

function assignSp() {
  let amount = $("#spAssign").val();
  let context = $("#assignContextName").val();
  if (amount < 1 ) {
    Swal.fire({
      type: "error",
      title: "Amount too small",
      text: "Please enter a value greater than 0",
      footer: ""
    });
    return;
  }
  if (!context) {
    Swal.fire({
      type: "error",
      title: "Missing context",
      text: "Please enter the name of a context",
      footer: ""
    });
    return;
  }
  context = web3.utils.fromAscii(context);
  $(".sp-assign-input").hide();
  $(".sp-assign-step").show();
  changeActiveStep(3);
  spContract.methods.assignContext(context, amount).send(function (error, result) {
    if (error) {
      console.log(error);
      return;
    }
    checkTX(result, 'assignContext');
  });
}

function checkSpBalance() {
  spContract.methods.balanceOf(web3.eth.defaultAccount).call(function (error, result) {
    if (error) {
      return;
    }
    updateBalanceState(parseInt(result));
  });
}

function updateBalanceState(spBalance) {
  amount = $("#spAssign").val();
  if (!amount || parseFloat(amount) <= 0) {
    $("#spContextMsg").css("color", "white");
    $("#spAssign").val("");
    return;
  }
  if (spBalance < amount) {
    $("#spContextMsg").css("color", "red");
    $("#spContextMsg").html("Insufficient Sp");
  } else {
    $("#spContextMsg").css("color", "green");
    $("#spContextMsg").html("Sufficient Sp");
  }
}
