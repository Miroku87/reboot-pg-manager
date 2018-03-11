var PgListManager = function ()
{
    return {
        init: function ()
        {
            this.recuperaDatiLocali();
            this.creaDataTable();
            this.setListeners();
        },

        eliminaPersonaggio: function ( e )
        {
            var target = $(e.target);

            Utils.requestData(
                Constants.API_DEL_PERSONAGGIO,
                "GET",
                { id: target.attr("data-id") },
                "Personaggio eliminato con successo.",
                null,
                this.pg_grid.ajax.reload
            );
        },

        modificaPunti: function ( e )
        {
            //TODO;
		},

        stampaCartellini: function ( e )
        {
            var pg_da_stampare = this.pg_grid.rows( { filter : 'applied'} ).data();
            pg_da_stampare = Array.prototype.slice.call(pg_da_stampare);

            window.localStorage.setItem("da_stampare",JSON.stringify(pg_da_stampare));
            window.location.href = Constants.PRINT_PAGE;
		},

        loggaPersonaggio: function ( e )
        {
            var target = $(e.target);
            window.localStorage.setItem("pg_da_loggare",target.attr("data-id"));
            window.location.href = Constants.PG_PAGE;
		},

        vaiACreaPG: function ( e )
        {
            window.location.href = Constants.CREAPG_PAGE;
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

            $( "[data-toggle='popover']" ).popover("destroy");
            $( "[data-toggle='popover']" ).popover({
                trigger: Utils.isDeviceMobile() ? 'click' : 'hover',
                placement: 'top'
            });

            $("button.eliminaPG").unbind( "click", this.eliminaPersonaggio.bind(this) );
            $("button.eliminaPG").click( this.eliminaPersonaggio.bind(this) );

            $(".scrivi-messaggio").unbind( "click", this.scriviMessaggio.bind(this) );
            $(".scrivi-messaggio").click( this.scriviMessaggio.bind(this) );

            $(".pg-login-btn").unbind( "click", this.loggaPersonaggio.bind(this) );
            $(".pg-login-btn").click( this.loggaPersonaggio.bind(this) );
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

        creaPulsantiAzioniPg: function (data, type, row)
        {
            var pulsanti = "";

            if( this.user_info && this.user_info.permessi.indexOf( "mostraPersonaggi_altri" ) !== -1 )
            {
                pulsanti += "<button type='button' " +
                                    "class='btn btn-xs btn-default scrivi-messaggio' " +
                                    "data-id='ig_" + row.id_personaggio + "' " +
                                    "data-nome='" + row.nome_personaggio + "' " +
                                    "data-toggle='tooltip' " +
                                    "data-placement='top' " +
                                    "title='Scrivi Messaggio'><i class='fa fa-envelope-o'></i></button>";
            }
            /*pulsanti += "<button type='button' " +
                                "class='btn btn-xs btn-default inizialmente-nascosto modificaPG_px_personaggio modificaPG_pc_personaggio' " +
                                "data-id='"+row.id_personaggio+"' " +
                                "data-toggle='tooltip' " +
                                "data-placement='top' " +
                                "title='Modifica Punti'>P</button>";
            pulsanti += "<button type='button' " +
                                "class='btn btn-xs btn-default inizialmente-nascosto modificaPG_credito_personaggio' " +
                                "data-id='"+row.id_personaggio+"' " +
                                "data-toggle='tooltip' " +
                                "data-placement='top' " +
                                "title='Credito PG'><i class='fa fa-money'></i></button>";
            pulsanti += "<button type='button' " +
                                "class='btn btn-xs btn-default inizialmente-nascosto stampaCartelliniPG' " +
                                "data-id='"+row.id_personaggio+"' " +
                                "data-toggle='tooltip' " +
                                "data-placement='top' " +
                                "title='Stampa Cartellino'><i class='fa fa-print'></i></button>";*/
            pulsanti += "<button type='button' " +
                                "class='btn btn-xs btn-default inizialmente-nascosto eliminaPG' " +
                                "data-id='"+row.id_personaggio+"' " +
                                "data-toggle='tooltip' " +
                                "data-placement='top' " +
                                "title='Elimina PG'><i class='fa fa-trash-o'></i></button>";

            return pulsanti;
		},

        creaDataTable: function (  )
        {
            var columns = [];

            columns.push({data : "id_personaggio"});

            if( this.user_info && this.user_info.permessi.indexOf( "mostraPersonaggi_altri" ) !== -1 )
                columns.push({data : "nome_giocatore"});

            columns.push({
                data   : "nome_personaggio",
                render : this.formattaNomePg.bind(this)
            });
            columns.push({data : "data_creazione_personaggio"});
            columns.push({
                data : "classi_civili",
                render: $.fn.dataTable.render.ellipsis( 20, true, false )
            });
            columns.push({
                data : "classi_militari",
                render: $.fn.dataTable.render.ellipsis( 20, true, false )
            });
            columns.push({data : "px_personaggio"});
            columns.push({data : "pc_personaggio"});
            columns.push({
                render         : this.creaPulsantiAzioniPg.bind(this),
                className      : 'inizialmente-nascosto modificaPG_px_personaggio modificaPG_pc_personaggio eliminaPG stampaCartelliniPG',
                orderable      : false,
                data           : null,
                defaultContent : ""
            });

            $.fn.dataTable.ext.errMode = 'none';
            this.pg_grid = $( '#pg_grid' )
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
                        url  : Constants.API_GET_PGS,
                        xhrFields: {
                            withCredentials: true
                        }
                    },
                    columns    : columns,
                    order      : [[0, 'desc']]
                } );
        },

        recuperaDatiLocali: function()
        {
            this.user_info = JSON.parse( window.localStorage.getItem("user") );
        },

        setListeners: function()
        {
            $("#btn_creaPG").click( this.vaiACreaPG.bind(this) );
            $("#btn_modificaPG_px_personaggio").click( this.modificaPunti.bind(this) );
            $("#btn_stampaCartelliniPG").click( this.stampaCartellini.bind(this) );
        }
    };
}();

$(function () {
    PgListManager.init();
});