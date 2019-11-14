function claimForm() {
  val = 0;
  dai = 0;
  business = true;
  checkMetaMask();
  claimInit();
}

function claimInit() {
  $(".claim-step").hide();
  $(".claim-input").show();
  $("#claimModal").modal({
    backdrop: "static",
    keyboard: false
  });
  $("#claimBtn").prop("disabled", false);
  $(".confirm-icon").hide();
  $(".loader").hide();
};

function claim() {
  $(".claim-input").hide();
  $(".claim-step").show();
  changeActiveStep(3);
  subsContract.claimable(web3.eth.defaultAccount, function (error, result) {
    if (error) {
      console.log(error);
      return;
    }
    val = parseInt(result.c[0]);
    subsMinterContract.claim.sendTransaction(function (error, result) {
      if (error) {
        console.log(error);
        return;
      }
      business = $("#claimCheckbox").prop('checked');
      let account = web3.eth.defaultAccount;
      checkTX(result, 'claim', account, 'Claim Sp', val, dai, business);
    });
  });
}
