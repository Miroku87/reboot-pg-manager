var RegistrationManager = function ()
{
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
            $("#inviaDatiGiocatore").click( this.inviaDati.bind(this) );
			$("#message").on( "hidden.bs.modal", this.gotoLogin.bind(this) );
		},

		gotoLogin: function ()
		{
			window.location.href = Constants.LOGIN_PAGE;
		},

		controllaCampi: function ()
		{
			var errors     = "",
				nome       = $("input[name='nome']").val(),
				cognome    = $("input[name='cognome']").val(),
				note       = $("textarea[name='note']").val(),
				mail       = $("input[name='mail']").val(),
				password1  = $("input[name='password1']").val(),
				password2  = $("input[name='password2']").val(),
				condizioni = $("input[name='condizioni']").is(":checked");

			if ( nome === "" || Utils.soloSpazi(nome) )
				errors += "Il campo Nome non pu&ograve; essere vuoto.<br>";

			if ( cognome === "" || Utils.soloSpazi(cognome) )
				errors += "Il campo Cognome non pu&ograve; essere vuoto.<br>";

			if ( mail === "" || Utils.soloSpazi(mail) )
				errors += "Il campo Mail non pu&ograve; essere vuoto.<br>";
			else if ( !Utils.controllaMail(mail) )
				errors += "Il campo Mail contiene un indirizzo non valido.<br>";

			if ( password1 === "" || Utils.soloSpazi(password1) )
				errors += "Il primo campo Password non pu&ograve; essere vuoto.<br>";

			if ( password2 === "" || Utils.soloSpazi(password2) )
				errors += "Il secondo campo Password non pu&ograve; essere vuoto.<br>";

			if( password1 !== "" && !Utils.soloSpazi(password1) &&
			    password2 !== "" && !Utils.soloSpazi(password2) &&
				password1 !== password2
			)
				errors += "Le password inserite non combaciano.<br>";

			//if( !condizioni )
			//	errors += "Accettare i termini e le condizioni &egrave; obbligatorio.";

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

            $("#inviaDatiGiocatore").attr("disabled",true);

            Utils.requestData(
                Constants.API_POST_REGISTRA,
                "POST",
                $("#formRegistrazione").find("input, textarea, checkbox").serialize(),
                "La registrazione è avvenuta con successo.<br>Riceverai a breve una mail con i dati di accesso.<br>Per favore controlla anche nella cartella <strong>Anti-Spam</strong>"
            );
		}
	}
}();

$(function () {
    RegistrationManager.init();
});