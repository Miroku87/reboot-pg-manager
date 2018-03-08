var PgListManager = function ()
{
    return {
        init: function ()
        {
            this.recuperaDatiLocali();
            this.creaDataTable();
        },

        loggaPersonaggio: function ( e )
        {
            var target = $(e.target);
            window.localStorage.setItem("pg_da_loggare",target.attr("data-id"));
            window.location.href = Constants.PG_PAGE;
		},

        setGridListeners: function ()
        {
            $( "[data-toggle='tooltip']" ).removeData('tooltip').unbind().next('div.tooltip').remove();
            $( "[data-toggle='tooltip']" ).tooltip();

            $(".pg-login-btn").click( this.loggaPersonaggio.bind(this) );
		},

        erroreDataTable: function ( e, settings, techNote, message )
        {
            console.log( 'An error has been reported by DataTables: ', message );
        },

        formattaNomePg: function (data, type, row)
        {
            return data+" <button type='button' class='btn btn-xs btn-default pull-right pg-login-btn' data-id='"+row.id_personaggio+"' data-toggle='tooltip' data-placement='top' title='Logga PG'><i class='fa fa-sign-in'></i></button>";
		},

        creaPulsantiAzioni: function (data, type, row)
        {
            return "azioni";
		},

        creaDataTable: function (  )
        {
            var columns = [];

            columns.push({data : "email_giocatore"});
            columns.push({data : "nome_completo"});
            columns.push({data : "data_registrazione_giocatore"});
            columns.push({data : "nome_ruolo"});
            columns.push({data : "note_giocatore"});
            columns.push({data : "note_staff_giocatore"});
            columns.push({render: this.creaPulsantiAzioni.bind(this) });

            $.fn.dataTable.ext.errMode = 'none';
            this.player_grid = $( '#groglia_giocatori' )
                .on("error.dt", this.erroreDataTable.bind(this) )
                .on("draw.dt", this.setGridListeners.bind(this) )
                .DataTable( {
                    processing : true,
                    serverSide : true,
                    dom: '<"col-md-1"B><"col-md-2"l><"col-md-4 pull-right"f>tip',
                    buttons    : [        {
                        text: '<i class="fa fa-refresh"></i>',
                        action: function ( e, dt ) {
                            dt.ajax.reload(null, true);
                        }
                    }],
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