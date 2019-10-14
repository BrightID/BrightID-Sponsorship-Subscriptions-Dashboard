function bstInit() {
  $("#bstMsg").html("Waiting for input");
  $("#bstMsg").css("color", "white");
  $(".bst-step").hide();
  $(".bst-input").show();
  $("#bstModal").modal({
    backdrop: "static",
    keyboard: false
  });
  clearInputs();
  $("#bstBuyBtn").prop("disabled", false);
  $(".confirm-icon").hide();
  $(".loader").hide();
};

function bstPurchaseForm() {
  enoughFund = false;
  checkMetaMask();
  bstInit();
}

function purchaseBst() {
  val = $("#bst").val();
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
  $(".bst-input").hide();
  $(".bst-step").show();
  changeActiveStep(1);
  let dai = parseFloat($("#bstDai").val()) * 10 ** 18;
  ptContract.approve.sendTransaction(addresses.bst_minter, dai, function (error, result) {
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
    checkApproveResult(result, buyBstConfrim);
  });
  $("#bstBuyBtn").prop("disabled", true);
}

function buyBstConfrim() {
  bstMinterContract.purchase.sendTransaction(function(error, result) {
    if (error) {
      console.log(error);
      return;
    }
    checkTX(result, 'buy');
  });
}

function checkBstState() {
  ptContract.balanceOf(web3.eth.defaultAccount, function (error, result) {
    if (error) {
      return;
    }
    updateBstState(result.c[0] / 10000);
  });
}

function updateBstState(ptBalance) {
  amount = $("#bst").val();
  if (!amount || parseFloat(amount) <= 0) {
    $("#bstMsg").css("color", "white");
    $("#bstDai").val("");
    return;
  }
  ptAmount = amount * bstPrice;
  $("#bstDai").val(ptAmount);
  if (ptBalance < ptAmount) {
    $("#bstMsg").css("color", "red");
    $("#bstMsg").html("INSUFFICIENT DAI BALANCE");
    enoughFund = false;
  } else {
    $("#bstMsg").css("color", "green");
    $("#bstMsg").html("ENOUGH DAI BALANCE");
    enoughFund = true;
  }
}