var LoginManager = function () {
	var SERVER              = window.location.protocol + "//" + window.location.host + "/",
		CHECK_LOGIN_REQUEST = "http://localhost/reboot-live-api/api.php/usersmanager/login",
		INFO_REQUEST        = "http://localhost/reboot-live-api/api.php/charactersmanager/recuperainfoclassi",
		MAIN_PAGE           = SERVER + "lista_pg.html",
		COOKIE_EXPIRES      = 15;

	return {

		init: function ()
		{
			this.setListeners();
		},

		setListeners: function ()
		{
			$( 'input' ).iCheck( {
				checkboxClass : 'icheckbox_square-blue',
				radioClass    : 'iradio_square-blue',
				increaseArea  : '20%' // optional
			} );

			$( "#login" ).click( this.doLogin.bind( this ) );
		},

		inputIsValid: function ()
		{
			var errors = "",
				username = $("input[name='usermail']").val(),
				password = $("input[name='password']").val(),
				justBlank = /^\s+$/,
				isMail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

			if (username == "" || justBlank.test(username))
				errors += "Per favore riempire il campo email<br>";
			else if (username != "" && !justBlank.test(username) && !isMail.test(username))
				errors += "La mail inserita non è valida<br>";

			if (password == "" || justBlank.test(password))
				errors += "Per favore riempire il campo password<br>";

			return errors;
		},

		doLogin: function ()
		{
			var errors = this.inputIsValid();

			if (errors)
				Utils.showError(errors);
			else if (!errors)
			{
				if($("input[name='userremember']").is(":checked"))
					Utils.setCookie("usermail",$("input[name='usermail']").val(), COOKIE_EXPIRES);
				else
					Utils.deleteCookie("usermail");

				$.ajax({
					url: CHECK_LOGIN_REQUEST,
					data: $("input").serialize(),
					method: "POST",
					xhrFields: {
						withCredentials: true
					},
					success: function( data )
					{
						//console.log(data);
						//var res = JSON.parse( data );
						if ( data.status === "ok" )
						{
							window.localStorage.setItem( 'user', JSON.stringify( data.user_info ) );
							this.getGenericInfo.call(this);
						}
						else if ( data.status === "error" )
						{
							Utils.showError( data.message );
						}
					}.bind(this),
					error: function ( err )
					{
						Utils.showError( err );
					}
				});
			}
		},

		getGenericInfo: function ()
		{
			$.ajax({
				url: INFO_REQUEST,
				method: "GET",
				xhrFields: {
					withCredentials: true
				},
				success: function( data )
				{
					//console.log(data);
					//var res = JSON.parse( data );
					if ( data.status === "ok" )
					{
						window.localStorage.setItem( 'classinfos', JSON.stringify( data.info ) );
						window.location.href = MAIN_PAGE;
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
		},

		checkCookie: function ()
		{
			var user = Utils.getCookie("usermail");
			if (user != "")
			{
				$("input[name='usermail']").val(user)
				$("input[name='userremember']").attr("checked",true);
			}
		}
	}
}();

$(function () {
	LoginManager.init();
});