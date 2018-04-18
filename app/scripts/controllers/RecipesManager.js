var RecipesManager = function ()
{
    return {
        init: function ()
        {
            this.recuperaDatiLocali();
            this.setListeners();
            this.creaDataTable();
        },

        stampaCartellini: function ( e )
        {
            var t = $(e.target),
                ricette = [];

            if( t.is("#btn_stampaRicette") )
                ricette = this.ricette_selezionate;
            else if ( t.is("td > button.btn-xs") )
                ricette = [this.recipes_grid.row( t.parents("tr")).data().id_ricetta];

            if( ricette.length === 0 )
            {
                Utils.showError("Devi selezionare almeno una ricetta.");
                return;
            }

            window.localStorage.setItem("ricette_da_stampare", JSON.stringify(ricette));
            window.open( Constants.STAMPA_RICETTE, "Stampa Oggetti" );
        },

        inviaModificheRicetta: function ( id_ricetta )
        {
            var approv = $("#modal_modifica_ricetta").find("#approvata").val(),
                extra  = encodeURIComponent( Utils.stripHMTLTag( $("#modal_modifica_ricetta").find("#extra_cartellino").val()).replace(/\n/g,"<br>") ),
                note   = encodeURIComponent( Utils.stripHMTLTag( $("#modal_modifica_ricetta").find("#note_ricetta").val()).replace(/\n/g,"<br>") ),
                dati   = {
                    id : id_ricetta,
                    modifiche: {
                        note_ricetta: note,
                        extra_cartellino_ricetta: extra,
                        approvata_ricetta: approv
                    }
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
                note  = note === "null" ? "" : note,
                comps = "<li>"+dati.componenti_ricetta.split(";").join("</li><li>")+"</li>",
                resul = dati.risultato_ricetta ? "<li>"+dati.risultato_ricetta.split(";").join("</li><li>")+"</li>" : "<li></li>";

            $("#modal_modifica_ricetta").find("#nome_ricetta").text(dati.nome_ricetta);
            $("#modal_modifica_ricetta").find("#lista_componenti").html(comps);
            $("#modal_modifica_ricetta").find("#risultato").html(resul);
            $("#modal_modifica_ricetta").find("#approvata").val( dati.approvata_ricetta );
            $("#modal_modifica_ricetta").find("#extra_cartellino").val(extra);
            $("#modal_modifica_ricetta").find("#note_ricetta").val(note);

            $("#modal_modifica_ricetta").find("#btn_invia_modifiche_ricetta").unbind("click");
            $("#modal_modifica_ricetta").find("#btn_invia_modifiche_ricetta").click(this.inviaModificheRicetta.bind(this,dati.id_ricetta));
            $("#modal_modifica_ricetta").modal({drop:"static"});
		},

        ricettaSelezionata: function ( e )
        {
            var t    = $(e.target),
                dati = this.recipes_grid.row(t.parents("tr")).data();

            if( t.is(":checked") )
                this.ricette_selezionate.push( dati.id_ricetta );
            else if ( !t.is(":checked") && this.ricette_selezionate.indexOf( dati.id_ricetta ) !== -1 )
                this.ricette_selezionate.splice( this.ricette_selezionate.indexOf( dati.id_ricetta ), 1 );
		},

        selezionaRicette: function ( e )
        {
            $("input[type='checkbox']").iCheck("Uncheck");

            for( var r in this.ricette_selezionate )
                $("#ck_"+this.ricette_selezionate[r]).iCheck("Check");
		},

        rifiutaRicetta: function ( dati )
        {
            Utils.requestData(
                Constants.API_EDIT_RICETTA,
                "POST",
                { id: dati.id_ricetta, modifiche: { "approvata_ricetta" : -1 } },
                "Ricetta rifiutata con successo.",
                null,
                this.recipes_grid.ajax.reload.bind(this,null,false)
            );
		},

        approvaRicetta: function ( dati )
        {
            Utils.requestData(
                Constants.API_EDIT_RICETTA,
                "POST",
                { id: dati.id_ricetta, modifiche: { "approvata_ricetta" : 1 } },
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

            $( 'input[type="checkbox"]' ).iCheck("destroy");
            $( 'input[type="checkbox"]' ).iCheck( { checkboxClass : 'icheckbox_square-blue' } );
            $( 'input[type="checkbox"]' ).on( "ifChanged", this.ricettaSelezionata.bind(this) );

            $( "[data-toggle='tooltip']" ).tooltip();

            $("button.modifica-note").unbind( "click", this.mostraModalRicetta.bind(this) );
            $("button.modifica-note").click( this.mostraModalRicetta.bind(this) );

            $("button.rifiuta-ricetta").unbind( "click", this.confermaRifiutaRicetta.bind(this) );
            $("button.rifiuta-ricetta").click( this.confermaRifiutaRicetta.bind(this) );

            $("button.approva-ricetta").unbind( "click", this.confermaApprovaRicetta.bind(this) );
            $("button.approva-ricetta").click( this.confermaApprovaRicetta.bind(this) );

            $("button.stampa-cartellino").unbind( "click", this.stampaCartellini.bind(this) );
            $("button.stampa-cartellino").click( this.stampaCartellini.bind(this) );

            this.selezionaRicette();
		},

        erroreDataTable: function ( e, settings )
        {
            if( !settings.jqXHR.responseText )
                return false;

            var real_error = settings.jqXHR.responseText.replace(/^([\S\s]*?)\{"[\S\s]*/i,"$1");
            real_error = real_error.replace("\n","<br>");
            Utils.showError(real_error);
        },

        renderRisultati: function ( data, type, row )
        {
            if ( data )
            {
                var ret = data.split(";").join("<br>");

                if (row.id_unico_risultato_ricetta !== null)
                    ret = row.tipo_ricetta.substr(0, 1).toUpperCase() + Utils.pad(row.id_unico_risultato_ricetta, Constants.ID_RICETTA_PAG) + "<br>" + ret;

                return ret;
            }
            else
                return "";
        },

        renderComps: function ( data, type, row )
        {
            var ret = data;

            if( row.tipo_ricetta === "Programmazione" )
                ret = data.replace(/Z\=(\d);\s/g,"Z=$1<br>");
            else
                ret = data.replace(/;/g,"<br>");

            return ret;
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

        renderCheckStampa: function ( data, type, row )
        {
            return  "<div class='checkbox icheck'>" +
                        "<input type='checkbox' id='ck_"+row.id_ricetta+"'>" +
                    "</div>";
        },

        creaPulsantiAzioni: function (data, type, row)
        {
            var pulsanti = "";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default modifica-note modificaRicetta ' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Modifica Note'><i class='fa fa-pencil'></i></button>";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default inizialmente-nascosto modificaRicetta rifiuta-ricetta' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Rifiuta Ricetta'><i class='fa fa-remove'></i></button>";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default inizialmente-nascosto modificaRicetta  approva-ricetta' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Approva Ricetta'><i class='fa fa-check'></i></button>";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default stampa-cartellino' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Stampa Cartellino'><i class='fa fa-print'></i></button>";

            return pulsanti;
		},

        creaDataTable: function ( )
        {
            var columns = [];

            columns.push({
                title: "Stampa",
                render : this.renderCheckStampa.bind(this)
            });
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
                title: "Risultato&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
                data : "risultato_ricetta",
                render: this.renderRisultati.bind(this)
            });
            columns.push({
                title: "Approvata",
                data : "approvata_ricetta",
                render: this.renderApprovato.bind(this)
            });
            columns.push({
                title: "Note Private",
                data : "note_ricetta",
                render: this.renderNote.bind(this)
            });
            columns.push({
                title: "Note per Cartellino",
                data : "extra_cartellino_ricetta",
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
                            data,
                            callback
                        );
                    },
                    columns    : columns,
                    //lengthMenu: [ 5, 10, 25, 50, 75, 100 ],
                    order      : [[1, 'desc']]
                } );

            this.ricette_selezionate = [];
        },

        recuperaDatiLocali: function()
        {
            this.user_info = JSON.parse( window.localStorage.getItem("user") );
        },

        setListeners: function ()
        {
            $( 'input[type="checkbox"]' ).iCheck("destroy");
            $( 'input[type="checkbox"]' ).iCheck( {
                checkboxClass : 'icheckbox_square-blue'
            } );
            $( "[data-toggle='tooltip']" ).tooltip();

            $("#btn_stampaRicette").click(this.stampaCartellini.bind(this));
        }
    };
}();

$(function () {
    RecipesManager.init();
});
