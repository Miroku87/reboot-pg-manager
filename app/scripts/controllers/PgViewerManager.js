var PgViewerManager = function ()
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
            $( "#invia_bg" ).click( this.inviaModifichePG.bind( this, "background_personaggio", $("#testo_background") ) );
		},


        mostraTextAreaNoteMaster: function ()
		{
            $( "#avviso_note_master" ).hide();
            $( "#aggiungi_note_master" ).hide();
            $( "#note_master" ).hide();
            $( "#note_master_form" ).show();
            $( "#invia_note_master" ).click( this.inviaModifichePG.bind( this, "note_master_personaggio", $("#testo_note_master") ) );
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

            $.ajax({
                url: url,
                data: data,
                method: "POST",
                xhrFields: {
                    withCredentials: true
                },
                success: function( data )
                {
                    if ( data.status === "ok" )
                    {
                        Utils.showMessage("Elemento eliminato con successo.");
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

        mostraDati: function ()
		{
            var bin_button  = " <button type=\"button\" class=\"btn btn-xs btn-default rimuoviClassePG\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Elimina\" data-id=\"{1}\"><span class=\"fa fa-trash-o\"></span></button>",
                bin_button  = this.user_info.permessi.indexOf("rimuoviClassePG_altri") !== -1 || this.user_info.permessi.indexOf("rimuoviClassePG_proprio") !== -1 ? bin_button : "",
                professioni = this.pg_info.classi.civile.reduce( function( pre, curr ){ return ( pre ? pre + ", " : "" ) + curr.nome_classe + bin_button.replace("{1}", curr.id_classe) }, ""),
                cl_militari = this.pg_info.classi.militare.reduce( function( pre, curr ){ return ( pre ? pre + ", " : "" ) + curr.nome_classe + bin_button.replace("{1}", curr.id_classe) }, ""),
                px_percento = parseInt( ( parseInt( this.pg_info.px_risparmiati, 10 ) / this.pg_info.px_personaggio ) * 100, 10 ),
                pc_percento = parseInt( ( parseInt( this.pg_info.pc_risparmiati, 10 ) / this.pg_info.pc_personaggio ) * 100, 10 );

            $("#info_giocatore").html( this.pg_info.nome_giocatore );
            $("#info_id").html( this.pg_info.id_personaggio );
            $("#info_nome").html( this.pg_info.nome_personaggio );
            $("#info_data").html( this.pg_info.data_creazione_personaggio );
            $("#info_professioni").html( professioni );
            $("#info_militari").html( cl_militari );
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
                var azioni_abilita = $("<button type=\"button\" class=\"btn btn-xs btn-default\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Elimina\" data-id=\"" + val.id_abilita + "\"><span class=\"fa fa-trash-o\"></span></button>"),
                    tr = $("<tr></tr>");
                tr.append("<td>"+val.nome_abilita+"</td>");
                tr.append("<td>"+val.nome_classe+"</td>");
                tr.append("<td>"+val.costo_abilita+"</td>");

                if( this.user_info.permessi.indexOf("rimuoviAbilitaPG_altri") !== -1 || this.user_info.permessi.indexOf("rimuoviAbilitaPG_proprio") !== -1 )
                    $("<td></td>").appendTo(tr).append(azioni_abilita);

                $("#lista_abilita_civili").find("tbody").append(tr);

                azioni_abilita.click( this.rimuoviAbilita.bind(this) );
            }.bind(this));

            $.each( this.pg_info.abilita.militare, function ( i, val )
            {
                var azioni_abilita = $("<button type=\"button\" class=\"btn btn-xs btn-default\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Elimina\" data-id=\"" + val.id_abilita + "\"><span class=\"fa fa-trash-o\"></span></button>"),
                    tr = $("<tr></tr>");
                tr.append("<td>"+val.nome_abilita+"</td>");
                tr.append("<td>"+val.nome_classe+"</td>");
                tr.append("<td>"+val.costo_abilita+"</td>");
                tr.append("<td>"+val.distanza_abilita+"</td>");

                if( this.user_info.permessi.indexOf("rimuoviAbilitaPG_altri") !== -1 || this.user_info.permessi.indexOf("rimuoviAbilitaPG_proprio") !== -1 )
                    $("<td></td>").appendTo(tr).append(azioni_abilita);

                $("#lista_abilita_militari").find("tbody").append(tr);

                azioni_abilita.click( this.rimuoviAbilita.bind(this) );
            }.bind(this));

            if( this.pg_info.background_personaggio !== null )
            {
                $("#avviso_bg").remove();
                $("#background").text( decodeURIComponent(this.pg_info.background_personaggio) );
                $("#testo_background").val( decodeURIComponent(this.pg_info.background_personaggio) );

                if( this.user_info.permessi.indexOf("modificaPG_background_personaggio_altri") !== -1 )
                    $( "#aggiungi_bg").show();
                else
                    $( "#aggiungi_bg").hide();
            }
            else
            {
                $("#avviso_bg").show();
                $("#background").remove();
            }

            if( this.user_info.permessi.indexOf("modificaPG_note_master_personaggio_altri") !== -1 )
            {
                $("#recuperaNoteMaster").show();

                if ( this.pg_info.note_master_personaggio !== null)
                {
                    $("#avviso_note_master").remove();
                    $("#note_master").text(decodeURIComponent(this.pg_info.note_master_personaggio));
                    $("#testo_note_master").val(decodeURIComponent(this.pg_info.note_master_personaggio));
                    $("#aggiungi_note_master").show();
                }
                else
                {
                    $("#avviso_note_master").show();
                    $("#note_master").remove();
                }
            }

            $(".rimuoviClassePG").click( this.rimuoviClasse.bind( this ) );

            setTimeout(function ()
            {
                $( "[data-toggle='tooltip']" ).tooltip();
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

        vaiANegozioAbilita: function ()
        {
            window.location.href = Constants.ABILITY_SHOP_PAGE;
        },

        refreshPage: function ()
        {
            window.location.reload();
        },

        inviaModifichePG: function ( campo, elemento, e )
        {
            $(e.target).attr("disabled",true);

            var modifiche = {};
            modifiche[campo] = encodeURIComponent( elemento.val() );

            $.ajax({
                url: Constants.API_POST_EDIT_PG,
                data: {
                    pg_id: this.pg_info.id_personaggio,
                    modifiche: modifiche
                },
                method: "POST",
                xhrFields: {
                    withCredentials: true
                },
                success: function( data )
                {
                    if ( data.status === "ok" )
                    {
                        $("#messageText").html("Il campo &egrave; stato aggiornato con successo.");
                        $("#message").modal("show");
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

        recuperaRicetteCrafting: function ()
        {
            return false;

            $.ajax({
                url: Constants.API_GET_RICETTE,
                method: "GET",
                xhrFields: {
                    withCredentials: true
                },
                data: {
                    pgid : window.localStorage.getItem("pg_da_loggare")
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

        recuperaStoricoAzioni: function ()
        {
            $.ajax({
                url: Constants.API_GET_STORICO_PG,
                method: "GET",
                xhrFields: {
                    withCredentials: true
                },
                data: {
                    pgid : window.localStorage.getItem("pg_da_loggare")
                },
                success: function( data )
                {
                    if ( data.status === "ok" )
                    {
                        this.storico = data.result;
                        this.mostraStorico();
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

        faiLoginPG: function ()
        {
            $.ajax({
                url: Constants.API_GET_PG_LOGIN,
                method: "GET",
                xhrFields: {
                    withCredentials: true
                },
                data: {
                    pgid : window.localStorage.getItem("pg_da_loggare")
                },
                success: function( data )
                {
                    if ( data.status === "ok" )
                    {
                        this.pg_info = data.result;

                        var pg_no_bg = JSON.parse( JSON.stringify( this.pg_info ) );
                        delete pg_no_bg.background_personaggio;

                        window.localStorage.setItem( 'logged_pg', JSON.stringify( pg_no_bg ) );

                        this.personalizzaMenu.call( this );
                        this.mostraDati.call( this );
                    }
                    else if ( data.status === "error" )
                    {
                        $("#errorDialog").unbind("hidden.bs.modal");
                        $("#errorDialog").on("hidden.bs.modal", function ()
                        {
                            window.history.back();
                        });
                        Utils.showError( data.message );
                    }
                }.bind(this),
                error: function ( jqXHR, textStatus, errorThrown )
                {
                    Utils.showError( textStatus+"<br>"+errorThrown );
                }
            });
        },

        setListeners: function ()
        {
            $( "#mostra_form_bg" ).click( this.mostraTextAreaBG.bind(this) );
            $( "#mostra_note_master" ).click( this.mostraTextAreaNoteMaster.bind(this) );
            $( "#acquista_abilita_btn" ).click( this.vaiANegozioAbilita.bind(this) );
            $( "#message" ).on( "hidden.bs.modal", this.refreshPage.bind(this) );
        }
	}
}();

$(function () {
    PgViewerManager.init();
});