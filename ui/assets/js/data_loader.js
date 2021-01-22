var infura_spMinterContract = null;
var infura_subsMinterContract = null;
var infura_spContract = null;
var infura_subsContract = null;
var infura_ptContract = null;

async function load_data(){
  const infura_web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

  $("#spContractAddress").html(`<a href="https://etherscan.io/token/${addresses.sp}" target="_blank">${addresses.sp}</a>`);
  $("#subsContractAddress").html(`<a href="https://etherscan.io/token/${addresses.subs}" target="_blank">${addresses.subs}</a>`);

  infura_ptContract = new infura_web3.eth.Contract(abies.pt, addresses.pt);
  infura_spContract = new infura_web3.eth.Contract(abies.sp, addresses.sp);
  infura_subsContract = new infura_web3.eth.Contract(abies.subs, addresses.subs);
  infura_spMinterContract = new infura_web3.eth.Contract(abies.sp_minter, addresses.sp_minter);
  infura_subsMinterContract = new infura_web3.eth.Contract(abies.subs_minter, addresses.subs_minter);

  if (window.web3 && window.web3.eth && window.web3.eth.defaultAccount) {
    infura_subsContract.methods.balanceOf(web3.eth.defaultAccount).call(function(error, result){
      if (error) {
        return;
      }
      $("#subsInactiveBalance").html(numberDecorator(result));
    });

    infura_spContract.methods.balanceOf(web3.eth.defaultAccount).call(function(error, result){
      if (error) {
        return;
      }
      $("#spBalance").html(numberDecorator(result));
    });

    infura_subsContract.methods.claimable(web3.eth.defaultAccount).call(function(error, result){
      if (error) {
        return;
      }
      $("#claimable").html(numberDecorator(result));
    });

    infura_subsContract.getPastEvents('SubscriptionsActivated', { fromBlock: 0 }, updateActiveBalance);
  } else {
    $("#subsInactiveBalance").html('_');
    $("#spBalance").html('_');
    $("#subsActiveBalance").html('_');
    $("#claimable").html('_');
  }

  infura_spMinterContract.methods.price().call(function(error, result){
    if (error) {
      return;
    }
    spPrice = result / (10 ** 18);
    $("#spPrice").html(spPrice);
  });

  infura_subsMinterContract.methods.price().call(function(error, result){
    if (error) {
      return;
    }
    subsPrice = result / (10 ** 18);
    $("#subsPrice").html(subsPrice);
  });

  infura_subsMinterContract.methods.totalSold().call(function(error, sold){
    if (error) {
      return;
    }
    $("#subsLeftAtThisPrice").html(numberDecorator(sold));
    $("#subsLeftTotal").html(numberDecorator(900000 - sold));
  });

  infura_subsContract.methods.totalSupply().call(function(error, totalSupply){
    if (error) {
      return;
    }
    $("#subsActivated").html(numberDecorator(900000 - totalSupply));
  });

  infura_spContract.methods.totalSupply().call(function(error, totalSupply){
    if (error) {
      return;
    }
    let appsUrl = nodeUrl+"/apps/";
    let totalAssigned = 0;
    $.ajax({
      type: "GET",
      url: appsUrl,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(data){
        $(".appSelect option").remove();
        $(".appSelect").append($("<option selected />").val("").text("App Name"));
        $.each(data.data.apps, function(index, app){
          totalAssigned += app.assignedSponsorships;
          $(".appSelect").append($("<option />").val(app.id).text(app.name));
        });
        $("#spSupply").html(numberDecorator(parseInt(totalSupply) + totalAssigned));
        $("#spTotalAssigned").html(numberDecorator(totalAssigned));
      },
      failure: function () {
        alert("Failed to get apps!");
      }
    });
  });


}

function updateActiveBalance(err, events){
  if (err){
    return;
  }
  // We have to get all the events into memory and do the filtering ourselves because we didn't put the word "indexed"
  // next to the "account" parameter in the smart contract.
  const totalAmount = events.filter(event => event.returnValues.account === web3.eth.defaultAccount)
    .reduce((total, event) => parseInt(event.returnValues.amount) + total, 0);
  $("#subsActiveBalance").html(numberDecorator(totalAmount));
}