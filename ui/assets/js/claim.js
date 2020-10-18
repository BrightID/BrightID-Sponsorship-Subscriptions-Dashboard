var $claimPrivacyCheckbox = $('#claimPrivacyCheckbox').change(function(){
  $("#claimBtn").prop('disabled', ! $claimPrivacyCheckbox.is(":checked"));
});

async function claimForm(){
  await unlockProvider();
  if (! window.ethereum ) {
    return;
  }
  val = 0;
  dai = 0;
  business = true;
  privacyAgreement = false;
  $("#claimsPrivacyCheckbox").prop('checked', false);
  $(".claim-step").hide();
  $(".claim-input").show();
  $("#claimModal").modal({
    backdrop: "static",
    keyboard: false
  });
  $(".confirm-icon").hide();
  $(".loader").hide();
  subsContract.methods.claimable(web3.eth.defaultAccount).call(function(error, result){
    if (error) {
      console.log(error);
      return;
    }
    $("#claimableAmount").html(numberDecorator(result));
  });
}

function claim(){
  $(".claim-input").hide();
  $(".claim-step").show();
  privacyAgreement = $("#claimPrivacyCheckbox").prop('checked');
  if (! privacyAgreement) {
    Swal.fire({
      type: "error",
      title: "Attention",
      text: "Please read and agree to the privacy policy and terms of use.",
      footer: ""
    });
    return;
  }
  changeActiveStep(3);
  subsContract.methods.claimable(web3.eth.defaultAccount).call(function(error, result){
    if (error) {
      console.log(error);
      return;
    }
    val = parseInt(result);
    subsMinterContract.methods.claim().send({ from: web3.eth.defaultAccount }, function(error, hash){
      if (error) {
        console.log(error);
        return;
      }
      business = $("#claimCheckbox").prop('checked');
      let account = web3.eth.defaultAccount;
      checkTX(hash, 'claim', account, 'Claim Sp', val, dai, business);
    });
  });
}
