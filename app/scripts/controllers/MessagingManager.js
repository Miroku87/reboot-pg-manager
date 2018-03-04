/**
 * Created by Miroku on 03/03/2018.
 */

var MessaggingManager = function ()
{
    return {

        init: function ()
        {
            this.visibile_ora = $("#lista_inarrivo_fg");
            $.fn.dataTable.ext.errMode = 'none';
            $.fn.dataTable.ext.buttons.refresh = {
            text: 'Refresh'
            , action: function ( e, dt, node, config ) {
                dt.clear().draw();
                dt.ajax.reload(null,false);
            }
        };

            this.setListeners.call( this );
            this.mostraMessaggi.call( this );
        },

        erroreDataTable: function ( e, settings, techNote, message ) {
            console.log( 'An error has been reported by DataTables: ', message );
        },

        formattaOggettoMessaggio: function ( data, type, row )
        {
            return "<a href='#' data-id='"+row.id_messaggio+"'>"+data+"</a>";
        },

        mostraMessaggi: function ()
        {
            this.user_info = JSON.parse( window.localStorage.getItem("user") );
            this.pg_info   = window.localStorage.getItem("logged_pg");
            this.pg_info   = this.pg_info ? JSON.parse( this.pg_info ) : null;

            if( this.pg_info )
            {
                $("#vaia_inarrivo_ig").parent().show();
                $("#vaia_inviate_ig").parent().show();
            }

            var tab_inarrivo_fg = this.creaDataTable.call( this, 'lista_inarrivo_fg_table', Constants.API_GET_MESSAGGI, {tipo: "fg", casella: "inarrivo", id: this.user_info.email_giocatore}),
                tab_inviati_fg  = this.creaDataTable.call( this, 'lista_inviati_fg_table', Constants.API_GET_MESSAGGI, {tipo: "fg", casella: "inviati", id: this.user_info.email_giocatore}),
                tab_inarrivo_ig = null,
                tab_inviati_ig  = null;

            if( this.pg_info )
            {
                tab_inarrivo_ig = this.creaDataTable.call( this, 'lista_inarrivo_ig_table', Constants.API_GET_MESSAGGI, {tipo: "ig", casella: "inarrivo", id: this.pg_info.id_personaggio});
                tab_inviati_ig  = this.creaDataTable.call( this, 'lista_inviati_ig_table', Constants.API_GET_MESSAGGI, {tipo: "ig", casella: "inviati", id: this.pg_info.id_personaggio});
            }
        },

        creaDataTable: function ( id, url, data )
        {
            var prima_colonna = "nome_mittente";

            if( data.casella === "inviati" )
                prima_colonna = "nome_destinatario";

            return $( '#'+id )
                .on("error.dt", this.erroreDataTable.bind(this) )
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
                        url  : url,
                        xhrFields: {
                            withCredentials: true
                        },
                        data : data
                    },
                    columns    : [
                        { data : prima_colonna },
                        {
                            data   : "oggetto_messaggio",
                            render : this.formattaOggettoMessaggio.bind(this)
                        },
                        { data : "data_messaggio" }
                    ],
                    order      : [[2, 'desc']]
                } );
        },

        inviaMessaggio: function ()
        {
            $.ajax({
                url: Constants.API_POST_MESSAGGIO,
                method: "POST",
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
                        this.storico = data.result;
                        this.mostraRicette();
                    }
                    /*else if ( data.status === "error" )
                     {
                     Utils.showError( data.message );
                     }*/
                }.bind(this),
                error: function ( jqXHR, textStatus, errorThrown )
                {
                    Utils.showError( textStatus+"<br>"+errorThrown );
                }
            });
        },

        mostra: function ( cosa, e )
        {
            this.visibile_ora = cosa;
            this.visibile_ora.fadeIn( 400 );
        },

        vaiA: function ( dove, e )
        {
            var target = $(e.target);

            $(".active").removeClass("active");

            if( target.is("a") )
                target.parent().addClass("active");
            else
                target.addClass("active");

            this.visibile_ora.fadeOut( 400, this.mostra.bind(this, dove) );
        },

        setListeners: function ()
        {
            $("#vaia_inarrivo_fg").click( this.vaiA.bind( this, $("#lista_inarrivo_fg") ) );
            $("#vaia_inarrivo_ig").click( this.vaiA.bind( this, $("#lista_inarrivo_ig") ) );
            $("#vaia_inviate_fg").click( this.vaiA.bind( this, $("#lista_inviati_fg") ) );
            $("#vaia_inviate_ig").click( this.vaiA.bind( this, $("#lista_inviati_ig") ) );
            $("#vaia_scrivi").click( this.vaiA.bind(this, $("#scrivi_messaggio") ) );
        }
    }
}();

$(function () {
    MessaggingManager.init();
});