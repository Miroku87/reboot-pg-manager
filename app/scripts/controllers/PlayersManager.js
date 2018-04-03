var PgListManager = function ()
{
    return {
        init: function ()
        {
            this.recuperaDatiLocali();
            this.creaDataTable();
        },

        controllaCampi: function ()
        {
            var errors     = "",
                nome       = $("#modal_modifica_giocatore").find("#nome_giocatore").val(),
                cognome    = $("#modal_modifica_giocatore").find("#cognome_giocatore").val(),
                mail       = $("#modal_modifica_giocatore").find("#email_giocatore").val();

            if ( nome === "" || Utils.soloSpazi(nome) )
                errors += "<li>Il campo Nome non pu&ograve; essere vuoto.</li>";

            if ( cognome === "" || Utils.soloSpazi(cognome) )
                errors += "<li>Il campo Cognome non pu&ograve; essere vuoto.</li>";

            if ( mail === "" || Utils.soloSpazi(mail) )
                errors += "<li>Il campo Mail non pu&ograve; essere vuoto.</li>";
            else if ( !Utils.controllaMail(mail) )
                errors += "<li>Il campo Mail contiene un indirizzo non valido.</li>";

            //if( !condizioni )
            //	errors += "Accettare i termini e le condizioni &egrave; obbligatorio.";

            return errors;
        },

        onDatiGiocatoreInviati: function ( id_gioc )
        {
            if( id_gioc !== this.user_info.email_giocatore )
            {
                Utils.showMessage("Dal momento che la tua mail è cambiata verrai disconnesso.",AdminLTEManager.logout);
                return;
            }

            this.player_grid.ajax.reload(null,false);
        },

        inviaModificheGiocatore: function ( id_gioc )
        {
            var errors = this.controllaCampi();

            if( errors !== "" )
            {
                Utils.showError("Sono stati rilevati i seguenti errori:<ul>" + errors + "</ul>");
                return;
            }

            var nome       = $("#modal_modifica_giocatore").find("#nome_giocatore").val(),
                cognome    = $("#modal_modifica_giocatore").find("#cognome_giocatore").val(),
                mail       = $("#modal_modifica_giocatore").find("#email_giocatore").val(),
                ruolo      = $("#modal_modifica_giocatore").find("#ruolo_giocatore").val(),
                note       = encodeURIComponent( Utils.stripHMTLTag( $("#modal_modifica_giocatore").find("#note_master_giocatore").val()).replace(/\n/g,"<br>") ),
                dati       = {
                    modifiche: {
                        email_giocatore: mail,
                        nome_giocatore: nome,
                        cognome_giocatore: cognome,
                        ruoli_nome_ruolo: ruolo,
                        note_staff_giocatore: note
                    },
                    id : id_gioc
                };

            Utils.requestData(
                Constants.API_POST_MOD_GIOCATORE,
                "POST",
                dati,
                "Modifiche apportate con successo",
                null,
                this.onDatiGiocatoreInviati.bind(this, id_gioc)
            );
		},

        mostraModalDatiGiocatore: function ( e )
        {
            var t    = $(e.target),
                dati = this.player_grid.row( t.parents('tr') ).data(),
                note = Utils.unStripHMTLTag( decodeURIComponent( dati.note_staff_giocatore )).replace(/<br>/g,"\r"),
                note = note === "null" ? "" : note;

            $("#modal_modifica_giocatore").find("#email_giocatore").val(dati.email_giocatore);
            $("#modal_modifica_giocatore").find("#nome_giocatore").val(dati.nome_giocatore);
            $("#modal_modifica_giocatore").find("#cognome_giocatore").val(dati.cognome_giocatore);
            $("#modal_modifica_giocatore").find("#ruolo_giocatore").val(dati.ruoli_nome_ruolo);
            $("#modal_modifica_giocatore").find("#note_master_giocatore").val( note );

            $("#modal_modifica_giocatore").find("#btn_invia_modifiche_giocatore").unbind("click");
            $("#modal_modifica_giocatore").find("#btn_invia_modifiche_giocatore").click(this.inviaModificheGiocatore.bind(this,dati.email_giocatore));
            $("#modal_modifica_giocatore").modal({drop:"static"});
		},

        eliminaGiocatore: function ( id )
        {
            Utils.requestData(
                Constants.API_DEL_GIOCATORE,
                "GET",
                { id: id },
                "Giocatore eliminato con successo.",
                null,
                this.player_grid.ajax.reload.bind(this,null,false)
            );
		},

        confermaEliminaGiocatore: function ( e )
        {
            var target = $(e.target);
            Utils.showConfirm("Sicuro di voler eliminare questo giocatore?", this.eliminaGiocatore.bind(this, target.attr("data-id")));
		},

        scriviMessaggio: function ( e )
        {
            var target = $(e.target);
            window.localStorage.setItem("scrivi_a",JSON.stringify( {id: target.attr("data-id"), nome: target.attr("data-nome") } ) );
            window.location.href = Constants.MESSAGGI_PAGE;
		},

        setGridListeners: function ()
        {
            AdminLTEManager.controllaPermessi();

            $( "td [data-toggle='popover']" ).popover("destroy");
            $( "td [data-toggle='popover']" ).popover();

            $( "[data-toggle='tooltip']" ).removeData('tooltip').unbind().next('div.tooltip').remove();
            $( "[data-toggle='tooltip']" ).tooltip();

            $("button.scrivi-messaggio").unbind( "click", this.scriviMessaggio.bind(this) );
            $("button.scrivi-messaggio").click( this.scriviMessaggio.bind(this) );

            $("button.modificaGiocatore").unbind( "click", this.mostraModalDatiGiocatore.bind(this) );
            $("button.modificaGiocatore").click( this.mostraModalDatiGiocatore.bind(this) );

            $("button.eliminaGiocatore").unbind( "click", this.confermaEliminaGiocatore.bind(this) );
            $("button.eliminaGiocatore").click( this.confermaEliminaGiocatore.bind(this) );
		},

        erroreDataTable: function ( e, settings )
        {
            if( !settings.jqXHR.responseText )
                return false;

            var real_error = settings.jqXHR.responseText.replace(/^([\S\s]*?)\{"[\S\s]*/i,"$1");
            real_error = real_error.replace("\n","<br>");
            Utils.showError(real_error);
        },

        formattaNomePg: function (data, type, row)
        {
            return data+" <button type='button' " +
                "class='btn btn-xs btn-default pull-right pg-login-btn' " +
                "data-id='"+row.id_personaggio+"' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Logga PG'><i class='fa fa-sign-in'></i></button>";
		},

        renderizzaNoteStaff: function (data, type, row)
        {
            var denc_data = Utils.unStripHMTLTag( decodeURIComponent(data) );
            denc_data = denc_data === "null" ? "" : denc_data;
            return $.fn.dataTable.render.ellipsis( 20, false, true, true )(denc_data, type, row);
		},

        creaPulsantiAzioni: function (data, type, row)
        {
            var pulsanti = "",
                permessi_modifica = ["modificaUtente_note_staff_giocatore_altri",
                    "modificaUtente_note_staff_giocatore_proprio",
                    "modificaUtente_email_giocatore_altri",
                    "modificaUtente_email_giocatore_proprio",
                    "modificaUtente_nome_giocatore_altri",
                    "modificaUtente_nome_giocatore_proprio",
                    "modificaUtente_cognome_giocatore_altri",
                    "modificaUtente_cognome_giocatore_proprio",
                    "modificaUtente_ruoli_nome_ruolo_altri",
                    "modificaUtente_ruoli_nome_ruolo_proprio"];

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default scrivi-messaggio' " +
                "data-id='fg#"+row.email_giocatore+"' " +
                "data-nome='"+row.nome_completo+"' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Scrivi Messaggio'><i class='fa fa-envelope-o'></i></button>";

            if( Utils.controllaPermessi( this.user_info, permessi_modifica, true ) )
                pulsanti += "<button type='button' " +
                    "class='btn btn-xs btn-default modificaGiocatore' " +
                    "data-id='"+row.email_giocatore+"' " +
                    "data-toggle='tooltip' " +
                    "data-placement='top' " +
                    "title='Modifica Dati'><i class='fa fa-pencil'></i></button>";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default inizialmente-nascosto eliminaGiocatore' " +
                "data-id='"+row.email_giocatore+"' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Elimina'><i class='fa fa-trash-o'></i></button>";

            return pulsanti;
		},

        creaDataTable: function ( )
        {
            var columns = [];

            columns.push({data : "email_giocatore"});
            columns.push({data : "nome_completo"});
            columns.push({data : "data_registrazione_giocatore"});
            columns.push({data : "ruoli_nome_ruolo"});
            columns.push({
                data : "note_giocatore",
                render: $.fn.dataTable.render.ellipsis( 20, false, false )
            });
            columns.push({
                data : "note_staff_giocatore",
                render: this.renderizzaNoteStaff.bind(this)
            });
            columns.push({render: this.creaPulsantiAzioni.bind(this) });

            this.player_grid = $( '#groglia_giocatori' )
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
                            Constants.API_GET_PLAYERS,
                            "GET",
                            data,
                            callback
                        );
                    },
                    columns    : columns,
                    order      : [[1, 'desc']]
                } );
        },

        recuperaDatiLocali: function()
        {
            this.user_info = JSON.parse( window.localStorage.getItem("user") );
        }
    };
}();

$(function () {
    PgListManager.init();
});
