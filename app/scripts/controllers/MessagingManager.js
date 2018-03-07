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

            this.setListeners.call( this );
            this.mostraMessaggi.call( this );
        },

        erroreDataTable: function ( e, settings, techNote, message )
        {
            console.log( 'An error has been reported by DataTables: ', message );
        },

        risettaMessaggio: function ( )
        {
            this.id_destinatario = null;
            this.messaggio_in_lettura = null;
            $("#destinatario").val("");
            $("#destinatario").attr("disabled",false);
            $("#messaggio").val("");
            $("#messaggio").attr("disabled",false);
            $("#oggetto").val("");
            $("#oggetto").attr("disabled",false);

            $("#invia_messaggio").attr("disabled",true);
        },

        destinatarioSelezionato: function ( event, ui )
        {
            this.id_destinatario = ui.item.real_value;
            $("#invia_messaggio").attr("disabled",false);
        },

        scrittoSuDestinatario: function ( e, ui )
        {
            if( !ui.item )
                $("#invia_messaggio").attr("disabled",true);
        },

        cambiaListaDestinatari: function ( )
        {
            if( typeof $("#destinatario").data('ui-autocomplete') !== "undefined" )
            {
                this.id_destinatario = null;
                $("#destinatario").val("");
                $("#invia_messaggio").attr("disabled",true);
                $("#destinatario").autocomplete( "option", "source", Constants.API_GET_DESTINATARI_IG );
            }
        },

        impostaInterfacciaScrittura: function ( )
        {
            if( typeof $("#destinatario").data('ui-autocomplete') === "undefined" )
            {
                $("#destinatario").autocomplete({
                    autoFocus : true,
                    source : Constants.API_GET_DESTINATARI_FG,
                    select : this.destinatarioSelezionato.bind(this),
                    change : this.scrittoSuDestinatario.bind(this)
                });

                $("#tipo_messaggio").change( this.cambiaListaDestinatari.bind(this) );
                $("#invia_messaggio").click( this.inviaMessaggio.bind(this) );
                $("#risetta_messaggio").click( this.risettaMessaggio.bind(this) );
            }

            if( this.messaggio_in_lettura )
            {
                this.id_destinatario = this.messaggio_in_lettura.id_mittente;

                $("#tipo_messaggio").val( this.messaggio_in_lettura.tipo );
                $("#tipo_messaggio").attr("disabled", true);

                $("#destinatario").val( this.messaggio_in_lettura.mittente );
                $("#destinatario").attr("disabled", true);

                $("#oggetto").val( "Re: " + this.messaggio_in_lettura.oggetto.replace(/^\s*?re:\s?/i,"") );
                $("#oggetto").attr("disabled", true);

                $("#invia_messaggio").attr("disabled",false);
            }
        },

        liberaSpazioMessaggio: function ( )
        {
            $("#oggetto_messaggio").text( "" );
            $("#mittente_messaggio").text( "" );
            $("#destinatario_messaggio").text( "" );
            $("#data_messaggio").text( "" );
            $("#corpo_messaggio").text( "" );
        },

        mostraMessaggioSingolo: function ( dati )
        {
            this.messaggio_in_lettura = {
                id: dati.id_messaggio,
                tipo: dati.tipo_messaggio,
                mittente: dati.nome_mittente,
                id_mittente: dati.id_mittente,
                oggetto: dati.oggetto_messaggio
            };

            $("#oggetto_messaggio").text( decodeURIComponent( dati.oggetto_messaggio ) );
            $("#mittente_messaggio").text( dati.nome_mittente );
            $("#destinatario_messaggio").text( dati.nome_destinatario );
            $("#data_messaggio").text( dati.data_messaggio );
            $("#corpo_messaggio").text( decodeURIComponent( dati.testo_messaggio ) );

            if( dati.casella_messaggio === "inviati" )
                $("#rispondi_messaggio").attr("disabled",true);
            else
                $("#rispondi_messaggio").attr("disabled",false);
        },

        leggiMessaggio: function ( e )
        {
            var target = $(e.target);
            this.recuperaMessaggio( target.attr("data-id"), target.attr("data-tipo"), target.attr("data-casella") );
            this.vaiA( $("#leggi_messaggio"), e );
        },

        formattaNonLetti: function ( data, type, row )
        {
            return parseInt( row.letto_messaggio, 10 ) === 0 ? "<b>"+data+"</b>" : data;
        },

        formattaOggettoMessaggio: function ( data, type, row )
        {
            return this.formattaNonLetti( "<a href='#' class='link-messaggio' data-id='"+row.id_messaggio+"' data-tipo='"+row.tipo_messaggio+"' data-casella='"+row.casella_messaggio+"'>"+data+"</a>", type, row );
        },

        tabellaDisegnata: function ( e )
        {
            $(".link-messaggio").unbind("click");
            $(".link-messaggio").click( this.leggiMessaggio.bind(this) );
        },

        aggiornaDati: function ()
        {
            if( this.tab_inarrivo_fg ) this.tab_inarrivo_fg.ajax.reload( null, true );
            if( this.tab_inviati_fg )  this.tab_inviati_fg.ajax.reload( null, true );
            if( this.tab_inarrivo_ig ) this.tab_inarrivo_ig.ajax.reload( null, true );
            if( this.tab_inviati_ig )  this.tab_inviati_ig.ajax.reload( null, true );
        },

        mostraMessaggi: function ()
        {
            this.user_info = JSON.parse( window.localStorage.getItem("user") );
            this.pg_info   = window.localStorage.getItem("logged_pg");
            this.pg_info   = this.pg_info ? JSON.parse( this.pg_info ) : null;

            if( this.pg_info )
                $(".messaggi-page").find(".nav > li.inizialmente-nascosto").show();
            else
                $("#tipo_messaggio").find("option[value='ig']").remove();

            this.tab_inarrivo_fg = this.creaDataTable.call( this, 'lista_inarrivo_fg_table', Constants.API_GET_MESSAGGI, {tipo: "fg", casella: "inarrivo", id: this.user_info.email_giocatore});
            this.tab_inviati_fg  = this.creaDataTable.call( this, 'lista_inviati_fg_table', Constants.API_GET_MESSAGGI, {tipo: "fg", casella: "inviati", id: this.user_info.email_giocatore});

            if( this.pg_info )
            {
                this.tab_inarrivo_ig = this.creaDataTable.call( this, 'lista_inarrivo_ig_table', Constants.API_GET_MESSAGGI, {tipo: "ig", casella: "inarrivo", id: this.pg_info.id_personaggio});
                this.tab_inviati_ig  = this.creaDataTable.call( this, 'lista_inviati_ig_table', Constants.API_GET_MESSAGGI, {tipo: "ig", casella: "inviati", id: this.pg_info.id_personaggio});
            }
        },

        creaDataTable: function ( id, url, data )
        {
            var prima_colonna = "nome_mittente";

            if( data.casella === "inviati" )
                prima_colonna = "nome_destinatario";

            return $( '#'+id )
                .on("error.dt", this.erroreDataTable.bind(this) )
                .on("draw.dt", this.tabellaDisegnata.bind(this) )
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
                        {
                            data : prima_colonna,
                            render : this.formattaNonLetti.bind(this)
                        },
                        {
                            data   : "oggetto_messaggio",
                            render : this.formattaOggettoMessaggio.bind(this)
                        },
                        {
                            data : "data_messaggio",
                            render : this.formattaNonLetti.bind(this)
                        }
                    ],
                    order      : [[2, 'desc']]
                } );
        },

        inviaMessaggio: function ()
        {
            var destinatario = this.id_destinatario,
                oggetto      = $("#oggetto").val(),
                testo        = $("#messaggio").val(),
                data         = {};

            if( !destinatario || !oggetto || !testo )
            {
                Utils.showError("Per favore compilare tutti i campi.");
                return false;
            }

            data.tipo         = $("#tipo_messaggio").val();
            data.mittente     = data.tipo === "ig" && this.pg_info ? this.pg_info.id_personaggio : this.user_info.email_giocatore;
            data.destinatario = destinatario;
            data.oggetto      = encodeURIComponent( oggetto );
            data.testo        = encodeURIComponent( testo );

            if( this.messaggio_in_lettura )
                data.id_risposta = this.messaggio_in_lettura.id;

            $.ajax({
                url: Constants.API_POST_MESSAGGIO,
                method: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: data,
                success: function( data )
                {
                    if ( data.status === "ok" )
                    {
                        $("#message").unbind("hidden.bs.modal");
                        $("#message").on("hidden.bs.modal", function ()
                        {
                            window.location.reload();
                        });
                        Utils.showMessage("Messaggio inviato con successo");
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

        recuperaMessaggio: function ( idmex, tipo, casella )
        {
            $.ajax({
                url: Constants.API_GET_MESSAGGIO_SINGOLO,
                method: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: {
                    mexid   : idmex,
                    idu     : tipo === "ig" ? this.pg_info.id_personaggio : this.user_info.email_giocatore,
                    tipo    : tipo,
                    casella : casella
                },
                success: function( data )
                {
                    if ( data.status === "ok" )
                    {
                        this.mostraMessaggioSingolo( data.result );
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

        nuovoBoxAppare: function ( cosa, e )
        {
            this.aggiornaDati();

            if( !cosa.is( $("#leggi_messaggio") ) )
                this.liberaSpazioMessaggio();

            if( cosa.is( $("#scrivi_messaggio") ) )
                this.impostaInterfacciaScrittura();

            if( !$(e.target).is( $("#rispondi_messaggio") ) && !cosa.is( $("#leggi_messaggio") ) )
                this.risettaMessaggio();
        },

        mostra: function ( cosa, e )
        {
            this.visibile_ora = cosa;
            this.visibile_ora.fadeIn( 400 );

            this.nuovoBoxAppare( cosa, e );
        },

        vaiA: function ( dove, e )
        {
            var target = $(e.target);

            $(".active").removeClass("active");

            if( target.is("a") )
                target.parent().addClass("active");
            else
                target.addClass("active");

            this.visibile_ora.fadeOut( 400, this.mostra.bind(this, dove, e) );
        },

        setListeners: function ()
        {
            $("#vaia_inarrivo_fg").click( this.vaiA.bind( this, $("#lista_inarrivo_fg") ) );
            $("#vaia_inarrivo_ig").click( this.vaiA.bind( this, $("#lista_inarrivo_ig") ) );
            $("#vaia_inviate_fg").click( this.vaiA.bind( this, $("#lista_inviati_fg") ) );
            $("#vaia_inviate_ig").click( this.vaiA.bind( this, $("#lista_inviati_ig") ) );
            $("#vaia_scrivi").click( this.vaiA.bind(this, $("#scrivi_messaggio") ) );
            $("#rispondi_messaggio").click( this.vaiA.bind(this, $("#scrivi_messaggio") ) );
        }
    }
}();

$(function () {
    MessaggingManager.init();
});