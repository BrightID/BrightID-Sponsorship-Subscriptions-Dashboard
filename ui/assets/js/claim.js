var $claimPrivacyCheckbox = $('#claimPrivacyCheckbox').change(function() {
  $("#claimBtn").prop('disabled', !$claimPrivacyCheckbox.is(":checked"));
});

function claimForm() {
  val = 0;
  dai = 0;
  business = true;
  privacyAgreement = false;
  unlockProvider();
  claimInit();
}

function claimInit() {
  $(".claim-step").hide();
  $(".claim-input").show();
  $("#claimModal").modal({
    backdrop: "static",
    keyboard: false
  });
  $(".confirm-icon").hide();
  $(".loader").hide();
};

function claim() {
  $(".claim-input").hide();
  $(".claim-step").show();
  privacyAgreement = $("#claimPrivacyCheckbox").prop('checked');
  if ( !privacyAgreement ) {
    Swal.fire({
      type: "error",
      title: "Attention",
      text: "Please read and agree to the privacy policy and terms of use.",
      footer: ""
    });
    return;
  }
  changeActiveStep(3);
  subsContract.methods.claimable(web3.eth.defaultAccount).call(function (error, result) {
    if (error) {
      console.log(error);
      return;
    }
    val = parseInt(result.c[0]);
    subsMinterContract.methods.claim().send(function (error, result) {
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
