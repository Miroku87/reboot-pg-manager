var PgListManager = function ()
{
    return {
        init: function ()
        {
            this.recuperaDatiLocali();
            this.creaDataTable();
        },

        inviaModificheRicetta: function ( id_ricetta )
        {
            var approv = $("#modal_modifica_ricetta").find("#approvazione").is(":checked") ? 1 : 0,
                extra  = encodeURIComponent( Utils.stripHMTLTag( $("#modal_modifica_ricetta").find("#extra_cartellino").val()).replace(/\n/g,"<br>") ),
                note   = encodeURIComponent( Utils.stripHMTLTag( $("#modal_modifica_ricetta").find("#note_ricetta").val()).replace(/\n/g,"<br>") ),
                dati   = {
                    modifiche: {
                        note_ricetta: note,
                        extra_cartellino_ricetta: extra,
                        approvata_ricetta: approv
                    },
                    id : id_ricetta
                };

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
                extra = Utils.unStripHMTLTag( decodeURIComponent( dati.extra_cartellino_ricetta )).replace(/<br>/g,"\r"),
                extra = extra === "null" ? "" : extra,
                note  = Utils.unStripHMTLTag( decodeURIComponent( dati.note_ricetta )).replace(/<br>/g,"\r"),
                note  = note === "null" ? "" : note;

            //TODO
            $("#modal_modifica_ricetta").find("#nome_ricetta").text(dati.nome_ricetta);
            $("#modal_modifica_ricetta").find("#lista_componenti").text(dati.componenti_ricetta.replace("@@@","<br>"));
            $("#modal_modifica_ricetta").find("#risultato").text(dati.risultato_ricetta.replace("@@@","<br>"));
            $("#modal_modifica_ricetta").find("#approvata").iCheck( dati.approvata_ricetta == "0" ? "Uncheck" : "Check" );
            $("#modal_modifica_ricetta").find("#extra_cartellino").val(extra);
            $("#modal_modifica_ricetta").find("#note_ricetta").val(note);

            $("#modal_modifica_ricetta").find("#btn_invia_modifiche_ricetta").unbind("click");
            $("#modal_modifica_ricetta").find("#btn_invia_modifiche_ricetta").click(this.inviaModificheRicetta.bind(this,dati.id_ricetta));
            $("#modal_modifica_ricetta").modal({drop:"static"});
		},

        rifiutaRicetta: function ( id )
        {
            Utils.requestData(
                Constants.API_EDIT_RICETTA,
                "POST",
                { id: id, modifiche: { "approvata_ricetta" : 0 } },
                "Ricetta rifiutata con successo.",
                null,
                this.recipes_grid.ajax.reload.bind(this,null,false)
            );
		},

        approvaRicetta: function ( id )
        {
            Utils.requestData(
                Constants.API_EDIT_RICETTA,
                "POST",
                { id: id, modifiche: { "approvata_ricetta" : 1 } },
                "Ricetta approvata con successo.",
                null,
                this.recipes_grid.ajax.reload.bind(this,null,false)
            );
		},

        confermaRifiutaRicetta: function ( e )
        {
            var t    = $(e.target),
                dati = this.recipes_grid.row( t.parents('tr') ).data();
            
            Utils.showConfirm("Sicuro di voler rifiutare questa ricetta?", this.rifiutaRicetta.bind(this, dati));
		},
    
        confermaApprovaRicetta: function ( e )
        {
            var t    = $(e.target),
                dati = this.recipes_grid.row( t.parents('tr') ).data();
            
            Utils.showConfirm("Sicuro di voler approvare questa ricetta?", this.approvaRicetta.bind(this, dati));
		},

        setGridListeners: function ()
        {
            AdminLTEManager.controllaPermessi();

            $( "td [data-toggle='popover']" ).popover("destroy");
            $( "td [data-toggle='popover']" ).popover();

            $( "[data-toggle='tooltip']" ).removeData('tooltip').unbind().next('div.tooltip').remove();
            $( "[data-toggle='tooltip']" ).tooltip();

            $("button.modifica-note").unbind( "click", this.mostraModalRicetta.bind(this) );
            $("button.modifica-note").click( this.mostraModalRicetta.bind(this) );

            $("button.rifiuta-ricetta").unbind( "click", this.confermaRifiutaRicetta.bind(this) );
            $("button.rifiuta-ricetta").click( this.confermaRifiutaRicetta.bind(this) );

            $("button.approva-ricetta").unbind( "click", this.confermaApprovaRicetta.bind(this) );
            $("button.approva-ricetta").click( this.confermaApprovaRicetta.bind(this) );
		},

        erroreDataTable: function ( e, settings )
        {
            if( !settings.jqXHR.responseText )
                return false;

            var real_error = settings.jqXHR.responseText.replace(/^([\S\s]*?)\{"[\S\s]*/i,"$1");
            real_error = real_error.replace("\n","<br>");
            Utils.showError(real_error);
        },

        creaPulsantiAzioni: function (data, type, row)
        {
            var pulsanti = "";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default modifica-note' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Modifica Note'><i class='fa fa-pencil'></i></button>";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default inizialmente-nascosto rifiuta-ricetta' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Rifiuta Ricetta'><i class='fa fa-remove'></i></button>";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default inizialmente-nascosto approva-ricetta' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Approva Ricetta'><i class='fa fa-tick'></i></button>";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default inizialmente-nascosto stampa-cartellino' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Stampa Cartellino'><i class='fa fa-print'></i></button>";

            return pulsanti;
		},

        creaDataTable: function ( )
        {
            var columns = [];

            columns.push({
                title: "ID",
                data : "id_ricetta"
            });
            columns.push({
                title: "Giocatore",
                data : "nome_giocatore"
            });
            columns.push({
                title: "Personaggio",
                data : "nome_personaggio"
            });
            columns.push({
                title: "Data Creazione",
                data : "data_inserimento_ricetta"
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
                render: this.renderCompsERisultati.bind(this)
            });
            columns.push({
                title: "Risultato",
                data : "risultati_ricetta",
                render: this.renderCompsERisultati.bind(this)
            });
            columns.push({
                title: "Approvata",
                data : "approvata_ricetta"
            });
            columns.push({
                title: "Note Private",
                data : "note_ricetta",
                render: $.fn.dataTable.render.ellipsis( 20, true, false )
            });
            columns.push({
                title: "Note per Cartellino",
                data : "extra_cartellino_ricetta",
                render: $.fn.dataTable.render.ellipsis( 20, true, false )
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
                            data,
                            callback
                        );
                    },
                    columns    : columns,
                    order      : [[0, 'desc']]
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
