var PwdRecoverManager = function ()
{
	return {

		init: function ()
		{
			this.setListeners();
		},

		setListeners: function ()
		{
            $("#btn_recupero").click( this.inviaDati.bind(this) );
		},
		controllaCampi: function ()
		{
			var errors     = "",
				mail       = $("input[name='mail']").val();

			if ( mail === "" || Utils.soloSpazi(mail) )
				errors += "Il campo Mail non pu&ograve; essere vuoto.<br>";
			else if ( !Utils.controllaMail(mail) )
				errors += "Il campo Mail contiene un indirizzo non valido.<br>";

			return errors;
		},

		inviaDati: function ()
		{
			var errors = this.controllaCampi();

			if( errors )
			{
				Utils.showError( errors );
				return false;
			}
            Utils.requestData(
                Constants.API_POST_RECUPERO_PWD,
                "POST",
                $("#formRegistrazione").find("input").serialize(),
                "Riceverai a breve una mail con i dati di accesso.<br>Per favore controlla anche nella cartella <strong>Anti-Spam</strong>.",
                null,
                Utils.redirectTo.bind(this, Constants.LOGIN_PAGE)
            );
		}
	}
}();

$(function () {
    PwdRecoverManager.init();
});