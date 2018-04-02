/**
 * Created by Miroku on 11/03/2018.
 */
var LiveEventsManager = function ()
{
    return {
        init: function ()
        {
            window.localStorage.removeItem("evento_mod_id");
            this.setListeners();
            this.recuperaInfoUtente();
            this.recuperaUltimoEvento();
            this.recuperaPersonaggi();
            this.impostaModalIscrizione();
            this.impostaTabellaPgIscritti("prossimo");
            this.impostaTabellaPgIscritti("precedente");
            this.impostaTabellaEventiPreparati();
        },

        mandaIscrizione: function()
        {
            Utils.requestData(
                Constants.API_POST_ISCRIZIONE,
                "POST",
                {
                    id_evento : this.id_evento,
                    id_pg     : $("#personaggio").val(),
                    pagato    : $("#pagato").is(":checked") ? 1 : 0,
                    tipo_pag  : $("#metodo_pagamento").val(),
                    note      : $("#note").val()
                },
                "Personaggio iscritto con successo.",
                null,
                Utils.reloadPage
            );
        },

        mostraModalIscrizione: function()
        {
            $("#note").val("");
            $("#pagato").attr("checked",false);
            $("#modal_iscrivi_pg").modal({drop:"static"});
        },

        impostaModalIscrizione: function()
        {
            $( '#modal_iscrivi_pg input[type="checkbox"]' ).iCheck( {
                checkboxClass : 'icheckbox_square-blue'
            } );
            $("#btn_iscrivi").click(this.mandaIscrizione.bind(this));
        },

        vaiAMaps: function()
        {
            var win = window.open('https://www.google.it/maps/search/' + encodeURIComponent(this.luogo_evento), '_blank');
            win.focus();
        },

        impostaMappa : function ( id_contenitore, luogo )
        {
            var latlng = new google.maps.LatLng(45.464133, 9.191300);
            var mapOptions = {
                zoom : 12,
                center : latlng
            };
            var map = new google.maps.Map(document.getElementById( id_contenitore ), mapOptions);
            this.centraMappaInLuogo( map, luogo );
        },

        centraMappaInLuogo : function ( map, luogo )
        {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'address' : luogo }, function (results, status)
            {
                if (status == 'OK')
                {
                    map.setCenter(results[0].geometry.location);
                    var marker = new google.maps.Marker({
                        map : map,
                        position : results[0].geometry.location
                    });
                    marker.addListener('click', this.vaiAMaps.bind(this) );
                }
                else
                {
                    Utils.showError('Google Map non &egrave; riuscito a restituire la mappa. Errore: ' + status);
                }
            }.bind(this));
        },

        disiscriviPg: function ( evid, pgid, quando )
        {
            Utils.requestData(
                Constants.API_POST_DISISCRIZIONE,
                "POST",
                {
                    evid   : evid,
                    pgid   : pgid
                },
                "Personaggio disiscritto con successo.",
                null,
                this["pg_"+ quando].ajax.reload.bind(this,null,false)
            );
        },

        confermaDisiscriviPg: function ( e )
        {
            var t = $( e.target );

            Utils.showConfirm("Vuoi veramente disiscrivere <strong>"+ t.attr("data-nome")+"</strong>?", this.disiscriviPg.bind(this, t.attr("data-evid"), t.attr("data-id"), t.attr("data-quando")));
        },

        inviaModificaNoteIscrizione: function ( id, evid, quando, e )
        {
            Utils.requestData(
                Constants.API_POST_EDIT_ISCRIZIONE,
                "POST",
                {evid: evid, pgid: id, modifiche: {note_iscrizione:$("#modal_note_iscrizione").find("#note_iscrizione").val()}},
                "Note modificate con successo.",
                null,
                function ()
                {
                    Utils.resetSubmitBtn();
                    this["pg_"+quando].ajax.reload(null,true);
                }.bind(this)
            );
        },

        mostraModalNoteIscrizione: function ( evid, pgid, quando, nomepg, nomegioc, data )
        {
            $("#modal_note_iscrizione").find("#nome_pg").text(nomepg);
            $("#modal_note_iscrizione").find("#nome_giocatore").text(nomegioc);
            $("#modal_note_iscrizione").find("#note_iscrizione").val(data.result);

            $("#modal_note_iscrizione").find("#btn_invia_mods").unbind("click",this.inviaModificaNoteIscrizione.bind(this));
            $("#modal_note_iscrizione").find("#btn_invia_mods").click(this.inviaModificaNoteIscrizione.bind(this, pgid, evid, quando));

            $("#modal_note_iscrizione").modal({drop:"static"});
        },

        recuperaVecchieNoteIscrizione: function ( e )
        {
            var t = $( e.target );

            Utils.requestData(
                Constants.API_GET_NOTE_ISCRITTO,
                "GET",
                {id_ev: t.attr("data-evid"), id_pg: t.attr("data-id")},
                this.mostraModalNoteIscrizione.bind(this, t.attr("data-evid"), t.attr("data-id"), t.attr("data-quando"), t.attr("data-nome"), t.attr("data-utente") )
            );
        },

        modificaPagataIscrizione: function ( e )
        {
            var t = $( e.target );

            t.attr("disabled",true);
            Utils.requestData(
                Constants.API_POST_EDIT_ISCRIZIONE,
                "POST",
                {
                    evid   : t.attr("data-evid"),
                    pgid   : t.attr("data-id"),
                    mods   : { pagato_iscrizione: t.is(":checked") ? 1 : 0 }
                },
                function ()
                {
                    t.attr("disabled",false);
                    this["pg_"+ t.attr("data-quando")].ajax.reload(null,false);
                }.bind(this)
            );
        },

        creaCheckBoxPagato: function (data, type, row)
        {
            var checked = data === "1" ? "checked" : "",
                checkbox = "<div class='checkbox icheck'>" +
                    "<input type='checkbox' " +
                        "class='inizialmente-nascosto modificaIscrizionePG_pagato_iscrizione_proprio modificaIscrizionePG_pagato_iscrizione_altri' " +
                        "data-id='"+row.personaggi_id_personaggio+"' " +
                        "data-evid='"+row.id_evento+"' " +
                        "data-quando='"+row.quando+"' " +
                        ""+checked+">" +
                    "</div>",
                pagato = data === "1" ? "S&igrave;" : "No",
                output = Utils.controllaPermessi( this.user_info, ["modificaIscrizionePG_pagato_iscrizione_proprio","modificaIscrizionePG_pagato_iscrizione_altri"]) ? checkbox : pagato;

            return output;
        },

        renderAzioniPgIscritti: function (data, type, row)
        {
            var pulsanti = "";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default inizialmente-nascosto modificaIscrizionePG_note_iscrizione_proprio modificaIscrizionePG_note_iscrizione_altri' " +
                "data-id='" + row.personaggi_id_personaggio + "' " +
                "data-evid='"+row.id_evento+"' " +
                "data-nome='"+row.nome_personaggio+"' " +
                "data-utente='"+row.nome_completo+"' " +
                "data-quando='"+row.quando+"' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Modifica Note'><i class='fa fa-pencil'></i></button>";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default inizialmente-nascosto disiscriviPG_altri disiscriviPG_proprio' " +
                "data-id='" + row.personaggi_id_personaggio + "' " +
                "data-evid='"+row.id_evento+"' " +
                "data-nome='"+row.nome_personaggio+"' " +
                "data-quando='"+row.quando+"' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Disiscrivi PG'><i class='fa fa-remove'></i></button>";

            return pulsanti;
        },

        setPGTableListeners: function( quando )
        {
            AdminLTEManager.controllaPermessi();

            $( '#pg_'+quando ).find( "td [data-toggle='tooltip']" ).tooltip("destroy");
            $( '#pg_'+quando ).find( "td [data-toggle='tooltip']" ).tooltip();

            $( '#pg_'+quando ).find( "td [data-toggle='popover']" ).popover("destroy");
            $( '#pg_'+quando ).find( "td [data-toggle='popover']" ).popover({
                trigger: Utils.isDeviceMobile() ? 'click' : 'hover',
                placement: 'top',
                container: 'body',
                html: true
            });

            $( '#pg_'+quando ).find( 'input[type="checkbox"]' ).iCheck("destroy");
            $( '#pg_'+quando ).find( 'input[type="checkbox"]' ).iCheck( {
                checkboxClass : 'icheckbox_square-blue'
            } );

            $( '#pg_'+quando ).find("td input.modificaIscrizionePG_pagato_iscrizione_altri").unbind( "ifChanged", this.modificaPagataIscrizione.bind(this) );
            $( '#pg_'+quando ).find("td input.modificaIscrizionePG_pagato_iscrizione_altri").on( "ifChanged", this.modificaPagataIscrizione.bind(this) );

            $( '#pg_'+quando ).find("td button.modificaIscrizionePG_note_iscrizione_altri").unbind( "click", this.recuperaVecchieNoteIscrizione.bind(this) );
            $( '#pg_'+quando ).find("td button.modificaIscrizionePG_note_iscrizione_altri").click( this.recuperaVecchieNoteIscrizione.bind(this) );

            $( '#pg_'+quando ).find("td button.disiscriviPG_altri").unbind( "click", this.confermaDisiscriviPg.bind(this) );
            $( '#pg_'+quando ).find("td button.disiscriviPG_altri").click( this.confermaDisiscriviPg.bind(this) );
        },

        impostaTabellaPgIscritti: function( quando )
        {
            var columns       = [],
                permessi_avan = Utils.controllaPermessi( this.user_info, [ "recuperaListaIscrittiAvanzato" ]),
                url           = permessi_avan ? Constants.API_GET_INFO_ISCRITTI_AVANZATE : Constants.API_GET_INFO_ISCRITTI_BASE;

            if( !permessi_avan && quando === "precedente" )
                return false;

            columns.push({
                title: "ID",
                data: "personaggi_id_personaggio"
            });
            columns.push({
                title: "Nome Personaggio",
                data   : "nome_personaggio"
            });
            columns.push({
                title: "Nome Giocatore",
                data   : "nome_completo"
            });
            columns.push({
                title: "Classi Civili",
                data: "classi_civili",
                render : $.fn.dataTable.render.ellipsis( 20, true, false )
            });
            columns.push({
                title: "Classi Militari",
                data: "classi_militari",
                render : $.fn.dataTable.render.ellipsis( 20, true, false )
            });

            if ( permessi_avan )
                columns.push({
                    title : "Pagato",
                    data : "pagato_iscrizione",
                    render : this.creaCheckBoxPagato.bind(this)
                });

            if( Utils.controllaPermessi( this.user_info, ["modificaIscrizionePG_pagato_iscrizione_proprio","modificaIscrizionePG_pagato_iscrizione_altri"]) )
                columns.push({
                    title : "Tipo Pagamento",
                    data : "tipo_pagamento_iscrizione"
                });

            if ( permessi_avan )
                columns.push({
                    title : "Note",
                    data : "note_iscrizione",
                    render : $.fn.dataTable.render.ellipsis(20, true, false)
                });

            if (Utils.controllaPermessi( this.user_info, ["disiscriviPG_altri","disiscriviPG_proprio", "modificaIscrizionePG_note_iscrizione_proprio","modificaIscrizionePG_note_iscrizione_altri"], false ))
            {
                columns.push({
                    title : "Azioni",
                    render : this.renderAzioniPgIscritti.bind(this)
                });
            }

            this["pg_"+quando] = $( '#pg_'+quando )
                .on("error.dt", this.erroreDataTable.bind(this) )
                .on("draw.dt", this.setPGTableListeners.bind(this, quando) )
                .DataTable( {
                    processing : true,
                    serverSide : true,
                    dom: "<'row'<'col-sm-6'lB><'col-sm-6'f>>" +
                    "<'row'<'col-sm-12 table-responsive'tr>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                    buttons    : ["reload"],
                    language   : Constants.DATA_TABLE_LANGUAGE,
                    ajax       : function (data, callback)
                    {
                        Utils.requestData(
                            url,
                            "GET",
                            $.extend(data,{quando:quando}),
                            function (data)
                            {
                                var button = $( '#pg_'+quando ).parents(".box-body").find(".btn-group > button");
                                if(data.data.length > 0 && data.data[0].punti_assegnati_evento === "0")
                                    button.attr("data-evid",data.data[0].id_evento);
                                else if (data.data.length > 0 && data.data[0].punti_assegnati_evento === "1")
                                {
                                    button.attr("disabled", true);
                                    button.html("<i class='fa fa-edit'></i><br>Punti gi&agrave; assegnati")
                                }

                                callback(data);
                            }.bind(this)
                        );
                    }.bind(this),
                    columns    : columns,
                    order      : [[0, 'desc']]
                } );
        },

        eliminaEvento: function( id )
        {
            Utils.requestData(
                Constants.API_POST_DEL_EVENTO,
                "POST",
                {id_ev: id},
                "L'evento &egrave; stato completamente rimosso dal database e tutte le iscrizioni perse.",
                null,
                Utils.reloadPage
            );
        },

        confermaEliminaEvento: function( e )
        {
            var t = $(e.target);
            Utils.showConfirm("Sicuro di voler eliminare questo evento? Tutti i suoi dati e le iscrizioni dei PG andranno <strong>perse per sempre</strong>.",
                this.eliminaEvento.bind(this, t.attr("data-id")));
        },

        mostraAnteprima: function( d )
        {
            this.riempiCampiEvento( d.result, "anteprima" );
        },

        mostraAnteprimaMessaggio: function( e )
        {
            Utils.requestData(
                Constants.API_GET_EVENTO,
                "GET",
                { id: $(e.target).attr("data-id") },
                this.mostraAnteprima.bind(this)
            );

            if( parseInt( $(e.target).attr("data-pubblico"), 10 ) === 1 )
            {
                $("#modal_anteprima_evento").find("#btn_pubblica").hide();
                $("#modal_anteprima_evento").find("#btn_ritira").show();
                $("#modal_anteprima_evento").find("#btn_ritira").attr("data-id",$(e.target).attr("data-id"));
            }

            $("#modal_anteprima_evento").find("#btn_modifica").attr("data-evid",$(e.target).attr("data-id"));
            $("#modal_anteprima_evento").find("#btn_pubblica").attr("data-id",$(e.target).attr("data-id"));
            $("#modal_anteprima_evento").find("#iscrivi_pg").attr("disabled",true);
            $("#modal_anteprima_evento").modal({drop:"static"});
        },

        renderPubblicoEvento: function( data, type, row )
        {
            return parseInt( data, 10 ) === 1 ? "S&igrave;" : "No";
        },

        impostaLinkAnteprima: function( data, type, row )
        {
            return "<a class='btn_anteprima_evento' data-id='"+row.id_evento+"' data-pubblico='"+row.pubblico_evento+"'>"+data+"</a>";
        },

        creaPulsantiAzioniEvento: function( data, type, row )
        {
            var pulsanti = "";

            if ( parseInt( row.pubblico_evento, 10 ) === 1 )
            {
                pulsanti += "<button type='button' " +
                    "class='btn btn-xs btn-default inizialmente-nascosto ritiraEvento' " +
                    "data-id='" + row.id_evento + "' " +
                    "data-toggle='tooltip' " +
                    "data-placement='top' " +
                    "title='Ritira Evento'><i class='fa fa-remove'></i></button>";
            }

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default inizialmente-nascosto modificaEvento' " +
                "data-evid='"+row.id_evento+"' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Modifica Evento'><i class='fa fa-pencil'></i></button>";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default inizialmente-nascosto eliminaEvento' " +
                "data-id='"+row.id_evento+"' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Elimina Evento'><i class='fa fa-trash'></i></button>";

            return pulsanti;
        },

        setGridListeners: function ()
        {
            AdminLTEManager.controllaPermessi();

            $( "td [data-toggle='tooltip']" ).tooltip("destroy");
            $( "td [data-toggle='tooltip']" ).tooltip();

            $( "td [data-toggle='popover']" ).popover("destroy");
            $( "td [data-toggle='popover']" ).popover({
                trigger: Utils.isDeviceMobile() ? 'click' : 'hover',
                placement: 'top',
                container: '#lista_eventi',
                html: true
            });

            $("td > a.btn_anteprima_evento").unbind( "click", this.mostraAnteprimaMessaggio.bind(this) );
            $("td > a.btn_anteprima_evento").click( this.mostraAnteprimaMessaggio.bind(this) );

            $("td > button.eliminaEvento").unbind( "click", this.confermaEliminaEvento.bind(this) );
            $("td > button.eliminaEvento").click( this.confermaEliminaEvento.bind(this) );

            $("td > button.ritiraEvento").unbind( "click", this.confermaRitiraEvento.bind(this) );
            $("td > button.ritiraEvento").click( this.confermaRitiraEvento.bind(this) );

            $("td > button.modificaEvento").unbind( "click", this.vaiAModificaEvento.bind(this) );
            $("td > button.modificaEvento").click( this.vaiAModificaEvento.bind(this) );
        },

        erroreDataTable: function ( e, settings, techNote, message )
        {
            if( !settings.jqXHR || !settings.jqXHR.responseText )
            {
                console.log(message);
                return false;
            }

            var real_error = settings.jqXHR.responseText.replace(/^([\S\s]*?)\{"[\S\s]*/i,"$1");
            real_error = real_error.replace("\n","<br>");
            Utils.showError(real_error);
        },

        impostaTabellaEventiPreparati: function( d )
        {
            if( !Utils.controllaPermessi(this.user_info, ["recuperaListaEventi"]) )
                return false;

            var columns = [];

            columns.push({data: "nome_completo"});
            columns.push({
                data   : "pubblico_evento",
                render : this.renderPubblicoEvento.bind(this)
            });
            columns.push({
                data   : "titolo_evento",
                render : this.impostaLinkAnteprima.bind(this)
            });
            columns.push({data: "data_inizio_evento"});
            columns.push({data: "ora_inizio_evento"});
            columns.push({data: "data_fine_evento"});
            columns.push({data: "ora_fine_evento"});
            columns.push({
                data   : "luogo_evento",
                render : $.fn.dataTable.render.ellipsis( 20, true, false )
            });
            columns.push({data: "costo_evento"});
            columns.push({data: "costo_maggiorato_evento"});
            columns.push({
                data   : "note_evento",
                render : $.fn.dataTable.render.ellipsis( 20, true, false )
            });
            columns.push({
                data           : "azioni",
                render         : this.creaPulsantiAzioniEvento.bind(this),
                className      : 'inizialmente-nascosto visualizza_pagina_crea_evento pubblicaEvento eliminaEvento ritiraEvento',
                orderable      : false
            });

            this.tabella_eventi = $( '#eventi' )
                .on("error.dt", this.erroreDataTable.bind(this) )
                .on("draw.dt", this.setGridListeners.bind(this) )
                .DataTable( {
                    processing : true,
                    serverSide : true,
                    dom: "<'row'<'col-sm-6'lB><'col-sm-6'f>>" +
                    "<'row'<'col-sm-12 table-responsive'tr>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                    buttons    : ["reload"],
                    language   : Constants.DATA_TABLE_LANGUAGE,
                    ajax       : function (data, callback)
                    {
                        Utils.requestData(
                            Constants.API_GET_LISTA_EVENTI,
                            "GET",
                            data,
                            callback
                        );
                    },
                    columns    : columns,
                    order      : [[3, 'desc']]
                } );
        },

        riempiCampiEvento: function( data, suffisso_id )
        {
            var suf = typeof suffisso_id === "undefined" ? "" : "_"+suffisso_id;

            $("#titolo_evento"+suf).text(data.titolo_evento);
            $("#data_inizio_evento"+suf).text(data.data_inizio_evento_it);
            $("#ora_inizio_evento"+suf).text(data.ora_inizio_evento.replace(/:00$/, ""));
            $("#data_fine_evento"+suf).text(data.data_fine_evento_it);
            $("#ora_fine_evento"+suf).text(data.ora_fine_evento.replace(/:00$/, ""));
            $("#luogo_evento"+suf).text(data.luogo_evento);
            $("#costo_evento"+suf).html(data.costo_evento + "&euro;");
            $("#costo_maggiorato_evento"+suf).html(data.costo_maggiorato_evento + "&euro;");
            $("#note_evento"+suf).html(data.note_evento);

            this.impostaMappa( "map"+suf, data.luogo_evento );
        },

        mostraDati: function( d )
        {
            var data = d.result;

            if (data && Object.keys(data).length > 0)
            {
                this.id_evento = data.id_evento;
                this.luogo_evento = data.luogo_evento;

                this.riempiCampiEvento( data );

                $("#info_prossimo_evento").show();
                $("#partecipanti_evento").show();
            }
            else
                $("#no_evento").show(400)
        },

        creaListaPG: function( d )
        {
            var data = d.result,
                elems = data.reduce(function( pre, ora ){ return pre + "<option value=\""+ora.id_personaggio+"\">"+ora.nome_personaggio+"</option>" },"");

            $("#personaggio").append(elems);
        },

        recuperaUltimoEvento: function()
        {
            Utils.requestData(
                Constants.API_GET_EVENTO,
                "GET",
                "",
                this.mostraDati.bind(this)
            );
        },

        recuperaPersonaggi: function()
        {
            Utils.requestData(
                Constants.API_GET_PGS_PROPRI,
                "GET",
                "",
                this.creaListaPG.bind(this)
            );
        },

        vaiAModificaEvento: function( e )
        {
            var t = $(e.target);
            window.localStorage.setItem("evento_mod_id", t.attr("data-evid"));
            Utils.redirectTo( Constants.CREA_EVENTO_PAGE );
        },

        pubblicaEvento: function( id )
        {
            Utils.requestData(
                Constants.API_POST_PUBBLICA_EVENTO,
                "POST",
                {id_ev: id},
                "Ora l'evento &egrave; visibile a tutti i giocatori e sar&agrave; possibile iscriversi.",
                null,
                Utils.reloadPage
            );
        },

        confermaPubblicaEvento: function( e )
        {
            Utils.showConfirm( "Sicuro di voler pubblicare questo evento? In caso affermativo gli utenti potranno iniziare subito a iscrivere i loro PG.",
                this.pubblicaEvento.bind(this,$(e.target).attr("data-id")) );
        },

        ritiraEvento: function( id )
        {
            Utils.requestData(
                Constants.API_POST_RITIRA_EVENTO,
                "POST",
                {id_ev: id},
                "L'evento non &egrave; pi&ugrave; visibile ai giocatori e non sar&agrave; possibile iscriversi.",
                null,
                Utils.reloadPage
            );
        },

        confermaRitiraEvento: function( e )
        {
            Utils.showConfirm( "Sicuro di voler ritirare questo evento?", this.ritiraEvento.bind( this, $(e.target).attr("data-id") ) );
        },

        recuperaInfoUtente: function()
        {
            this.user_info = JSON.parse( window.localStorage.getItem("user") );
        },

        puntiInviati: function ( idev )
        {
            Utils.requestData(
                Constants.API_POST_PUNTI_EVENTO,
                "POST",
                { idev: idev },
                Utils.redirectTo.bind(this,Constants.MAIN_PAGE)
            );

        },

        modificaPuntiAiFiltrati: function ( e )
        {
            var t = $(e.target),
                records = Array.prototype.slice.call( this.pg_precedente.columns().data() ),
                col_nome = 1;

            PointsManager.impostaModal({
                pg_ids          : records[0],
                nome_personaggi : records[col_nome],
                onSuccess       : this.puntiInviati.bind(this, t.attr("data-evid"))
            });
        },

        vaiAPaginaStampaCartellini: function ( data )
        {
            $(".modal").modal("hide");

            var pg_da_stampare = data.data.map( function( el ){ return el.personaggi_id_personaggio; } );

            window.localStorage.setItem("da_stampare",JSON.stringify( pg_da_stampare ));
            window.open( Constants.STAMPA_CARTELLINI_PAGE, "Stampa Cartellini" );
        },

        stampaCartellini: function ( )
        {
            Utils.showLoading("Scarico gli id dei personaggi iscritti...");
            Utils.requestData(
                Constants.API_GET_INFO_ISCRITTI_BASE,
                "GET",
                "draw=1&columns=&order=&start=0&length=999&search=&quando=prossimo",
                this.vaiAPaginaStampaCartellini.bind(this)
            );
        },

        vaiAPaginaStampaIscrizioni: function ( e )
        {
            var t = $(e.target);

            window.localStorage.setItem("da_stampare", t.attr("data-evid"));
            window.open( Constants.STAMPA_ISCRITTI_PAGE, "Stampa Lista Iscritti" );
        },

        setListeners: function()
        {
            $( "[data-toggle='tooltip']" ).tooltip("destroy");
            $( "[data-toggle='tooltip']" ).tooltip();

            $("#btn_visualizza_pagina_crea_evento").click( Utils.redirectTo.bind(this, Constants.CREA_EVENTO_PAGE) );
            $("#btn_pubblica").click( this.confermaPubblicaEvento.bind(this) );
            $("#btn_modifica").click( this.vaiAModificaEvento.bind(this) );
            $("#btn_ritira").click( this.confermaRitiraEvento.bind(this) );
            $("#iscrivi_pg").click( this.mostraModalIscrizione.bind(this) );
            $("#btn_modificaPG_px_personaggio").click( this.modificaPuntiAiFiltrati.bind(this) );
            $("#btn_stampaCartelliniPG").click( this.stampaCartellini.bind(this) );
            $("#btn_stampaIscrizioniPg").click( this.vaiAPaginaStampaIscrizioni.bind(this) );
        }
    };
}();

$(function () {
    LiveEventsManager.init();
});