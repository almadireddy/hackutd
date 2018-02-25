$(document).ready(function() {
  var h = 1000 - $('.navigation').outerHeight();

  $('.content-right, .transactions').css({"max-height": h-75 + "px"})
});