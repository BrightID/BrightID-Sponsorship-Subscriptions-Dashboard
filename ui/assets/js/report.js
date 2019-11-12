ethereum.autoRefreshOnNetworkChange = false;

window.onload = function() {
  init();
}

function init() {
  $.post('/purchases-report').then(function(data) {
    var response = jQuery.parseJSON(data);
    console.log(response.purchases);
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
            { "data": "buyer" },
            { "data": "ip" },
            { "data": "country" },
            { "data": "token" },
            { "data": "amount" },
            { "data": "daiAmount" },
            { "data": "time" }
        ]
    } );
  },function(response){
  })
}
