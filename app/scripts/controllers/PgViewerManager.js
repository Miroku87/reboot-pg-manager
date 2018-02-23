var PgViewerManager = function ()
{
	return {

		init: function ()
		{
			this.faiLoginPG();
			this.setListeners();
		},

        inviaBG: function ()
        {
            $( "#invia_bg").attr("disabled",true);

            $.ajax({
                url: Constants.API_POST_BG_PG,
                data: {
                    pg_id: this.pg_info.id_personaggio,
                    text: encodeURIComponent($("#testo_background").val())
                },
                method: "POST",
                xhrFields: {
                    withCredentials: true
                },
                success: function( data )
                {
                    if ( data.status === "ok" )
                    {
                        $("#messageText").html("Il background &egrave; stato aggiornato con successo.");
                        $("#message").modal("show");
                    }
                    else if ( data.status === "error" )
                    {
                        Utils.showError( data.message );
                    }
                }.bind(this),
                error: function ( jqXHR, textStatus, errorThrown )
                {
                    Utils.showError( textStatus+"<br>"+errorThrown );
                }
            });
        },

        mostraTextAreaBG: function ()
		{
            $( "#avviso_bg" ).hide();
            $( "#aggiungi_bg" ).hide();
            $( "#background" ).hide();
            $( "#background_form" ).show();
            $( "#invia_bg" ).click( this.inviaBG.bind( this ) );
		},

        mostraDati: function ()
		{
            var professioni = this.pg_info.classi.civile.reduce( function( pre, curr ){ return ( pre ? pre + ", " : "" ) + curr.nome_classe }, ""),
                cl_militari = this.pg_info.classi.militare.reduce( function( pre, curr ){ return ( pre ? pre + ", " : "" ) + curr.nome_classe }, ""),
                px_percento = parseInt( ( parseInt( this.pg_info.px_risparmiati, 10 ) / this.pg_info.px_personaggio ) * 100, 10),
                pc_percento = parseInt( ( parseInt( this.pg_info.pc_risparmiati, 10 ) / this.pg_info.pc_personaggio ) * 100, 10 );

            $("#info_id").html( this.pg_info.id_personaggio );
            $("#info_nome").html( this.pg_info.nome_personaggio );
            $("#info_data").html( this.pg_info.data_creazione_personaggio );
            $("#info_professioni").html( professioni );
            $("#info_militari").html( cl_militari );
            $("#info_credito").html( this.pg_info.credito_personaggio );

            $("#px_risparmiati").html( this.pg_info.px_risparmiati );
            $("#px_tot").html( this.pg_info.px_personaggio );
            $("#px_bar").css({"width": px_percento+"%"});

            $("#pc_risparmiati").html( this.pg_info.pc_risparmiati );
            $("#pc_tot").html( this.pg_info.pc_personaggio );
            $("#pc_bar").css({"width": pc_percento+"%"});


            var azioni_abilita = "<td></td>";
            $.each( this.pg_info.abilita.civile, function ()
            {
                $("#lista_abilita_civili").find("tbody").append("<tr><td>"+this.nome_abilita+"</td><td>"+this.nome_classe+"</td><td>"+this.costo_abilita+"</td>"+azioni_abilita+"</tr>");
            });

            $.each( this.pg_info.abilita.militare, function ()
            {
                $("#lista_abilita_militari").find("tbody").append("<tr><td>"+this.nome_abilita+"</td><td>"+this.nome_classe+"</td><td>"+this.costo_abilita+"</td><td>"+this.distanza_abilita+"</td>"+azioni_abilita+"</tr>");
            });

            if( this.pg_info.background_personaggio !== null )
            {
                $("#avviso_bg").remove();
                $("#background").text( decodeURIComponent(this.pg_info.background_personaggio) );
                $("#testo_background").val( decodeURIComponent(this.pg_info.background_personaggio) );
            }
            else
            {
                $("#avviso_bg").show();
                $("#background").remove();
            }
		},

        refreshPage: function ()
        {
            window.location.reload();
        },

        setListeners: function ()
        {
            $( "#mostra_form_bg" ).click( this.mostraTextAreaBG.bind(this) );
            $("#message").on( "hidden.bs.modal", this.refreshPage.bind(this) );
        },

        faiLoginPG: function ()
        {
            $.ajax({
                url: Constants.API_GET_PG_LOGIN,
                method: "GET",
                xhrFields: {
                    withCredentials: true
                },
                data: {
                    pgid : Utils.getParameterByName( "i" )
                },
                success: function( data )
                {
                    if ( data.status === "ok" )
                    {
                        this.pg_info = data.result;
                        window.localStorage.setItem( 'pg', JSON.stringify( this.pg_info ) );
                        this.mostraDati();
                    }
                    else if ( data.status === "error" )
                    {
                        Utils.showError( data.message );
                    }
                }.bind(this),
                error: function ( jqXHR, textStatus, errorThrown )
                {
                    Utils.showError( textStatus+"<br>"+errorThrown );
                }
            });
        }
	}
}();

$(function () {
    PgViewerManager.init();
});