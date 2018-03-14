var PgListManager = function ()
{
    return {
        init: function ()
        {
            this.recuperaDatiLocali();
            this.creaDataTable();
        },

        eliminaGiocatore: function ( id )
        {
            Utils.requestData(
                Constants.API_DEL_GIOCATORE,
                "GET",
                { id: id },
                "Giocatore eliminato con successo.",
                null,
                this.player_grid.ajax.reload.bind(this,null,false)
            );
		},

        confermaEliminaGiocatore: function ( e )
        {
            var target = $(e.target);
            Utils.showConfirm("Sicuro di voler eliminare questo giocatore?", this.eliminaGiocatore.bind(this, target.attr("data-id")));
		},

        scriviMessaggio: function ( e )
        {
            var target = $(e.target);
            window.localStorage.setItem("scrivi_a",JSON.stringify( {id: target.attr("data-id"), nome: target.attr("data-nome") } ) );
            window.location.href = Constants.MESSAGGI_PAGE;
		},

        setGridListeners: function ()
        {
            AdminLTEManager.controllaPermessi();

            $( "[data-toggle='tooltip']" ).removeData('tooltip').unbind().next('div.tooltip').remove();
            $( "[data-toggle='tooltip']" ).tooltip();

            $(".scrivi-messaggio").unbind( "click", this.scriviMessaggio.bind(this) );
            $(".scrivi-messaggio").click( this.scriviMessaggio.bind(this) );

            $("button.eliminaGiocatore").unbind( "click", this.confermaEliminaGiocatore.bind(this) );
            $("button.eliminaGiocatore").click( this.confermaEliminaGiocatore.bind(this) );
		},

        erroreDataTable: function ( e, settings, techNote, message )
        {
            if( !settings.jqXHR.responseText )
                return false;

            var real_error = settings.jqXHR.responseText.replace(/^([\S\s]*?)\{"[\S\s]*/i,"$1");
            real_error = real_error.replace("\n","<br>");
            Utils.showError(real_error);
        },

        formattaNomePg: function (data, type, row)
        {
            return data+" <button type='button' " +
                "class='btn btn-xs btn-default pull-right pg-login-btn' " +
                "data-id='"+row.id_personaggio+"' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Logga PG'><i class='fa fa-sign-in'></i></button>";
		},

        creaPulsantiAzioni: function (data, type, row)
        {
            var pulsanti = "";
            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default scrivi-messaggio' " +
                "data-id='fg_"+row.email_giocatore+"' " +
                "data-nome='"+row.nome_completo+"' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Scrivi Messaggio'><i class='fa fa-envelope-o'></i></button>";
            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default inizialmente-nascosto eliminaGiocatore' " +
                "data-id='"+row.email_giocatore+"' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Elimina'><i class='fa fa-trash-o'></i></button>";

            return pulsanti;
		},

        creaDataTable: function ( )
        {
            var columns = [];

            columns.push({data : "email_giocatore"});
            columns.push({data : "nome_completo"});
            columns.push({data : "data_registrazione_giocatore"});
            columns.push({data : "nome_ruolo"});
            columns.push({
                data : "note_giocatore",
                render: $.fn.dataTable.render.ellipsis( 20, false, false )
            });
            columns.push({
                data : "note_staff_giocatore",
                render: $.fn.dataTable.render.ellipsis( 20, false, false )
            });
            columns.push({render: this.creaPulsantiAzioni.bind(this) });

            this.player_grid = $( '#groglia_giocatori' )
                .on("error.dt", this.erroreDataTable.bind(this) )
                .on("draw.dt", this.setGridListeners.bind(this) )
                .DataTable( {
                    processing : true,
                    serverSide : true,
                    dom: '<"col-md-1"B><"col-md-2"l><"col-md-4 pull-right"f>tip',
                    buttons    : ["reload"],
                    language   : Constants.DATA_TABLE_LANGUAGE,
                    ajax       : {
                        url  : Constants.API_GET_PLAYERS,
                        xhrFields: {
                            withCredentials: true
                        }
                    },
                    columns    : columns,
                    order      : [[1, 'desc']]
                } );
        },

        recuperaDatiLocali: function()
        {
            this.user_info = JSON.parse( window.localStorage.getItem("user") );
        }
    };
}();

$(function () {
    PgListManager.init();
});