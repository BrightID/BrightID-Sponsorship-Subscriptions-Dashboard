ethereum.autoRefreshOnNetworkChange = false;

window.onload = function() {
  init();
}

function init() {
  $.post('/purchases-report').then(function(response) {
    if (!response.status) {
      Swal.fire({
        type: "error",
        title: "Something wrong",
        text: "Error occured during contract execution",
        footer: ""
      });
      return;
    }
    $('#example').DataTable( {
        "data": response.purchases,
        "columns": [
            { "data": "country" },
            { "data": "state" },
            { "data": "city" },
            { "data": "business" },
            { "data": "token" },
            { "data": "amount" },
            { "data": "daiAmount" },
            { "data": "time" }
        ]
    } );
  },function(response){
  })
}
