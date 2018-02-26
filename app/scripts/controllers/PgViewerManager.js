﻿var PgViewerManager = function ()
{
	return {

		init: function ()
		{
            this.user_info = JSON.parse( window.localStorage.getItem('user') );

			this.faiLoginPG();
            this.recuperaStoricoAzioni();
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

        eliminaClasse: function ( e )
		{
            console.log( $(e.currentTarget).attr("data-id") );
		},

        eliminaAbilita: function ( e )
		{
            console.log( $(e.currentTarget).attr("data-id") );
		},

        mostraDati: function ()
		{
            var bin_button  = " <button type=\"button\" class=\"btn btn-xs btn-default eliminaClassePG\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Elimina\" data-id=\"{1}\"><span class=\"fa fa-trash-o\"></span></button>",
                bin_button  = this.user_info.permessi.indexOf("eliminaClassePG_altri") !== -1 || this.user_info.permessi.indexOf("eliminaClassePG_proprio") !== -1 ? bin_button : "",
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

            $.each( this.pg_info.abilita.civile, function ( i, val )
            {
                var azioni_abilita = $("<button type=\"button\" class=\"btn btn-xs btn-default\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Elimina\" data-id=\"" + val.id_abilita + "\"><span class=\"fa fa-trash-o\"></span></button>"),
                    tr = $("<tr></tr>");
                tr.append("<td>"+val.nome_abilita+"</td>");
                tr.append("<td>"+val.nome_classe+"</td>");
                tr.append("<td>"+val.costo_abilita+"</td>");
                $("<td></td>").appendTo(tr).append(azioni_abilita);
                $("#lista_abilita_civili").find("tbody").append(tr);

                azioni_abilita.click( this.eliminaAbilita.bind(this) );
            }.bind(this));

            $.each( this.pg_info.abilita.militare, function ( i, val )
            {
                var azioni_abilita = $("<button type=\"button\" class=\"btn btn-xs btn-default\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Elimina\" data-id=\"" + val.id_abilita + "\"><span class=\"fa fa-trash-o\"></span></button>"),
                    tr = $("<tr></tr>");
                tr.append("<td>"+val.nome_abilita+"</td>");
                tr.append("<td>"+val.nome_classe+"</td>");
                tr.append("<td>"+val.costo_abilita+"</td>");
                tr.append("<td>"+val.distanza_abilita+"</td>");
                $("<td></td>").appendTo(tr).append(azioni_abilita);
                $("#lista_abilita_militari").find("tbody").append(tr);

                azioni_abilita.click( this.eliminaAbilita.bind(this) );
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

            $(".eliminaClassePG").click( this.eliminaClasse.bind( this ) );

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

        recuperaStoricoAzioni: function ()
        {
            $.ajax({
                url: Constants.API_GET_STORICO_PG,
                method: "GET",
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
                    pgid : Utils.getParameterByName( "i" )
                },
                success: function( data )
                {
                    if ( data.status === "ok" )
                    {
                        this.pg_info = data.result;

                        var pg_no_bg = JSON.parse( JSON.stringify( this.pg_info ) );
                        delete pg_no_bg.background_personaggio;

                        window.localStorage.setItem( 'logged_pg', JSON.stringify( pg_no_bg ) );

                        this.personalizzaMenu();
                        this.mostraDati();
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
            $( "#message" ).on( "hidden.bs.modal", this.refreshPage.bind(this) );
        }
	}
}();

$(function () {
    PgViewerManager.init();
});