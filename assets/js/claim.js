function claimInit() {
  $(".bsst-claim").show();
  $("#claimModal").modal({
    backdrop: "static",
    keyboard: false
  });
  $(".confirm-icon").hide();
  $(".loading-icon").hide();
  $(".loader").hide();
};

function claim() {
  claimInit()
  $(".claim-step").show();
  changeActiveStep(3);
  bsstMinterContract.claim.sendTransaction(function (error, result) {
    if (error) {
      console.log(error);
      return;
    }
    checkTX(result, 'claim');
  });
}
