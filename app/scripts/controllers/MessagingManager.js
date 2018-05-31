/**
 * Created by Miroku on 03/03/2018.
 */

var MessaggingManager = function ()
{
    return {

        init: function ()
        {
            this.user_info = JSON.parse( window.localStorage.getItem("user") );
            this.visibile_ora = typeof this.user_info.pg_da_loggare !== "undefined" ? $("#lista_inarrivo_ig") : $("#lista_inarrivo_fg");

            this.vaiA(this.visibile_ora,true);

            this.setListeners( );
            this.controllaStorage( );
            this.mostraMessaggi( );
        },

        erroreDataTable: function ( e, settings, techNote, message )
        {
            if( !settings.jqXHR.responseText )
                return false;

            var real_error = settings.jqXHR.responseText.replace(/^([\S\s]*?)\{"[\S\s]*/i,"$1");
            real_error = real_error.replace("\n","<br>");
            Utils.showError(real_error);
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

            $("#tipo_messaggio").attr("disabled", false);
            $("#invia_messaggio").attr("disabled", true);
        },

        destinatarioSelezionato: function ( event, ui )
        {
            this.id_destinatario = ui.item.real_value;
            $("#invia_messaggio").attr("disabled",false);
        },

        scrittoSuDestinatario: function ( e, ui )
        {
            if( $("#tipo_messaggio").val() === "ig" && $(e.target).val().substr(0,1) === "#" )
            {
                this.id_destinatario = $(e.target).val().substr(1);
                $("#invia_messaggio").attr("disabled", false);
            }
            else if ( $("#tipo_messaggio").val() === "ig" && $(e.target).val().substr(0,1) !== "#" )
                $("#invia_messaggio").attr("disabled",true);
        },

        selezionatoDestinatario: function ( e, ui )
        {
            if( !ui.item && $("#tipo_messaggio").val() !== "ig" && $(e.target).val().substr(0,1) !== "#" )
                $("#invia_messaggio").attr("disabled",true);
        },

        inserisciDestinatario: function ( )
        {

            if( $("#tipo_messaggio").val() === "ig" ) $("#mittente").val( "Da: " + this.pg_info.nome_personaggio );
            else if( $("#tipo_messaggio").val() === "fg" ) $("#mittente").val( "Da: " + this.user_info.nome_giocatore );
        },

        cambiaListaDestinatari: function ( e )
        {
            if( typeof $("#destinatario").data('ui-autocomplete') !== "undefined" )
            {
                this.id_destinatario = null;
                $("#destinatario").val("");
                $("#invia_messaggio").attr("disabled",true);
                $("#destinatario").autocomplete( "option", "source", this.recuperaDestinatariAutofill.bind(this,$("#tipo_messaggio").val()) );

                $("#destinatario").popover("destroy");

                if( $("#tipo_messaggio").val() === "ig" )
                    $("#destinatario").popover({
                        content: "In caso di ID inserire sempre # prima del numero.",
                        trigger: Utils.isDeviceMobile() ? "click" : "hover",
                        placement: "top"
                    });
            }

            this.inserisciDestinatario();
        },

        recuperaDestinatariAutofill: function ( tipo, req, res )
        {
            var url = tipo === "ig" ? Constants.API_GET_DESTINATARI_IG : Constants.API_GET_DESTINATARI_FG;
            //var url = Constants.API_GET_DESTINATARI_IG;

            Utils.requestData(
                url,
                "GET",
                { term : req.term },
                function( data )
                {
                    res( data.results );
                }
            );
        },

        impostaInterfacciaScrittura: function ( )
        {
            var default_type = "fg";

			if( this.user_info && this.user_info.pg_da_loggare )
                default_type = "ig";

            $("#tipo_messaggio").val(default_type);
			
            if( typeof $("#destinatario").data('ui-autocomplete') === "undefined" )
            {
                $("#destinatario").autocomplete({
                    autoFocus : true,
                    select : this.destinatarioSelezionato.bind(this),
                    search : this.scrittoSuDestinatario.bind(this),
                    change : this.selezionatoDestinatario.bind(this),
                    source : this.recuperaDestinatariAutofill.bind(this,default_type)
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

                if (this.messaggio_in_lettura.oggetto)
                {
                    $("#oggetto").val("Re: " + this.messaggio_in_lettura.oggetto.replace(/^\s*?re:\s?/i, ""));
                    $("#oggetto").attr("disabled", true);
                }

                $("#invia_messaggio").attr("disabled",false);
            }

            this.inserisciDestinatario();
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
            this.vaiA( $("#leggi_messaggio"), false, e );
        },

        formattaNonLetti: function ( data, type, row )
        {
            return parseInt( row.letto_messaggio, 10 ) === 0 ? "<strong>"+data+"</strong>" : data;
        },

        formattaOggettoMessaggio: function ( data, type, row )
        {
            //TODO: qui non si sta evitando l'HTML injection
            return this.formattaNonLetti( "<a href='#' " +
                                                "class='link-messaggio' " +
                                                "data-id='"+row.id_messaggio+"' " +
                                                "data-tipo='"+row.tipo_messaggio+"' " +
                                                "data-casella='"+row.casella_messaggio+"'>"+decodeURIComponent(data)+"</a>", type, row );
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
            this.pg_info   = window.localStorage.getItem("logged_pg");
            this.pg_info   = this.pg_info ? JSON.parse( this.pg_info ) : null;

            if( this.user_info && !this.user_info.pg_da_loggare )
                $("#sezioni").find("li:first-child").removeClass("inizialmente-nascosto").show();

            if( this.pg_info )
                $("#sezioni").find("li:last-child").removeClass("inizialmente-nascosto").show();
            else
                $("#tipo_messaggio").find("option[value='ig']").remove();

            if( this.user_info && this.user_info.pg_da_loggare )
            {
                $("#sezioni").find(".nome_sezione").text("Caselle");
                $("#tipo_messaggio").val("ig").hide();
				// this.recuperaDestinatariAutofill.bind(this,"ig");
            }

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
                    dom: "<'row'<'col-sm-6'lB><'col-sm-6'f>>" +
                    "<'row'<'col-sm-12 table-responsive'tr>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                    buttons    : ["reload"],
                    language   : Constants.DATA_TABLE_LANGUAGE,
                    ajax       : function (d, callback)
                    {
                        Utils.requestData(
                            url,
                            "GET",
                            $.extend(d,data),
                            callback
                        );
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

            Utils.requestData(
                Constants.API_POST_MESSAGGIO,
                "POST",
                data,
                "Messaggio inviato con successo",
                null,
                Utils.reloadPage
            );
        },

        recuperaMessaggio: function ( idmex, tipo, casella )
        {
            var dati = {
                mexid   : idmex,
                idu     : tipo === "ig" ? this.pg_info.id_personaggio : this.user_info.email_giocatore,
                tipo    : tipo,
                casella : casella
            };

            Utils.requestData(
                Constants.API_GET_MESSAGGIO_SINGOLO,
                "POST",
                dati,
                function( data )
                {
                   this.mostraMessaggioSingolo( data.result );
                }.bind(this)
            );
        },

        nuovoBoxAppare: function ( cosa, e )
        {
            this.aggiornaDati();

            if( !cosa.is( $("#leggi_messaggio") ) )
                this.liberaSpazioMessaggio();

            if( cosa.is( $("#scrivi_messaggio") ) )
                this.impostaInterfacciaScrittura();

            if( e && !$(e.target).is( $("#rispondi_messaggio") ) && !cosa.is( $("#leggi_messaggio") ) )
                this.risettaMessaggio();
        },

        mostra: function ( cosa, e )
        {
            this.visibile_ora = cosa;
            this.visibile_ora.fadeIn( 400 );

            this.nuovoBoxAppare( cosa, e );
        },

        vaiA: function ( dove, force, e )
        {
            if( this.visibile_ora.is( dove ) && !force )
                return false;

            var target = e ? $(e.target) : null;

            $(".active").removeClass("active");

            if( target && target.is("a") )
                target.parent().addClass("active");
            else if ( target && !target.is("a") )
                target.addClass("active");

            this.visibile_ora.fadeOut( 400, this.mostra.bind(this, dove, e) );
        },

        controllaStorage: function ()
        {
            var scrivi_a = window.localStorage.getItem("scrivi_a");

            if( scrivi_a )
            {
                var dati = JSON.parse(scrivi_a),
                    sp   = dati.id.split("#"),
                    tipo = sp[0],
                    id   = sp[1];

                window.localStorage.removeItem("scrivi_a");

                if( tipo === "ig" && !window.localStorage.getItem("logged_pg") )
                {
                    Utils.showError("Devi loggarti con un pg prima di mandare messaggi In Gioco.", Utils.redirectTo.bind(this,Constants.MAIN_PAGE));
                    return;
                }

                if(    ( tipo === "ig" && this.user_info && this.user_info.pg_propri.length > 0 && this.user_info.pg_propri.indexOf( id ) !== -1 )
                    || ( tipo === "fg" && this.user_info.email_giocatore === id ) )
                {
                    Utils.showError("Non puoi mandare messaggi a te stesso o ai tuoi personaggi.", Utils.redirectTo.bind(this,Constants.MAIN_PAGE));
                    return;
                }

                this.messaggio_in_lettura = {
                    id_mittente : id,
                    tipo        : tipo,
                    mittente    : dati.nome
                };

                this.vaiA( $("#scrivi_messaggio"), false, null );
            }
        },

        setListeners: function ()
        {
            $("#vaia_inarrivo_fg").click( this.vaiA.bind( this, $("#lista_inarrivo_fg"), false ) );
            $("#vaia_inarrivo_ig").click( this.vaiA.bind( this, $("#lista_inarrivo_ig"), false ) );
            $("#vaia_inviate_fg").click( this.vaiA.bind( this, $("#lista_inviati_fg"), false ) );
            $("#vaia_inviate_ig").click( this.vaiA.bind( this, $("#lista_inviati_ig"), false ) );
            $("#vaia_scrivi").click( this.vaiA.bind(this, $("#scrivi_messaggio"), false ) );
            $("#rispondi_messaggio").click( this.vaiA.bind(this, $("#scrivi_messaggio"), false ) );
        }
    }
}();

$(function () {
    MessaggingManager.init();
});