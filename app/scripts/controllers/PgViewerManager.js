var PgViewerManager = function ()
{
    return {

        init : function ()
        {
            this.user_info = JSON.parse(window.localStorage.getItem('user'));

            this.faiLoginPG();
            this.recuperaStoricoAzioni();
            this.setListeners();
        },

        mostraTextAreaBG : function ()
        {
            $("#avviso_bg").hide();
            $("#aggiungi_bg").hide();
            $("#background").hide();
            $("#background_form").show();
            $("#invia_bg").unbind("click");
            $("#invia_bg").click(this.inviaModifichePG.bind(this, "background_personaggio", $("#testo_background")));
            $("#annulla_bg").unbind("click");
            $("#annulla_bg").click(this.impostaBoxBackground.bind(this));
            Utils.setSubmitBtn();
        },

        mostraTextAreaNoteMaster : function ()
        {
            $("#avviso_note_master").hide();
            $("#aggiungi_note_master").hide();
            $("#note_master").hide();
            $("#note_master_form").show();
            $("#invia_note_master").unbind("click");
            $("#invia_note_master")
                .click(this.inviaModifichePG.bind(this, "note_master_personaggio", $("#testo_note_master")));
            $("#annulla_note_master").unbind("click");
            $("#annulla_note_master").click(this.impostaBoxNoteMaster.bind(this));
            Utils.setSubmitBtn();
        },
    
        mostraTextAreaNoteCartellino : function ()
        {
            $("#avviso_note_cartellino").hide();
            $("#aggiungi_note_cartellino").hide();
            $("#note_cartellino").hide();
            $("#note_cartellino_form").show();
            $("#invia_note_cartellino").unbind("click");
            $("#invia_note_cartellino")
                .click(this.inviaModifichePG.bind(this, "note_cartellino_personaggio", $("#testo_note_cartellino")));
            $("#annulla_note_cartellino").unbind("click");
            $("#annulla_note_cartellino").click(this.impostaNoteCartellino.bind(this));
            Utils.setSubmitBtn();
        },

        classeIsPrerequisito : function (id_cl, el)
        {
            return el.prerequisito_classe !== null && parseInt(el.prerequisito_classe, 10) === id_cl;
        },

        abilitaIsPrerequisito : function (id_ab, lista_ab, ids)
        {
            id_ab = parseInt(id_ab, 10);
            ids = typeof ids === "undefined" ? [] : ids;

            var new_ab = [],
                id_cl = parseInt(this.pg_info.abilita.civile.concat(this.pg_info.abilita.militare).filter(function (el)
                {
                    return parseInt(el.id_abilita, 10) === id_ab;
                })[0].classi_id_classe, 10),
                n_sup_base = lista_ab.filter(function (el)
                {
                    return el.classi_id_classe === Constants.ID_CLASSE_SUPPORTO_BASE;
                }).length,
                n_sportivo = lista_ab.filter(function (el)
                {
                    return el.classi_id_classe === Constants.ID_CLASSE_SPORTIVO;
                }).length,
                n_ass_base = lista_ab.filter(function (el)
                {
                    return el.classi_id_classe === Constants.ID_CLASSE_ASSALTATORE_BASE;
                }).length,
                n_ass_avan = lista_ab.filter(function (el)
                {
                    return el.classi_id_classe === Constants.ID_CLASSE_ASSALTATORE_AVANZATO;
                }).length,
                n_gua_base = lista_ab.filter(function (el)
                {
                    return el.classi_id_classe === Constants.ID_CLASSE_GUASTATORE_BASE;
                }).length,
                n_gua_avan = lista_ab.filter(function (el)
                {
                    return el.classi_id_classe === Constants.ID_CLASSE_GUASTATORE_AVANZATO;
                }).length,
                vera_lista = lista_ab.filter(function (el)
                {
                    return el.prerequisito_abilita !== null;
                });

            for (var v in vera_lista)
            {
                if (typeof vera_lista[v].id_abilita === "undefined")
                    continue;

                var ab = vera_lista[v],
                    pre = parseInt(ab.prerequisito_abilita, 10),
                    ab_cl = parseInt(ab.classi_id_classe, 10);

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
                    new_ab.push(ab.id_abilita);
                    Utils.rimuoviElemDaArrayMultidimensione(lista_ab, "id_abilita", ab.id_abilita);
                }
            }

            if (new_ab.length > 0)
            {
                for (var na in new_ab)
                    if (typeof new_ab[na] !== "function")
                        ids = this.abilitaIsPrerequisito.call(this, new_ab[na], lista_ab, ids);
            }

            return new_ab.concat(ids);
        },

        eliminazioneConfermata : function (cosa, id)
        {
            var url = "",
                data = {};

            if (cosa === "classe")
            {
                url = Constants.API_DEL_CLASSE_PG;
                data = {
                    pg_id : this.pg_info.id_personaggio,
                    id_classe : id
                };
            }
            else if (cosa === "abilita")
            {
                url = Constants.API_DEL_ABILITA_PG;
                data = {
                    pg_id : this.pg_info.id_personaggio,
                    id_abilita : id
                };
            }

            Utils.requestData(
                url,
                "POST",
                data,
                "Elemento eliminato con successo.",
                null,
                Utils.reloadPage
            );
        },

        rimuoviClasse : function (e)
        {
            var id_classe = $(e.currentTarget).attr("data-id"),
                t_classi = $("#info_professioni")
                    .find(e.currentTarget).length > 0 ? this.pg_info.classi.civile : this.pg_info.classi.militare,
                t_abilita = $("#lista_abilita_civili")
                    .find(e.currentTarget).length > 0 ? this.pg_info.abilita.civile : this.pg_info.abilita.militare,
                classi = t_classi.filter(this.classeIsPrerequisito.bind(this, id_classe)),
                classi_id = classi.map(function (el)
                {
                    return el.id_classe;
                }).concat([id_classe]),
                classi_nomi = classi.map(function (el)
                {
                    return el.nome_classe;
                }),
                classi_nomi = classi_nomi.length > 0 ? classi_nomi : ["Nessuna"],
                abilita = t_abilita.filter(function (el)
                {
                    return classi_id.indexOf(el.classi_id_classe) !== -1;
                }),
                abilita = abilita.map(function (el)
                {
                    return el.nome_abilita;
                }),
                abilita = abilita.length > 0 ? abilita : ["Nessuna"],
                lista_cl = "<ul><li>" + classi_nomi.join("</li><li>") + "</li></ul>",
                lista_ab = "<ul><li>" + abilita.join("</li><li>") + "</li></ul>",
                testo = "Cancellando questa classe verranno eliminate anche le seguenti classi:" + lista_cl +
                    "E anche le seguenti abilit&agrave;:" + lista_ab +
                    "Sicuro di voler procedere?";

            Utils.showConfirm(testo, this.eliminazioneConfermata.bind(this, "classe", id_classe));
        },

        rimuoviAbilita : function (e)
        {
            var id_abilita = $(e.currentTarget).attr("data-id"),
                t_abilita = $("#lista_abilita_civili")
                    .find(e.currentTarget).length > 0 ? this.pg_info.abilita.civile : this.pg_info.abilita.militare,
                ids = this.abilitaIsPrerequisito.call(this, id_abilita, t_abilita.concat()),
                abilita = t_abilita.filter(function (el)
                {
                    return ids.indexOf(el.id_abilita) !== -1;
                }),
                abilita = abilita.map(function (el)
                {
                    return el.nome_abilita;
                }),
                abilita = abilita.length > 0 ? abilita : ["Nessuna"],
                lista = "<ul><li>" + abilita.join("</li><li>") + "</li></ul>";

            Utils.showConfirm("Cancellando questa abilit&agrave; anche le seguenti verranno eliminate:" + lista + "Sicuro di voler procedere?", this.eliminazioneConfermata.bind(this, "abilita", id_abilita));
        },

        impostaBoxBackground : function ()
        {
            $("#background_form").hide();
            $("#background").show();
            if (this.pg_info.background_personaggio !== null)
            {
                $("#avviso_bg").remove();
                $("#background").html(decodeURIComponent(this.pg_info.background_personaggio));
                $("#testo_background")
                    .val(Utils.unStripHMTLTag(decodeURIComponent(this.pg_info.background_personaggio))
                              .replace(/<br>/g, "\r"));

                if ( Utils.controllaPermessiUtente( this.user_info, ["modificaPG_background_personaggio_altri"] )
                    || ( this.pg_nato_in_olocausto && !this.pg_info.motivazioni ) )
                    $("#aggiungi_bg").show();
                else
                    $("#aggiungi_bg").hide();
            }
            else
            {
                $("#aggiungi_bg").show();
                $("#avviso_bg").show();
                $("#background").remove();
            }
        },

        impostaBoxNoteMaster : function ()
        {
            if (Utils.controllaPermessiUtente(this.user_info, ["recuperaNoteMaster_altri", "recuperaNoteMaster_proprio"]))
            {
                $("#recuperaNoteMaster").show();
                $("#avviso_note_master").show();
                $("#aggiungi_note_master").show();
                $("#note_master").show();
                $("#note_master_form").hide();

                if (this.pg_info.note_master_personaggio !== null)
                {
                    $("#avviso_note_master").remove();
                    $("#note_master").html(decodeURIComponent(this.pg_info.note_master_personaggio));
                    $("#testo_note_master")
                        .val(Utils.unStripHMTLTag(decodeURIComponent(this.pg_info.note_master_personaggio))
                                  .replace(/<br>/g, "\r"));
                    $("#aggiungi_note_master").show();
                }
                else
                {
                    $("#avviso_note_master").show();
                    $("#note_master").remove();
                }
            }
        },
    
        impostaNoteCartellino : function (data)
        {
            if ( typeof data.result !== "undefined" )
                this.note_cartellino = data.result || null;

            $("#recuperaNoteCartellino").show();
            $("#avviso_note_cartellino").show();
            $("#aggiungi_note_cartellino").show();
            $("#note_cartellino").show();
            $("#note_cartellino_form").hide();

            if (this.note_cartellino !== null)
            {
                $("#avviso_note_cartellino").remove();
                $("#note_cartellino").html(decodeURIComponent(this.note_cartellino));
                $("#testo_note_cartellino")
                    .val(Utils.unStripHMTLTag(decodeURIComponent(this.note_cartellino))
                              .replace(/<br>/g, "\r"));
                $("#aggiungi_note_cartellino").show();
            }
            else
            {
                $("#avviso_note_cartellino").show();
                $("#note_cartellino").remove();
            }
        },

        mostraDati : function ()
        {
            var bin_button = " <button type=\"button\" " +
                    "class=\"btn btn-xs btn-default inizialmente-nascosto rimuoviClassePG\" " +
                    "data-toggle=\"tooltip\" " +
                    "data-placement=\"top\" " +
                    "title=\"Elimina\" " +
                    "data-id=\"{1}\"><span class=\"fa fa-trash-o\"></span></button>",
                professioni = this.pg_info.classi.civile.reduce(function (pre, curr)
                {
                    return ( pre ? pre + "<br>" : "" ) + curr.nome_classe + bin_button.replace("{1}", curr.id_classe)
                }, ""),
                cl_militari = this.pg_info.classi.militare.reduce(function (pre, curr)
                {
                    return ( pre ? pre + "<br>" : "" ) + curr.nome_classe + bin_button.replace("{1}", curr.id_classe)
                }, ""),
                px_percento = parseInt(( parseInt(this.pg_info.px_risparmiati, 10) / this.pg_info.px_personaggio ) * 100, 10),
                pc_percento = parseInt(( parseInt(this.pg_info.pc_risparmiati, 10) / this.pg_info.pc_personaggio ) * 100, 10);

            $("#info_giocatore").html(this.pg_info.nome_giocatore_completo);
            $("#info_id").html(this.pg_info.id_personaggio);
            $("#info_nome").html(this.pg_info.nome_personaggio);
            $("#info_data").html(this.pg_info.data_creazione_personaggio);
            $("#info_nascita").html(this.pg_info.anno_nascita_personaggio);
            $("#info_professioni").html(professioni);
            $("#info_militari").html(cl_militari);
            $("#info_pf").html(this.pg_info.pf_personaggio);
            $("#info_dm").html(this.pg_info.mente_personaggio);
            $("#info_ps").html(this.pg_info.shield_personaggio);
            $("#info_credito").html(this.pg_info.credito_personaggio);

            $("#px_risparmiati").html(this.pg_info.px_risparmiati);
            $("#px_tot").html(this.pg_info.px_personaggio);
            $("#px_bar").css({"width" : px_percento + "%"});

            $("#pc_risparmiati").html(this.pg_info.pc_risparmiati);
            $("#pc_tot").html(this.pg_info.pc_personaggio);
            $("#pc_bar").css({"width" : pc_percento + "%"});

            if (this.user_info.permessi.indexOf("rimuoviAbilitaPG_altri") === -1 && this.user_info.permessi.indexOf("rimuoviAbilitaPG_proprio") === -1)
            {
                $("#lista_abilita_civili").find("tr > th:last-child").remove();
                $("#lista_abilita_militari").find("tr > th:last-child").remove();
            }

            $.each(this.pg_info.abilita.civile, function (i, val)
            {
                var azioni_abilita = $("<button type=\"button\" " +
                        "class=\"btn btn-xs btn-default inizialmente-nascosto rimuoviAbilitaPG\" " +
                        "data-toggle=\"tooltip\" " +
                        "data-placement=\"top\" " +
                        "title=\"Elimina\" " +
                        "data-id=\"" + val.id_abilita + "\"><span class=\"fa fa-trash-o\"></span></button>"),
                    tr = $("<tr></tr>");
                tr.append("<td>" + val.nome_abilita + "</td>");
                tr.append("<td>" + val.nome_classe + "</td>");
                tr.append("<td>" + val.costo_abilita + "</td>");
                $("<td class='inizialmente-nascosto rimuoviAbilitaPG'></td>").appendTo(tr).append(azioni_abilita);

                $("#lista_abilita_civili").find("tbody").append(tr);

                azioni_abilita.click(this.rimuoviAbilita.bind(this));
            }.bind(this));

            $.each(this.pg_info.abilita.militare, function (i, val)
            {
                var azioni_abilita = $("<button type=\"button\" " +
                        "class=\"btn btn-xs btn-default inizialmente-nascosto rimuoviAbilitaPG\" " +
                        "data-toggle=\"tooltip\" " +
                        "data-placement=\"top\" " +
                        "title=\"Elimina\" " +
                        "data-id=\"" + val.id_abilita + "\"><span class=\"fa fa-trash-o\"></span></button>"),
                    tr = $("<tr></tr>");
                tr.append("<td>" + val.nome_abilita + "</td>");
                tr.append("<td>" + val.nome_classe + "</td>");
                tr.append("<td>" + val.costo_abilita + "</td>");
                tr.append("<td>" + val.distanza_abilita + "</td>");
                tr.append("<td>" + val.effetto_abilita + "</td>");
                $("<td class='inizialmente-nascosto rimuoviAbilitaPG'></td>").appendTo(tr).append(azioni_abilita);

                $("#lista_abilita_militari").find("tbody").append(tr);

                azioni_abilita.click(this.rimuoviAbilita.bind(this));
            }.bind(this));

            if (this.pg_info.opzioni && Object.keys(this.pg_info.opzioni).length > 0)
            {
                for (var o in this.pg_info.opzioni)
                {
                    var val = this.pg_info.opzioni[o],
                        tr = $("<tr></tr>");

                    tr.append("<td>" + val.nome_abilita + "</td>");
                    tr.append("<td>" + val.opzione + "</td>");

                    $("#lista_opzioni_abilita").find("tbody").append(tr);
                }
                $("#sezione_opzioni_abilita").removeClass("inizialmente-nascosto").show();
            }

            this.impostaBoxBackground();
            this.impostaBoxNoteMaster();

            $(".rimuoviClassePG").click(this.rimuoviClasse.bind(this));

            setTimeout(function ()
            {
                $("[data-toggle='tooltip']").tooltip();
                Utils.setSubmitBtn();
                AdminLTEManager.controllaPermessi();
                AdminLTEManager.controllaPermessi(".sidebar-menu", true);
            }.bind(this), 100);
        },

        mostraStorico : function ()
        {
            $.each(this.storico, function ()
            {
                var tr = $("<tr></tr>"),
                    vecchio_val = decodeURIComponent(this.valore_vecchio_azione),
                    nuovo_val = decodeURIComponent(this.valore_nuovo_azione),
                    vecchio_td = $("<td></td>"),
                    nuovo_td = $("<td></td>");

                if (vecchio_val.length > 50)
                {
                    var plus = $("<i class='fa fa-plus-circle'></i>");
                    plus.popover({
                        container : "body",
                        placement : "left",
                        trigger : Utils.isDeviceMobile() ? "click" : "hover",
                        content : vecchio_val
                    });

                    vecchio_td.text(vecchio_val.substr(0, 50) + "...");
                    vecchio_td.append(plus);
                }
                else
                    vecchio_td.text(vecchio_val);

                if (nuovo_val.length > 50)
                {
                    var plus = $("<i class='fa fa-plus-circle'></i>");
                    plus.popover({
                        container : "body",
                        placement : "left",
                        trigger : Utils.isDeviceMobile() ? "click" : "hover",
                        content : nuovo_val
                    });

                    nuovo_td.text(nuovo_val.substr(0, 50) + "...");
                    nuovo_td.append(plus);
                }
                else
                    nuovo_td.text(nuovo_val);

                tr.append("<td>" + this.nome_giocatore + "</td>");
                tr.append("<td>" + this.data_azione + "</td>");
                tr.append("<td>" + this.tipo_azione + "</td>");
                tr.append("<td>" + this.tabella_azione + "</td>");
                tr.append("<td>" + this.campo_azione + "</td>");
                tr.append(vecchio_td);
                tr.append(nuovo_td);
                $("#recuperaStorico").find("tbody").append(tr);
            });
            $("#recuperaStorico").removeClass("inizialmente-nascosto");
            $("#recuperaStorico").show();
        },

        modificaPuntiPG : function ()
        {
            PointsManager.impostaModal({
                pg_ids : [this.pg_info.id_personaggio],
                nome_personaggi : [this.pg_info.nome_personaggio],
                onSuccess : Utils.reloadPage
            });
        },

        modificaCreditoPG : function ()
        {
            CreditManager.impostaModal({
                pg_ids : [this.pg_info.id_personaggio],
                nome_personaggi : [this.pg_info.nome_personaggio],
                onSuccess : Utils.reloadPage
            });
        },

        inviaModifichePG : function (campo, elemento, e)
        {
            var data = {pgid : this.pg_info.id_personaggio, modifiche : {}};
            data.modifiche[campo] = encodeURIComponent(Utils.stripHMTLTag(elemento.val()).replace(/\n/g, "<br>"));

            if (campo === "background_personaggio" && this.pg_nato_in_olocausto && !this.pg_info.motivazioni)
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

        inviaModificheRicetta: function ( id_ricetta )
        {
            var note   = encodeURIComponent( Utils.stripHMTLTag( $("#modal_modifica_ricetta").find("#note_pg_ricetta").val()).replace(/\n/g,"<br>") ),
                dati   = {
                    id : id_ricetta,
                    modifiche: {
                        note_pg_ricetta: note
                    }
                };

            if($("#new_nome_ricetta").is(":visible") && $("#new_nome_ricetta").val() !== "")
                dati.modifiche.nome_ricetta = $("#new_nome_ricetta").val();

            Utils.requestData(
                Constants.API_EDIT_RICETTA,
                "POST",
                dati,
                "Modifiche apportate con successo",
                null,
                this.recipes_grid.ajax.reload.bind(this,null,false)
            );
        },

        mostraModalRicetta: function ( e )
        {
            var t     = $(e.target),
                dati  = this.recipes_grid.row( t.parents('tr') ).data(),
                note  = Utils.unStripHMTLTag( decodeURIComponent( dati.note_pg_ricetta )).replace(/<br>/g,"\r"),
                note  = note === "null" ? "" : note,
                comps = "<li>"+dati.componenti_ricetta.split("@@").join("</li><li>")+"</li>";

            if( dati.tipo_ricetta === "Programmazione" )
                $("#modal_modifica_ricetta").find("#new_nome_ricetta").parents(".form-group").removeClass("inizialmente-nascosto");

            $("#modal_modifica_ricetta").find("#nome_ricetta").text(dati.nome_ricetta);
            $("#modal_modifica_ricetta").find("#new_nome_ricetta").val(dati.nome_ricetta);
            $("#modal_modifica_ricetta").find("#lista_componenti").html(comps);
            $("#modal_modifica_ricetta").find("#note_ricetta").val(note);

            $("#modal_modifica_ricetta").find("#btn_invia_modifiche_ricetta").unbind("click");
            $("#modal_modifica_ricetta").find("#btn_invia_modifiche_ricetta").click(this.inviaModificheRicetta.bind(this,dati.id_ricetta));
            $("#modal_modifica_ricetta").modal({drop:"static"});
        },

        setGridListeners: function ()
        {
            AdminLTEManager.controllaPermessi();

            $( "td [data-toggle='popover']" ).popover("destroy");
            $( "td [data-toggle='popover']" ).popover();

            $( "[data-toggle='tooltip']" ).tooltip();

            $("button.modifica-note").unbind( "click", this.mostraModalRicetta.bind(this) );
            $("button.modifica-note").click( this.mostraModalRicetta.bind(this) );
        },

        erroreDataTable: function ( e, settings )
        {
            if( !settings.jqXHR.responseText )
                return false;

            var real_error = settings.jqXHR.responseText.replace(/^([\S\s]*?)\{"[\S\s]*/i,"$1");
            real_error = real_error.replace("\n","<br>");
            Utils.showError(real_error);
        },

        renderComps: function ( data, type, row )
        {
            var ret = data.split("@@").join("<br>");

            return $.fn.dataTable.render.ellipsis( 20, true, false )(ret, type, row);
        },

        renderNote: function ( data, type, row )
        {
            var denc_data = Utils.unStripHMTLTag( decodeURIComponent(data) );
            denc_data = denc_data === "null" ? "" : denc_data;

            return $.fn.dataTable.render.ellipsis( 20, false, true, true )(denc_data, type, row);
        },

        renderApprovato: function ( data, type, row )
        {
            var ret = "In elaborazione...",
                data = parseInt(data);

            if( data === -1 )
                ret = "Rifiutato";
            else if ( data === 1 )
                ret = "Approvato";

            return ret;
        },

        creaPulsantiAzioni: function (data, type, row)
        {
            var pulsanti = "";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default modifica-note ' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Modifica Note'><i class='fa fa-pencil'></i></button>";

            return pulsanti;
        },

        recuperaRicetteCrafting : function ()
        {
            if( this.pg_info.num_ricette === 0 )
                return false;

            var columns = [];

            columns.push({
                title: "Data Creazione",
                data : "data_inserimento_it"
            });
            columns.push({
                title: "Nome Ricetta",
                data : "nome_ricetta"
            });
            columns.push({
                title: "Tipo",
                data : "tipo_ricetta"
            });
            columns.push({
                title: "Componenti",
                data : "componenti_ricetta",
                render: this.renderComps.bind(this)
            });
            columns.push({
                title: "Approvata",
                data : "approvata_ricetta",
                render: this.renderApprovato.bind(this)
            });
            columns.push({
                title: "Note",
                data : "note_pg_ricetta",
                render: this.renderNote.bind(this)
            });
            columns.push({
                title: "Azioni",
                render: this.creaPulsantiAzioni.bind(this)
            });

            this.recipes_grid = $( '#griglia_ricette' )
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
                            Constants.API_GET_RICETTE,
                            "GET",
                            $.extend( data, { pgid: window.localStorage.getItem("pg_da_loggare") } ),
                            callback
                        );
                    },
                    columns    : columns,
                    //lengthMenu: [ 5, 10, 25, 50, 75, 100 ],
                    order      : [[0, 'desc']]
                } );

            $("#griglia_ricette").parents(".row").removeClass("inizialmente-nascosto");
            $("#griglia_ricette").parents(".row").show();
        },

        recuperaNoteCartellino : function ()
        {
            if ( Utils.controllaPermessiUtente( this.user_info, ["recuperaNoteCartellino_altri","recuperaNoteCartellino_proprio"], false ) )
            {
                var data = { pgid : this.pg_info.id_personaggio };

                Utils.requestData(
                    Constants.API_GET_NOTE_CARTELLINO_PG,
                    "GET",
                    data,
                    this.impostaNoteCartellino.bind(this)
                );
            }
        },

        recuperaStoricoAzioni : function ()
        {
            if (this.user_info.permessi.filter(function (el)
                {
                    return el.indexOf("recuperaStorico") !== -1
                }).length > 0)
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

        controllaMotivazioniOlocausto : function ()
        {
            this.pg_info.anno_nascita_personaggio = parseInt(this.pg_info.anno_nascita_personaggio, 10);
            this.pg_info.motivazioni = this.pg_info.motivazioni === "1" ? true : false;
            this.pg_nato_in_olocausto = this.pg_info.anno_nascita_personaggio >= Constants.ANNO_INIZIO_OLOCAUSTO
                && this.pg_info.anno_nascita_personaggio <= Constants.ANNO_FINE_OLOCAUSTO;

            if (this.pg_nato_in_olocausto && !this.pg_info.motivazioni)
                Utils.showMessage("Caro Giocatore,<br>" +
                    "ci siamo accorti che il personaggio che stai visualizzando &egrave; nato durante l'<strong>Olocausto dell'Innocenza</strong>.<br>" +
                    "Ci servirebbe che aggiungessi nel Background come lui/lei ha fatto a sopravvivere alla disgrazia.<br>" +
                    "Vai nell'apposita sezione e clicca il pulsante 'Modifica Background'.<br>" +
                    "Grazie, lo Staff!");
        },

        faiLoginPG : function ()
        {
            var dati = {pgid : window.localStorage.getItem("pg_da_loggare")};

            Utils.requestData(
                Constants.API_GET_PG_LOGIN,
                "GET",
                dati,
                function (data)
                {
                    this.pg_info = data.result;

                    var pg_no_bg = JSON.parse( JSON.stringify(this.pg_info) );
                    delete pg_no_bg.background_personaggio;
                    delete pg_no_bg.note_master_personaggio;

                    window.localStorage.removeItem('logged_pg');
                    window.localStorage.setItem('logged_pg', JSON.stringify(pg_no_bg));

                    AdminLTEManager.mostraNomePersonaggio( this.pg_info.nome_personaggio );
                    AdminLTEManager.controllaMessaggi();

                    this.controllaMotivazioniOlocausto();
                    this.mostraDati();
                    this.recuperaRicetteCrafting();
                    this.recuperaNoteCartellino();
                }.bind(this),
                null,
                null,
                window.history.back
            );
        },

        setListeners : function ()
        {
            $("#mostra_form_bg").click(this.mostraTextAreaBG.bind(this));
            $("#mostra_note_master").click(this.mostraTextAreaNoteMaster.bind(this));
            $("#mostra_note_cartellino").click(this.mostraTextAreaNoteCartellino.bind(this));
            $("#btn_aggiungiAbilitaAlPG").click(Utils.redirectTo.bind(this, Constants.ABILITY_SHOP_PAGE));
            $("#btn_modificaPG_px_personaggio").click(this.modificaPuntiPG.bind(this));
            $("#btn_modificaPG_credito_personaggio").click(this.modificaCreditoPG.bind(this));
            //$( "#message" ).on( "hidden.bs.modal", Utils.reloadPage );
        }
    }
}();

$(function ()
{
    PgViewerManager.init();
});
