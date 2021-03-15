$('a[href$="#Modal"]').on("click", function() {
  $('#privacyPolicyModal').modal('show');
});

function clearInputs() {
  $("#sp").val("");
  $("#spDai").val("");
  $("#subs").val("");
  $("#subsDai").val("");
  $("#spAssign").val("");
  $("#assignAppName").val("");
  $("#balanceAppName").val("");
  $("#subsActivate").val("");
  $("#reference").val("");
  $("#fAmountSp").val("");
  $("#tAmountSp").val("");
  $("#fAmountSubs").val("");
  $("#tAmountSubs").val("");
}

function changeActiveStep(step) {
  $(".step-box").removeClass("active");
  $(".step-box-" + step).addClass("active done");
  $(".step-box-" + step)
    .find(".loader")
    .show();
  $(".step-box-" + (step - 1))
    .find(".loader")
    .hide();
  $(".step-box-" + (step - 1))
    .find(".confirm-icon")
    .show();
}

function checkTX(hash, type, buyer, token, amount, daiAmount, business, reference) {
  confirmed = false;
  changeActiveStep(4);
  web3.eth.getTransactionReceipt(hash, function(error, result) {
    if (error) {
      console.error(error);
      return;
    }
    if (result == null) {
      setTimeout(function() {
        checkTX(hash, type, buyer, token, amount, daiAmount, business, reference);
      }, 5000);
      return;
    }
    if (result.status) {
      isConfirmed(result.blockNumber, type);
      if (type == 'buy' || type == 'claim') {
        recordAction({
          type,
          token,
          amount,
          daiAmount,
          business,
          reference
        });
      }
    } else {
      changeActiveStep(5);
      Swal.fire({
        type: "error",
        title: "Error",
        text: "There was a problem with the contract execution",
        footer: ""
      });
    }
  });
}

function isConfirmed(txBlockNumber, type) {
  web3.eth.getBlockNumber(function(error, blockNumber) {
    if (error) {
      console.error(error);
      return false;
    } else if (1 <= blockNumber - txBlockNumber) {
      changeActiveStep(5);
      let alertText;
      if (type == 'assignApp') {
        alertText = 'Sponsorships were assigned.';
      } else if (type == 'activateSubs') {
        alertText = 'Subscriptions were activated.';
      } else if (type == 'claim') {
        alertText = 'Claim succeeded.';
      } else if (type == 'buy') {
        alertText = 'Purchase succeeded.';
      }
      Swal.fire({
        type: "success",
        title: "Success",
        text: alertText,
        footer: ""
      });
    } else {
      setTimeout(function() {
        isConfirmed(txBlockNumber, type);
      }, 5000);
      return;
    }
  });
}

function checkApproveResult(hash, cb) {
  changeActiveStep(2);
  web3.eth.getTransactionReceipt(hash, function(error, result) {
    if (error) {
      console.error(error);
      return;
    }
    if (result == null) {
      setTimeout(function() {
        checkApproveResult(hash, cb);
      }, 5000);
      return;
    }
    changeActiveStep(3);
    cb();
  });
}

function recordAction(data) {
  $.post('/action', data);
}

function numberDecorator(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}