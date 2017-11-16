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
			$("#message").on( "hide.bs.modal", this.gotoLogin.bind(this) );
			$("#inviaDati").click( this.inviaDati.bind(this) );
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
				cf         = $("input[name='codicefiscale']").val(),
				note       = $("textarea[name='note']").val(),
				mail       = $("input[name='mail']").val(),
				password1  = $("input[name='password1']").val(),
				password2  = $("input[name='password2']").val(),
				condizioni = $("input[name='condizioni']").is(":checked");

			if ( nome === "" || Utils.soloSpazi(nome) )
				errors += "Il campo Nome non pu&ograve; essere vuoto.<br>";

			if ( cognome === "" || Utils.soloSpazi(cognome) )
				errors += "Il campo Cognome non pu&ograve; essere vuoto.<br>";

			if ( cf === "" || Utils.soloSpazi(cf) )
				errors += "Il campo Codice Fiscale non pu&ograve; essere vuoto.<br>";
			else if ( !Utils.controllaCF( cf ) )
				errors += "Il campo Codice Fiscale contiene un valore non corretto.<br>";

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

			if( !condizioni )
				errors += "Accettare i termini e le condizioni &egrave; obbligatorio.";

			return errors;
		},

		inviaDati: function ()
		{
			console.log("sdfsdf");
			var errors = this.controllaCampi();

			if( errors )
			{
				Utils.showError( errors );
				return false;
			}

			$.ajax({
				url: Constants.API_POST_REGISTRA,
				method: "POST",
				data: $("#formRegistrazione").find("input, textarea, checkbox").serialize(),
				cache: false,
				//contentType: false,
				//processData: false,
				xhrFields: {
					withCredentials: true
				},
				success: function( data )
				{
					if ( data.status === "ok" )
					{
						$("#messageText").html("La registrazione è avvenuta con successo.<br>Riceverai a breve una mail con i dati di accesso.<br>Per favore controlla anche nella cartella <strong>Anti-Spam</strong>");
						$("#message").modal("show");
					}
					else if ( data.status === "error" )
					{
						Utils.showError( data.message );
					}
				},
				error: function ( err )
				{
					Utils.showError( err );
				}
			});
		}
	}
}();

$(function () {
    RegistrationManager.init();
});