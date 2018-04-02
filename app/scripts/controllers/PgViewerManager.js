﻿var PgViewerManager = function ()
{
	return {

		init: function ()
		{
            this.user_info = JSON.parse( window.localStorage.getItem('user') );

			this.faiLoginPG();
            this.recuperaStoricoAzioni();
            this.recuperaRicetteCrafting();
			this.setListeners();
		},

        mostraTextAreaBG: function ()
		{
            $( "#avviso_bg" ).hide();
            $( "#aggiungi_bg" ).hide();
            $( "#background" ).hide();
            $( "#background_form" ).show();
            $( "#invia_bg" ).unbind( "click" );
            $( "#invia_bg" ).click( this.inviaModifichePG.bind( this, "background_personaggio", $("#testo_background") ) );
            $( "#annulla_bg" ).unbind( "click" );
            $( "#annulla_bg" ).click( this.impostaBoxBackground.bind( this ));
            Utils.setSubmitBtn();
		},


        mostraTextAreaNoteMaster: function ()
		{
            $( "#avviso_note_master" ).hide();
            $( "#aggiungi_note_master" ).hide();
            $( "#note_master" ).hide();
            $( "#note_master_form" ).show();
            $( "#invia_note_master" ).unbind("click");
            $( "#invia_note_master" ).click( this.inviaModifichePG.bind( this, "note_master_personaggio", $("#testo_note_master") ) );
            $( "#annulla_note_master" ).unbind("click");
            $( "#annulla_note_master" ).click( this.impostaBoxNoteMaster.bind( this ) );
            Utils.setSubmitBtn();
		},

        classeIsPrerequisito: function ( id_cl, el )
        {
            return el.prerequisito_classe !== null && parseInt( el.prerequisito_classe, 10 ) === id_cl;
        },

        abilitaIsPrerequisito: function ( id_ab, lista_ab, ids )
        {
            id_ab = parseInt( id_ab, 10 );
            ids   = typeof ids === "undefined" ? [] : ids;

            var new_ab     = [],
                id_cl      = parseInt( this.pg_info.abilita.civile.concat( this.pg_info.abilita.militare).filter( function( el ){ return parseInt( el.id_abilita, 10 ) === id_ab; })[0].classi_id_classe, 10 ),
                n_sup_base = lista_ab.filter( function( el ){ return el.classi_id_classe === Constants.ID_CLASSE_SUPPORTO_BASE; } ).length,
                n_sportivo = lista_ab.filter( function( el ){ return el.classi_id_classe === Constants.ID_CLASSE_SPORTIVO; } ).length,
                n_ass_base = lista_ab.filter( function( el ){ return el.classi_id_classe === Constants.ID_CLASSE_ASSALTATORE_BASE; } ).length,
                n_ass_avan = lista_ab.filter( function( el ){ return el.classi_id_classe === Constants.ID_CLASSE_ASSALTATORE_AVANZATO; } ).length,
                n_gua_base = lista_ab.filter( function( el ){ return el.classi_id_classe === Constants.ID_CLASSE_GUASTATORE_BASE; } ).length,
                n_gua_avan = lista_ab.filter( function( el ){ return el.classi_id_classe === Constants.ID_CLASSE_GUASTATORE_AVANZATO; } ).length,
                vera_lista = lista_ab.filter( function( el ){ return el.prerequisito_abilita !== null; } );

            for( var v in vera_lista )
            {
                if( typeof vera_lista[v].id_abilita === "undefined" )
                    continue;

                var ab    = vera_lista[v],
                    pre   = parseInt( ab.prerequisito_abilita, 10),
                    ab_cl = parseInt( ab.classi_id_classe, 10 );

                if (
                       pre === id_ab
                    || pre === Constants.PREREQUISITO_TUTTE_ABILITA && id_cl === ab_cl
                    || (
                           pre === Constants.PREREQUISITO_F_TERRA_T_SCELTO
                        && (
                               id_ab === Constants.ID_ABILITA_F_TERRA
                            || id_ab === Constants.ID_ABILITA_T_SCELTO
                        )
                    )
                    || pre === Constants.PREREQUISITO_5_SUPPORTO_BASE && n_sup_base - 1 < 5
                    || pre === Constants.PREREQUISITO_4_SPORTIVO && n_sportivo - 1 < 4
                    || pre === Constants.PREREQUISITO_3_ASSALTATA_BASE && n_ass_base - 1 < 3
                    || pre === Constants.PREREQUISITO_3_ASSALTATA_AVAN && n_ass_avan - 1 < 3
                    || pre === Constants.PREREQUISITO_3_GUASTATOR_BASE && n_gua_base - 1 < 3
                    || pre === Constants.PREREQUISITO_3_GUASTATO_AVAN && n_gua_avan - 1 < 3
                )
                {
                    new_ab.push( ab.id_abilita );
                    Utils.rimuoviElemDaArrayMultidimensione( lista_ab, "id_abilita", ab.id_abilita );
                }
            }

            if( new_ab.length > 0 )
            {
                for( var na in new_ab )
                    if( typeof new_ab[na] !== "function" )
                        ids = this.abilitaIsPrerequisito.call( this, new_ab[na], lista_ab, ids );
            }
    
            return new_ab.concat( ids );
        },

        eliminazioneConfermata: function ( cosa, id )
        {
            var url  = "",
                data = {};

            if( cosa === "classe" )
            {
                url  = Constants.API_DEL_CLASSE_PG;
                data = {
                    pg_id     : this.pg_info.id_personaggio,
                    id_classe : id
                };
            }
            else if ( cosa === "abilita" )
            {
                url  = Constants.API_DEL_ABILITA_PG;
                data = {
                    pg_id      : this.pg_info.id_personaggio,
                    id_abilita : id
                };
            }

            Utils.requestData(
                url,
                "POST",
                data,
                "Elemento eliminato con successo."
            );
        },

        rimuoviClasse: function ( e )
		{
            var id_classe   = $(e.currentTarget).attr("data-id"),
                t_classi    = $("#info_professioni").find(e.currentTarget).length > 0 ? this.pg_info.classi.civile:  this.pg_info.classi.militare,
                t_abilita   = $("#lista_abilita_civili").find(e.currentTarget).length > 0 ? this.pg_info.abilita.civile:  this.pg_info.abilita.militare,
                classi      = t_classi.filter( this.classeIsPrerequisito.bind( this, id_classe ) ),
                classi_id   = classi.map( function( el ){ return el.id_classe; }).concat([id_classe]),
                classi_nomi = classi.map( function( el ){ return el.nome_classe; } ),
                classi_nomi = classi_nomi.length > 0 ? classi_nomi : ["Nessuna"],
                abilita     = t_abilita.filter( function( el ){ return classi_id.indexOf( el.classi_id_classe ) !== -1; } ),
                abilita     = abilita.map( function( el ){ return el.nome_abilita; } ),
                abilita     = abilita.length > 0 ? abilita : ["Nessuna"],
                lista_cl    = "<ul><li>"+classi_nomi.join("</li><li>")+"</li></ul>",
                lista_ab    = "<ul><li>"+abilita.join("</li><li>")+"</li></ul>",
                testo       = "Cancellando questa classe verranno eliminate anche le seguenti classi:" + lista_cl +
                              "E anche le seguenti abilit&agrave;:" + lista_ab +
                              "Sicuro di voler procedere?";

            Utils.showConfirm( testo, this.eliminazioneConfermata.bind(this, "classe", id_classe) );
		},

        rimuoviAbilita: function ( e )
		{
            var id_abilita = $(e.currentTarget).attr("data-id"),
                t_abilita  = $("#lista_abilita_civili").find(e.currentTarget).length > 0 ? this.pg_info.abilita.civile:  this.pg_info.abilita.militare,
                ids        = this.abilitaIsPrerequisito.call( this, id_abilita, t_abilita.concat()),
                abilita    = t_abilita.filter( function( el ){ return ids.indexOf( el.id_abilita ) !== -1; } ),
                abilita    = abilita.map( function( el ){ return el.nome_abilita; } ),
                abilita    = abilita.length > 0 ? abilita : ["Nessuna"],
                lista      = "<ul><li>"+abilita.join("</li><li>")+"</li></ul>";

            Utils.showConfirm( "Cancellando questa abilit&agrave; anche le seguenti verranno eliminate:"+lista+"Sicuro di voler procedere?", this.eliminazioneConfermata.bind(this, "abilita", id_abilita) );
		},

        impostaBoxBackground: function ( )
		{
            $("#background_form").hide();
            $("#background").show();
            if( this.pg_info.background_personaggio !== null )
            {
                $("#avviso_bg").remove();
                $("#background").html( decodeURIComponent(this.pg_info.background_personaggio) );
                $("#testo_background").val( Utils.unStripHMTLTag( decodeURIComponent(this.pg_info.background_personaggio) ).replace("<br>","\r") );

                if( Utils.controllaPermessi( this.user_info, ["modificaPG_background_personaggio_altri"] )
                    || ( this.pg_nato_in_olocausto && !this.pg_info.motivazioni ) )
                    $( "#aggiungi_bg").show();
                else
                    $( "#aggiungi_bg").hide();
            }
            else
            {
                $( "#aggiungi_bg").show();
                $("#avviso_bg").show();
                $("#background").remove();
            }
		},

        impostaBoxNoteMaster: function ( )
		{
            if( Utils.controllaPermessi( this.user_info, ["recuperaNoteMaster_altri", "recuperaNoteMaster_proprio"] ) )
            {
                $( "#recuperaNoteMaster" ).show();
                $( "#avviso_note_master" ).show();
                $( "#aggiungi_note_master" ).show();
                $( "#note_master" ).show();
                $( "#note_master_form" ).hide();

                if ( this.pg_info.note_master_personaggio !== null)
                {
                    $("#avviso_note_master").remove();
                    $("#note_master").html(decodeURIComponent(this.pg_info.note_master_personaggio));
                    $("#testo_note_master").val( Utils.unStripHMTLTag( decodeURIComponent(this.pg_info.note_master_personaggio) ).replace("<br>","\r") );
                    $("#aggiungi_note_master").show();
                }
                else
                {
                    $("#avviso_note_master").show();
                    $("#note_master").remove();
                }
            }
		},

        mostraDati: function ()
		{
            var bin_button  = " <button type=\"button\" " +
                                        "class=\"btn btn-xs btn-default inizialmente-nascosto rimuoviClassePG\" " +
                                        "data-toggle=\"tooltip\" " +
                                        "data-placement=\"top\" " +
                                        "title=\"Elimina\" " +
                                        "data-id=\"{1}\"><span class=\"fa fa-trash-o\"></span></button>",
                professioni = this.pg_info.classi.civile.reduce( function( pre, curr ){ return ( pre ? pre + "<br>" : "" ) + curr.nome_classe + bin_button.replace("{1}", curr.id_classe) }, ""),
                cl_militari = this.pg_info.classi.militare.reduce( function( pre, curr ){ return ( pre ? pre + "<br>" : "" ) + curr.nome_classe + bin_button.replace("{1}", curr.id_classe) }, ""),
                px_percento = parseInt( ( parseInt( this.pg_info.px_risparmiati, 10 ) / this.pg_info.px_personaggio ) * 100, 10 ),
                pc_percento = parseInt( ( parseInt( this.pg_info.pc_risparmiati, 10 ) / this.pg_info.pc_personaggio ) * 100, 10 );

            $("#info_giocatore").html( this.pg_info.nome_giocatore_completo );
            $("#info_id").html( this.pg_info.id_personaggio );
            $("#info_nome").html( this.pg_info.nome_personaggio );
            $("#info_data").html( this.pg_info.data_creazione_personaggio );
            $("#info_nascita").html( this.pg_info.anno_nascita_personaggio );
            $("#info_professioni").html( professioni );
            $("#info_militari").html( cl_militari );
            $("#info_pf").html( this.pg_info.pf_personaggio );
            $("#info_dm").html( this.pg_info.mente_personaggio );
            $("#info_ps").html( this.pg_info.shield_personaggio );
            $("#info_credito").html( this.pg_info.credito_personaggio );

            $("#px_risparmiati").html( this.pg_info.px_risparmiati );
            $("#px_tot").html( this.pg_info.px_personaggio );
            $("#px_bar").css({"width": px_percento+"%"});

            $("#pc_risparmiati").html( this.pg_info.pc_risparmiati );
            $("#pc_tot").html( this.pg_info.pc_personaggio );
            $("#pc_bar").css({"width": pc_percento+"%"});

            if( this.user_info.permessi.indexOf("rimuoviAbilitaPG_altri") === -1 && this.user_info.permessi.indexOf("rimuoviAbilitaPG_proprio") === -1 )
            {
                $("#lista_abilita_civili").find("tr > th:last-child").remove();
                $("#lista_abilita_militari").find("tr > th:last-child").remove();
            }

            $.each( this.pg_info.abilita.civile, function ( i, val )
            {
                var azioni_abilita = $("<button type=\"button\" " +
                                                "class=\"btn btn-xs btn-default inizialmente-nascosto rimuoviAbilitaPG\" " +
                                                "data-toggle=\"tooltip\" " +
                                                "data-placement=\"top\" " +
                                                "title=\"Elimina\" " +
                                                "data-id=\"" + val.id_abilita + "\"><span class=\"fa fa-trash-o\"></span></button>"),
                    tr = $("<tr></tr>");
                tr.append("<td>"+val.nome_abilita+"</td>");
                tr.append("<td>"+val.nome_classe+"</td>");
                tr.append("<td>"+val.costo_abilita+"</td>");
                $("<td class='inizialmente-nascosto rimuoviAbilitaPG'></td>").appendTo(tr).append(azioni_abilita);

                $("#lista_abilita_civili").find("tbody").append(tr);

                azioni_abilita.click( this.rimuoviAbilita.bind(this) );
            }.bind(this));

            $.each( this.pg_info.abilita.militare, function ( i, val )
            {
                var azioni_abilita = $("<button type=\"button\" " +
                                               "class=\"btn btn-xs btn-default inizialmente-nascosto rimuoviAbilitaPG\" " +
                                               "data-toggle=\"tooltip\" " +
                                               "data-placement=\"top\" " +
                                               "title=\"Elimina\" " +
                                               "data-id=\"" + val.id_abilita + "\"><span class=\"fa fa-trash-o\"></span></button>"),
                    tr = $("<tr></tr>");
                tr.append("<td>"+val.nome_abilita+"</td>");
                tr.append("<td>"+val.nome_classe+"</td>");
                tr.append("<td>"+val.costo_abilita+"</td>");
                tr.append("<td>"+val.distanza_abilita+"</td>");
                tr.append("<td>"+val.effetto_abilita+"</td>");
                $("<td class='inizialmente-nascosto rimuoviAbilitaPG'></td>").appendTo(tr).append(azioni_abilita);

                $("#lista_abilita_militari").find("tbody").append(tr);

                azioni_abilita.click( this.rimuoviAbilita.bind(this) );
            }.bind(this));

            for( var o in this.pg_info.opzioni )
            {
                var val = this.pg_info.opzioni[o],
                    tr = $("<tr></tr>");

                tr.append("<td>"+val.nome_abilita+"</td>");
                tr.append("<td>"+val.opzione+"</td>");

                $("#lista_opzioni_abilita").find("tbody").append(tr);
            }

            this.impostaBoxBackground();
            this.impostaBoxNoteMaster();

            $(".rimuoviClassePG").click( this.rimuoviClasse.bind( this ) );

            setTimeout(function ()
            {
                $( "[data-toggle='tooltip']" ).tooltip();
                Utils.setSubmitBtn();
                AdminLTEManager.controllaPermessi();
            }, 100);
		},

        mostraStorico: function ()
        {
            $.each( this.storico, function ()
            {
                var tr = $("<tr></tr>"),
                    vecchio_val = $("<td></td>").text(decodeURIComponent(this.valore_vecchio_azione)),
                    nuovo_val = $("<td></td>").text(decodeURIComponent(this.valore_nuovo_azione));

                tr.append("<td>"+this.nome_giocatore+"</td>");
                tr.append("<td>"+this.data_azione+"</td>");
                tr.append("<td>"+this.tipo_azione+"</td>");
                tr.append("<td>"+this.tabella_azione+"</td>");
                tr.append("<td>"+this.campo_azione+"</td>");
                tr.append(vecchio_val);
                tr.append(nuovo_val);
                $( "#recuperaStorico" ).find("tbody").append(tr);
            });
            $( "#recuperaStorico").show();
        },

        mostraRicette: function ()
        {
            $( "#ricettePersonaggio").show();
        },

        personalizzaMenu: function ()
        {
            if( this.pg_info )
            {
                if( this.pg_info.crafting_chimico )
                    $( "#btn_crafting_chimico" ).show();
                if( this.pg_info.crafting_programmazione )
                    $( "#btn_crafting_programmazione" ).show();
                if( this.pg_info.crafting_ingegneria )
                    $( "#btn_crafting_ingegneria" ).show();

                $("#nome_personaggio").text( this.pg_info.nome_personaggio );
            }
        },

        modificaPuntiPG: function ( )
        {
            PointsManager.impostaModal({
                pg_ids          : [ this.pg_info.id_personaggio ],
                nome_personaggi : [ this.pg_info.nome_personaggio ],
                onSuccess       : Utils.reloadPage
            });
        },

        modificaCreditoPG: function ( )
        {
            CreditManager.impostaModal({
                pg_ids          : [ this.pg_info.id_personaggio ],
                nome_personaggi : [ this.pg_info.nome_personaggio ],
                onSuccess       : Utils.reloadPage
            });
        },

        inviaModifichePG: function ( campo, elemento, e )
        {
            var data = { pgid: this.pg_info.id_personaggio, modifiche : {} };
            data.modifiche[campo] = encodeURIComponent( Utils.stripHMTLTag( elemento.val() ).replace(/\n/g,"<br>") );

            if( campo === "background_personaggio" && this.pg_nato_in_olocausto && !this.pg_info.motivazioni )
                data.modifiche.motivazioni_olocausto_inserite_personaggio = 1;

            Utils.requestData(
                Constants.API_POST_EDIT_PG,
                "POST",
                data,
                "Il campo &egrave; stato aggiornato con successo.",
                null,
                Utils.reloadPage
            );
        },

        recuperaRicetteCrafting: function ()
        {
            return false;
            //TODO
            var data = { pgid : window.localStorage.getItem("pg_da_loggare") };

            Utils.requestData(
                Constants.API_GET_RICETTE,
                "GET",
                data,
                function( data )
                {
                    this.mostraRicette( data.result );
                }.bind(this)
            );
        },

        recuperaStoricoAzioni: function ()
        {
            if( this.user_info.permessi.filter(function( el ) { return el.indexOf("recuperaStorico") !== -1 } ).length > 0 )
            {
                var data = {pgid : window.localStorage.getItem("pg_da_loggare")};

                Utils.requestData(
                    Constants.API_GET_STORICO_PG,
                    "GET",
                    data,
                    function (data)
                    {
                        this.storico = data.result;
                        this.mostraStorico();
                    }.bind(this)
                );
            }
        },

        controllaMotivazioniOlocausto: function ()
        {
            this.pg_info.anno_nascita_personaggio = parseInt(this.pg_info.anno_nascita_personaggio,10);
            this.pg_info.motivazioni              = this.pg_info.motivazioni === "1" ? true : false;
            this.pg_nato_in_olocausto             = this.pg_info.anno_nascita_personaggio >= Constants.ANNO_INIZIO_OLOCAUSTO
                                                    && this.pg_info.anno_nascita_personaggio <= Constants.ANNO_FINE_OLOCAUSTO;

            if( this.pg_nato_in_olocausto && !this.pg_info.motivazioni )
                Utils.showMessage("Caro Giocatore,<br>" +
                    "ci siamo accorti che il personaggio che stai visualizzando &egrave; nato durante l'<strong>Olocausto dell'Innocenza</strong>.<br>" +
                    "Ci servirebbe che aggiungessi nel Background come lui/lei ha fatto a sopravvivere alla disgrazia.<br>" +
                    "Vai nell'apposita sezione e clicca il pulsante 'Modifica Background'.<br>" +
                    "Grazie, lo Staff!");
        },

        faiLoginPG: function ()
        {
            var dati = { pgid : window.localStorage.getItem("pg_da_loggare") };

            Utils.requestData(
                Constants.API_GET_PG_LOGIN,
                "GET",
                dati,
                function( data )
                {
                    this.pg_info = data.result;

                    var pg_no_bg = JSON.parse( JSON.stringify( this.pg_info ) );
                    delete pg_no_bg.background_personaggio;

                    window.localStorage.setItem( 'logged_pg', JSON.stringify( pg_no_bg ) );

                    this.controllaMotivazioniOlocausto( );
                    this.personalizzaMenu(  );
                    this.mostraDati(  );

                    AdminLTEManager.controllaMessaggi();
                }.bind(this),
                null,
                null,
                window.history.back
            );
        },

        setListeners: function ()
        {
            $( "#mostra_form_bg" ).click( this.mostraTextAreaBG.bind(this) );
            $( "#mostra_note_master" ).click( this.mostraTextAreaNoteMaster.bind(this) );
            $( "#btn_aggiungiAbilitaAlPG" ).click( Utils.redirectTo.bind(this,Constants.ABILITY_SHOP_PAGE) );
            $( "#btn_modificaPG_px_personaggio" ).click( this.modificaPuntiPG.bind(this) );
            $( "#btn_modificaPG_credito_personaggio" ).click( this.modificaCreditoPG.bind(this) );
            //$( "#message" ).on( "hidden.bs.modal", Utils.reloadPage );
        }
	}
}();

$(function () {
    PgViewerManager.init();
});