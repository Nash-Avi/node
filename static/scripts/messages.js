(function($, toastr) {
  $(function() {
    var successMessage = $("#message_success").val();
    var errorMessage = $("#message_error").val();
    var infoMessage = $("#message_info").val();

    if(successMessage) {
      toastr.success(successMessage);
    }

    if(errorMessage) {
      toastr.error(errorMessage);
    }

    if(infoMessage) {
      toastr.info(infoMessage);
    }
  });
})(jQuery, toastr);
