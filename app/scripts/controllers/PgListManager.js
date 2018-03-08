﻿var PgListManager = function ()
{
    return {
        init: function ()
        {
            this.recuperaDatiLocali();
            this.creaDataTable();
            this.setListeners();
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

        creaPulsantiAzioniPg: function (data, type, row)
        {
            return "azioni";
		},

        creaDataTable: function (  )
        {
            var columns = [];

            columns.push({data : "id_personaggio"});

            if( this.user_info && this.user_info.permessi.indexOf( "mostraPersonaggi_altri" ) )
                columns.push({data : "nome_giocatore"});
            else
                $( '#pg_info').find("thead th:nth-child(2)").remove();

            columns.push({
                data   : "nome_personaggio",
                render : this.formattaNomePg.bind(this)
            });
            columns.push({data : "data_creazione_personaggio"});
            columns.push({data : "classi_civili"});
            columns.push({data : "classi_militari"});
            columns.push({data : "px_personaggio"});
            columns.push({data : "pc_personaggio"});
            columns.push({
                render         : this.creaPulsantiAzioniPg.bind(this),
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
            $("#stampa_btn").click( this.stampaCartellini.bind(this) );
            //$("#punti_btn").click( this.stampaCartellini.bind(this) );
            //$("#crea_pg_btn").click( this.stampaCartellini.bind(this) );
        }
    };
}();

$(function () {
    PgListManager.init();
});