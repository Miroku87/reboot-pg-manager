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

            $(".form-destinatario").first().find(".nome-destinatario").val("");
            $(".form-destinatario").first().find(".nome-destinatario").attr("disabled", false);
            $(".form-destinatario").first().find(".controlli-destinatario").show();
            $("#messaggio").val("");
            $("#messaggio").attr("disabled",false);
            $("#oggetto").val("");
            $("#oggetto").attr("disabled",false);

            $("#tipo_messaggio").attr("disabled", false);
            $("#invia_messaggio").attr("disabled", true);
        },

        aggiungiDestinatarioInArray: function( input_elem, id )
        {
            var index = $(".form-destinatario").index( $(input_elem).parents(".form-destinatario") );

            if( !( this.id_destinatari instanceof Array ) )
                this.id_destinatari = [];

            if( this.id_destinatari.indexOf( id ) === -1 && !/^\s*$/.test( id ) )
                this.id_destinatari[index] = id;

            console.log("adding", this.id_destinatari);
        },

        rimuoviDestinatarioInArray: function( input_elem )
        {
            var index = $(".form-destinatario").index( $(input_elem).parents(".form-destinatario") );

            if( this.id_destinatari instanceof Array && this.id_destinatari[index] )
                this.id_destinatari.splice(index,1);

            console.log("removing", this.id_destinatari);
        },

        destinatarioSelezionato: function ( event, ui )
        {
            this.aggiungiDestinatarioInArray( event.target, ui.item.real_value );

            $("#invia_messaggio").attr("disabled",false);
        },

        scrittoSuDestinatario: function ( e, ui )
        {
            var scritta = $(e.target).val().substr(1),
                index_dest = $(".form-destinatario").index( $(e.target).parents(".form-destinatario") );

            if( this.id_destinatari && this.id_destinatari[index_dest] )
                this.id_destinatari[index_dest] = null;

            if( $("#tipo_messaggio").val() === "ig" && $(e.target).val().substr(0,1) === "#" && /^\d+$/.test(scritta) && scritta !== "" )
            {
                this.aggiungiDestinatarioInArray( e.target, scritta );
                $("#invia_messaggio").attr("disabled", false);
            }
            //else if ( $("#tipo_messaggio").val() === "ig" && $(e.target).val().substr(0,1) !== "#" )
            //    $("#invia_messaggio").attr("disabled",true);
        },

        selezionatoDestinatario: function ( e, ui )
        {
            //if( !ui.item && $("#tipo_messaggio").val() !== "ig" && $(e.target).val().substr(0,1) !== "#" )
            //    $("#invia_messaggio").attr("disabled",true);
        },

        inserisciMittente: function ( )
        {
            if( $("#tipo_messaggio").val() === "ig" ) $("#mittente").val( "Da: " + this.pg_info.nome_personaggio );
            else if( $("#tipo_messaggio").val() === "fg" ) $("#mittente").val( "Da: " + this.user_info.nome_giocatore );
        },

        resettaInputDestinatari: function()
        {
            $(".form-destinatario:not(:first)").remove();
            $(".form-destinatario").first().find(".nome-destinatario").val("");
            this.impostaControlliDestinatari();
        },

        cambiaListaDestinatari: function ( e )
        {
            this.id_destinatari = [];
            this.resettaInputDestinatari();
            $("#invia_messaggio").attr("disabled",true);

            this.inserisciMittente();
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

        rimuoviAutocompleteDestinatario: function ( )
        {
            if ( $(".form-destinatario").find(".nome-destinatario").data('autocomplete') )
            {
                $(".form-destinatario").find(".nome-destinatario").autocomplete("destroy");
                $(".form-destinatario").find(".nome-destinatario").removeData('autocomplete');
            }
        },

        impostaAutocompleteDestinatario: function ( )
        {
            this.rimuoviAutocompleteDestinatario();
            $(".form-destinatario").find(".nome-destinatario").autocomplete({
                autoFocus : true,
                select : this.destinatarioSelezionato.bind(this),
                search : this.scrittoSuDestinatario.bind(this),
                change : this.selezionatoDestinatario.bind(this),
                source : this.recuperaDestinatariAutofill.bind(this,$("#tipo_messaggio").val())
            });
        },

        impostaInterfacciaScrittura: function ( )
        {
            var default_type = "fg";

			if( this.user_info && this.user_info.pg_da_loggare )
                default_type = "ig";

            $("#tipo_messaggio").val(default_type);
            this.impostaControlliDestinatari();

            $("#tipo_messaggio").change( this.cambiaListaDestinatari.bind(this) );
            $("#invia_messaggio").click( this.inviaMessaggio.bind(this) );
            $("#risetta_messaggio").click( this.risettaMessaggio.bind(this) );

            if( this.messaggio_in_lettura )
            {
                this.id_destinatari = [ this.messaggio_in_lettura.id_mittente ];

                $("#tipo_messaggio").val( this.messaggio_in_lettura.tipo );
                $("#tipo_messaggio").attr("disabled", true);

                $(".form-destinatario").first().find(".nome-destinatario").val( this.messaggio_in_lettura.mittente );
                $(".form-destinatario").first().find(".nome-destinatario").attr("disabled", true);
                $(".form-destinatario").first().find(".controlli-destinatario").hide();

                if (this.messaggio_in_lettura.oggetto)
                {
                    var oggetto_decodificato = decodeURIComponent(this.messaggio_in_lettura.oggetto);
                    $("#oggetto").val("Re: " + oggetto_decodificato.replace(/^\s*?re:\s?/i, ""));
                    $("#oggetto").attr("disabled", true);
                }

                $("#invia_messaggio").attr("disabled",false);
            }

            this.inserisciMittente();
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
                id          : dati.id_messaggio,
                tipo        : dati.tipo_messaggio,
                mittente    : dati.nome_mittente,
                id_mittente : dati.id_mittente,
                oggetto     : dati.oggetto_messaggio
            };

            var testo_mex = decodeURIComponent( dati.testo_messaggio );
            testo_mex = testo_mex.replace(/\n/g,"<br>");

            $("#oggetto_messaggio").text( decodeURIComponent( dati.oggetto_messaggio ) );
            $("#mittente_messaggio").text( dati.nome_mittente );
            $("#destinatario_messaggio").text( dati.nome_destinatario );
            $("#data_messaggio").text( dati.data_messaggio );
            $("#corpo_messaggio").html( testo_mex );

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

            if( this.user_info && !( this.user_info.pg_da_loggare && typeof this.user_info.event_id !== "undefined" ) )
                $("#sezioni").find("li:first-child").removeClass("inizialmente-nascosto").show();

            if( this.pg_info )
                $("#sezioni").find("li:last-child").removeClass("inizialmente-nascosto").show();
            else
                $("#tipo_messaggio").find("option[value='ig']").remove();

            if( this.user_info && this.user_info.pg_da_loggare && typeof this.user_info.event_id !== "undefined" )
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

        impostaControlliDestinatari: function ()
        {
            $(".form-destinatario").find(".aggiungi-destinatario").unbind("click");
            $(".form-destinatario").find(".rimuovi-destinatario").unbind("click");

            $(".form-destinatario").find(".aggiungi-destinatario").click( this.aggiungiDestinatario.bind( this ) );
            $(".form-destinatario").find(".rimuovi-destinatario:not(.disabled)").click( this.rimuoviDestinatario.bind( this ) );

            this.impostaAutocompleteDestinatario();

            if( $("#tipo_messaggio").val() === "ig" )
                $(".form-destinatario").find(".nome-destinatario").popover({
                    content: "In caso di ID inserire sempre # prima del numero.",
                    trigger: Utils.isDeviceMobile() ? "click" : "hover",
                    placement: "top"
                });
        },

        aggiungiDestinatario: function ( e )
        {
            var nodo = $(".form-destinatario").first().clone();

            nodo.find(".nome-destinatario").val("");
            nodo.find(".rimuovi-destinatario").removeClass("disabled");
            nodo.insertAfter( $(e.currentTarget).parents(".form-destinatario") );

            this.impostaControlliDestinatari();
        },

        rimuoviDestinatario: function ( e )
        {
            this.rimuoviDestinatarioInArray( $(e.currentTarget).parents(".form-destinatario").find(".nome-destinatario")[0] );
            $(e.currentTarget).parents(".form-destinatario").remove();
        },

        messaggioInviatoOk: function ( data )
        {
            Utils.showMessage(data.message,Utils.reloadPage);
        },

        inviaMessaggio: function ()
        {
            var destinatari  = this.id_destinatari,
                oggetto      = $("#oggetto").val(),
                testo        = $("#messaggio").val(),
                data         = {};

            if( !destinatari || ( destinatari && destinatari.length === 0 ) || !oggetto || !testo )
            {
                Utils.showError("Per favore compilare tutti i campi.");
                return false;
            }

            data.tipo         = $("#tipo_messaggio").val();
            data.mittente     = data.tipo === "ig" && this.pg_info ? this.pg_info.id_personaggio : this.user_info.email_giocatore;
            data.destinatari  = destinatari;
            data.oggetto      = encodeURIComponent( oggetto );
            data.testo        = encodeURIComponent( testo );

            if( this.messaggio_in_lettura )
                data.id_risposta = this.messaggio_in_lettura.id;

            Utils.requestData(
                Constants.API_POST_MESSAGGIO,
                "POST",
                data,
                this.messaggioInviatoOk.bind(this),
                null,
                null
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
            else if ( this.visibile_ora.is( $("#scrivi_messaggio") ) )
                this.resettaInputDestinatari();

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
