function bsstInit() {
  $("#bsstMsg").html("Waiting for input");
  $("#bsstMsg").css("color", "white");
  $(".bsst-step").hide();
  $(".bsst-input").show();
  $("#bsstModal").modal({
    backdrop: "static",
    keyboard: false
  });
  clearInputs();
  $("#bsstBuyBtn").prop("disabled", false);
  $(".confirm-icon").hide();
  $(".loading-icon").hide();
  $(".loader").hide();
};

function bsstPurchaseForm() {
  enoughFund = false;
  checkMetaMask();
  bsstInit();
}

function purchaseBsst() {
  val = $("#bsst").val();
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
  $(".bsst-input").hide();
  $(".bsst-step").show();
  changeActiveStep(1);
  let dai = parseFloat($("#bsstDai").val()) * 10 ** 18;
  ptContract.approve.sendTransaction(addresses.bsst_minter, dai, function (error, result) {
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
    checkApproveResult(result, buyBsstConfrim);
  });
  $("#bsstBuyBtn").prop("disabled", true);
}

function buyBsstConfrim() {
  bsstMinterContract.purchase.sendTransaction(function(error, result) {
    if (error) {
      console.log(error);
      return;
    }
    checkTX(result, 'buy');
  });
}


function checkBsstState() {
  ptContract.balanceOf(web3.eth.defaultAccount, function (error, result) {
    if (error) {
      return;
    }
    updateBsstState(result.c[0] / 10000);
  });
}

function updateBsstState(ptBalance) {
  let amount = $("#bsst").val();
  if (!amount || parseFloat(amount) <= 0) {
    $("#bsstMsg").css("color", "white");
    $("#bsstDai").val("");
    return;
  }
  let ptAmount = amount * bsstPrice;
  $("#bsstDai").val(ptAmount);
  if (ptBalance < ptAmount) {
    $("#bsstMsg").css("color", "red");
    $("#bsstMsg").html("INSUFFICIENT DAI BALANCE");
    enoughFund = false;
  } else {
    $("#bsstMsg").css("color", "green");
    $("#bsstMsg").html("ENOUGH DAI BALANCE");
    enoughFund = true;
  }
}
