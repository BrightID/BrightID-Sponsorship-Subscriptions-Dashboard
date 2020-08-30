async function appBalanceForm(){
  await unlockProvider();
  if (! window.ethereum ) {
    return;
  }
  $(".totalAssigned").html("");
  $(".youAssigned").html("");
  $(".usedSponsorships").html("");

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
  let appsUrl = nodeUrl + "/apps/" + app;
  $.ajax({
    type: "GET",
    url: appsUrl,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function(res) {
      let assignedSponsorships = res.data.assignedSponsorships;
      let usedSponsorships = assignedSponsorships - res.data.unusedSponsorships;
      $(".totalAssigned").html('Total Assigned: ' + numberDecorator(assignedSponsorships) + ' SP');
      $(".usedSponsorships").html('Used Sponsorships: ' + numberDecorator(usedSponsorships) + ' SP');
    },
    failure: function() {
      alert("Failed to get app's data!");
    }
  });
  app = web3.utils.fromAscii(app);
  spContract.methods.contextBalance(web3.eth.defaultAccount, app).call(function(error, result){
    if (error) {
      console.log(error);
      return;
    }
    $(".youAssigned").html('You Assigned: ' + numberDecorator(result) + ' SP');
  });
}
