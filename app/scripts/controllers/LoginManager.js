var LoginManager = function () {
	var SERVER              = window.location.protocol + "//" + window.location.host + "/",
		MAIN_PAGE           = SERVER + "lista_pg.html",
		COOKIE_EXPIRES      = 15;

	return {

		init: function ()
		{
			this.setListeners();
            this.rilevaRedirect();
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

                Utils.requestData(
                    Constants.API_POST_LOGIN,
                    "POST",
                    $("input").serialize(),
                    function( data )
                    {
                        this.pg_info = data;
                        delete this.pg_info.status;
                        delete this.pg_info.pg_da_loggare;

                        window.localStorage.clear();
                        window.localStorage.setItem( 'user', JSON.stringify( this.pg_info ) );

                        if ( this.redirect_to && this.pgid )
                        {
                            window.localStorage.setItem("pg_da_loggare",this.pgid);
                            Utils.redirectTo(Constants.SITE_URL + "/" + this.redirect_to + ".html");
                        }
                        else if( typeof data.pg_da_loggare !== "undefined" )
                        {
                            window.localStorage.setItem("pg_da_loggare",data.pg_da_loggare);
                            Utils.redirectTo( Constants.PG_PAGE );
                        }
                        else
                            Utils.redirectTo(Constants.MAIN_PAGE);
                    }.bind(this)
                );
			}
		},

        rilevaRedirect: function ()
		{
			this.redirect_to = Utils.getParameterByName("r");
            this.pgid        = Utils.getParameterByName("i");
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