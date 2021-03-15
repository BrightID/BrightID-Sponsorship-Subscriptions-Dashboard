var mainnet_spMinterContract = null;
var mainnet_subsMinterContract = null;
var mainnet_spContract = null;
var mainnet_subsContract = null;
var mainnet_ptContract = null;
var idchain_ptContract = null;
var idchain_spContract = null;
var idchain_subsContract = null;
var idchain_spMinterContract = null;
var idchain_subsMinterContract = null;
var mainnetWeb3 = new Web3(new Web3.providers.HttpProvider(mainnetRpcUrl));
var idchainWeb3 = new Web3(new Web3.providers.HttpProvider(idchainRpcUrl));

async function load_data() {
  mainnet_ptContract = new mainnetWeb3.eth.Contract(abies.mainnet.pt, addresses.mainnet.pt);
  mainnet_spContract = new mainnetWeb3.eth.Contract(abies.mainnet.sp, addresses.mainnet.sp);
  mainnet_subsContract = new mainnetWeb3.eth.Contract(abies.mainnet.subs, addresses.mainnet.subs);
  mainnet_spMinterContract = new mainnetWeb3.eth.Contract(abies.mainnet.sp_minter, addresses.mainnet.sp_minter);
  mainnet_subsMinterContract = new mainnetWeb3.eth.Contract(abies.mainnet.subs_minter, addresses.mainnet.subs_minter);

  idchain_ptContract = new idchainWeb3.eth.Contract(abies.idchain.pt, addresses.idchain.pt);
  idchain_spContract = new idchainWeb3.eth.Contract(abies.idchain.sp, addresses.idchain.sp);
  idchain_subsContract = new idchainWeb3.eth.Contract(abies.idchain.subs, addresses.idchain.subs);
  idchain_spMinterContract = new idchainWeb3.eth.Contract(abies.idchain.sp_minter, addresses.idchain.sp_minter);
  idchain_subsMinterContract = new idchainWeb3.eth.Contract(abies.idchain.subs_minter, addresses.idchain.subs_minter);

  $("#subsInactiveBalance").html('_');
  $("#spBalance").html('_');
  $("#subsActiveBalance").html('_');
  $("#claimable").html('_');
  $('#claimButton').html('Claim');


  if (window.web3 && window.web3.eth && window.web3.eth.defaultAccount) {
    (networkId == 1 ? mainnet_subsContract : idchain_subsContract).methods.balanceOf(web3.eth.defaultAccount).call(function(error, result) {
      if (error) {
        return;
      }
      $("#subsInactiveBalance").html(numberDecorator(networkId == 1 ? result : result / 10 ** 18));
    });

    (networkId == 1 ? mainnet_spContract : idchain_spContract).methods.balanceOf(web3.eth.defaultAccount).call(function(error, result) {
      if (error) {
        return;
      }
      $("#spBalance").html(numberDecorator(networkId == 1 ? result : result / 10 ** 18));
    });

    (networkId == 1 ? mainnet_subsContract : idchain_subsContract).methods.claimable(web3.eth.defaultAccount).call(function(error, result) {
      if (error) {
        return;
      }
      $("#claimable").html(numberDecorator(networkId == 1 ? result : result / 10 ** 18));
      $('#claimButton').html(`Claim (${numberDecorator(networkId == 1 ? result : result / 10**18)} Sp)`);

    });
    if (networkId == 1) {
      mainnet_subsContract.getPastEvents('SubscriptionsActivated', { fromBlock: 0 }, updateActiveBalance);
    } else {
      idchain_subsContract.getPastEvents('IdSubscriptionsActivated', { fromBlock: 0 }, updateActiveBalance);
    }
  }

  mainnet_spMinterContract.methods.price().call(function(error, result) {
    if (error) {
      return;
    }
    spPrice = result / (10 ** 18);
    $("#spPrice").html(spPrice);
  });

  // mainnet_subsMinterContract.methods.price().call(function(error, result) {
  //   if (error) {
  //     return;
  //   }
  //   subsPrice = result / (10 ** 18);
  //   $("#subsPrice").html(subsPrice);
  // });

  // mainnet_subsMinterContract.methods.totalSold().call(function(error, sold) {
  //   if (error) {
  //     return;
  //   }
  //   $("#subsLeftAtThisPrice").html(numberDecorator(sold));
  //   $("#subsLeftTotal").html(numberDecorator(900000 - sold));
  // });

  mainnet_subsContract.methods.totalSupply().call(function(error, totalSupply) {
    if (error) {
      return;
    }
    idchain_subsContract.methods.activated().call(function(error, activated) {
      if (error) {
        return;
      }
      $("#subsSupply").html(numberDecorator(totalSupply - activated / 10 ** 18));
      $("#subsActivated").html(numberDecorator(900000 - totalSupply + activated / 10 ** 18));
    });
  });

  mainnet_spContract.methods.totalSupply().call(function(error, totalSupply) {
    if (error) {
      return;
    }
    idchain_subsMinterContract.methods.minted().call(function(error, minted) {
      if (error) {
        return;
      }
      let appsUrl = nodeUrl + "/apps/";
      let totalAssigned = 0;
      let totalUsed = 0;
      $.ajax({
        type: "GET",
        url: appsUrl,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
          $(".appSelect option").remove();
          $(".appSelect").append($("<option selected />").val("").text("App Name"));
          $.each(data.data.apps, function(index, app) {
            totalAssigned += app.assignedSponsorships;
            totalUsed += (app.assignedSponsorships - app.unusedSponsorships);
            $(".appSelect").append($("<option />").val(app.id).text(app.name));
          });
          $("#spSupply").html(numberDecorator(parseInt(totalSupply) + totalAssigned));
          $("#spTotalAssigned").html(numberDecorator(totalAssigned + minted / 10 ** 18));
          $("#spTotalUsed").html(numberDecorator(totalUsed));
        },
        failure: function() {
          alert("Failed to get apps!");
        }
      });
    });
  });
}

function updateActiveBalance(err, events) {
  if (err) {
    return;
  }
  // We have to get all the events into memory and do the filtering ourselves because we didn't put the word "indexed"
  // next to the "account" parameter in the smart contract.
  const totalAmount = events.filter(event => event.returnValues.account === web3.eth.defaultAccount)
    .reduce((total, event) => parseInt(event.returnValues.amount) + total, 0);
  $("#subsActiveBalance").html(numberDecorator(networkId == 1 ? totalAmount : totalAmount / 10 ** 18));
}