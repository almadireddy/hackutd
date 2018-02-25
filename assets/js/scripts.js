let ipcRenderer = require('electron').ipcRenderer;
$(document).ready(function() {
  var h = 1000 - $('.navigation').outerHeight();

  $('.content-right, .transactions').css({"max-height": h-75 + "px"});

});
$('#transaction-form').submit(function(e) {
  e.preventDefault();
  ipcRenderer.send('transaction-form', $('form').serialize());
});