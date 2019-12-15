function balanceInit() {
  $(".totalAssigned").html("");
  $(".youAssigned").html("");

  $(".context-balance-input").show();
  $("#contextBalanceModal").modal({
    backdrop: "static",
    keyboard: false
  });
  clearInputs();
};

function contextBalanceForm() {
  checkMetaMask();
  balanceInit();
}

function contextBalance() {
  var context = $("#assignContextName").val();
  if (!context){
    var context = $("#balanceContextName").val();
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
  spContract.totalContextBalance(context, function (error, result) {
    if (error) {
      console.log(error);
      return;
    }
    $(".totalAssigned").html('Total Assigned: '+numberDecorator(parseInt(result.c[0])+' SP'));
  });
  spContract.contextBalance(web3.eth.defaultAccount, context, function (error, result) {
    if (error) {
      console.log(error);
      return;
    }
    $(".youAssigned").html('You Assigned: '+numberDecorator(parseInt(result.c[0])+' SP'));
  });

}
