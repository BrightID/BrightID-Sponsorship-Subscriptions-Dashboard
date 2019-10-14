function assignInit() {
  $("#bstContextMsg").html("Waiting for input");
  $("#bstContextMsg").css("color", "white");
  $(".bst-assign-step").hide();
  $(".bst-assign-input").show();
  $("#bstAssignModal").modal({
    backdrop: "static",
    keyboard: false
  });
  clearInputs();
  $("#assignBtn").prop("disabled", false);
  $(".confirm-icon").hide();
  $(".loading-icon").hide();
  $(".loader").hide();
};

function assignBstForm() {
  checkMetaMask();
  assignInit();
}

function assignBst() {
  $(".bst-assign-input").hide();
  $(".bst-assign-step").show();
  let amount = $("#bstAssign").val();
  let context = $("#context").val();
  changeActiveStep(3);
  bstContract.assignContext.sendTransaction(context, amount, function (error, result) {
    if (error) {
      console.log(error);
      return;
    }
    checkTX(result, 'assignContext');
  });
}

function checkUnassigned() {
  bstContract.unassignedBalance(web3.eth.defaultAccount, function (error, result) {
    if (error) {
      return;
    }
    updateUnassignedState(result.c[0]);
  });
}

function updateUnassignedState(bstBalance) {
  amount = $("#bstAssign").val();
  if (!amount || parseFloat(amount) <= 0) {
    $("#bstContextMsg").css("color", "white");
    $("#bstAssign").val("");
    return;
  }
  if (bstBalance < amount) {
    $("#bstContextMsg").css("color", "red");
    $("#bstContextMsg").html("INSUFFICIENT UNASSIGNED BST");
  } else {
    $("#bstContextMsg").css("color", "green");
    $("#bstContextMsg").html("ENOUGH UNASSIGNED BST");
  }
}
