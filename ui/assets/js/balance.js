async function appBalanceForm(){
  await unlockProvider();
  if (! window.ethereum ) {
    return;
  }
  $(".totalAssigned").html("");
  $(".youAssigned").html("");

  $(".app-balance-input").show();
  $("#appBalanceModal").modal({
    backdrop: "static",
    keyboard: false
  });
  clearInputs();
};

function appBalance(){
  var app = $("#assignAppName").val();
  if (! app) {
    var app = $("#balanceAppName").val();
  }
  if (! app) {
    Swal.fire({
      type: "error",
      title: "Missing app",
      text: "Please enter the name of the app",
      footer: ""
    });
    return;
  }
  app = web3.utils.fromAscii(app);
  spContract.methods.totalContextBalance(app).call(function(error, result){
    if (error) {
      console.log(error);
      return;
    }
    $(".totalAssigned").html('Total Assigned: ' + numberDecorator(result) + ' SP');
  });
  spContract.methods.contextBalance(web3.eth.defaultAccount, app).call(function(error, result){
    if (error) {
      console.log(error);
      return;
    }
    $(".youAssigned").html('You Assigned: ' + numberDecorator(result) + ' SP');
  });

}
