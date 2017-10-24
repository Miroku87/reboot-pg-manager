var RegistrationManager = function () {
    var SERVER = window.location.protocol + "//" + window.location.host + "/";

	return {

		init: function ()
		{
			this.setListeners();
		},

		setListeners: function ()
		{
			$('input').iCheck({
				checkboxClass: 'icheckbox_square-blue',
				radioClass: 'iradio_square-blue',
				increaseArea: '20%' // optional
			});
		}
	}
}();

$(function () {
    RegistrationManager.init();
});