var PgListManager = function ()
{
    return {
        init: function ()
        {
            this.recuperaDatiLocali();
            this.recuperaPropriPg();
            this.creaDataTable();
            this.setListeners();
        },

        eliminaPersonaggio: function ( id )
        {
            Utils.requestData(
                Constants.API_DEL_PERSONAGGIO,
                "GET",
                { id: id },
                "Personaggio eliminato con successo.",
                null,
                this.pg_grid.ajax.reload.bind(this,null,false)
            );
        },

        confermaEliminaPersonaggio: function ( e )
        {
            var target = $(e.target);
            Utils.showConfirm("Sicuro di voler eliminare questo giocatore?", this.eliminaPersonaggio.bind(this, target.attr("data-id")));
        },

        modificaPuntiAiFiltrati: function ( )
        {
            var records = Array.prototype.slice.call( this.pg_grid.columns( { filter : 'applied'} ).data() ),
                col_nome = this.user_info && this.user_info.permessi.indexOf( "mostraPersonaggi_altri" ) !== -1 ? 2 : 1;

            PointsManager.impostaModal({
                pg_ids          : records[0],
                nome_personaggi : records[col_nome],
                onSuccess       : this.pg_grid.ajax.reload.bind(this,null,false)
            });
		},

        modificaCreditoAiFiltrati: function ( )
        {
            var records  = Array.prototype.slice.call( this.pg_grid.columns( { filter : 'applied'} ).data()),
                col_nome = this.user_info && this.user_info.permessi.indexOf( "mostraPersonaggi_altri" ) !== -1 ? 2 : 1;

            CreditManager.impostaModal({
                pg_ids          : records[0],
                nome_personaggi : records[col_nome],
                onSuccess       : this.pg_grid.ajax.reload.bind(this,null,false)
            });
		},

        stampaCartellini: function ( )
        {
            var pg_da_stampare = Array.prototype.slice.call( this.pg_grid.columns( { filter : 'applied'} ).data() );

            window.localStorage.setItem("da_stampare",JSON.stringify(pg_da_stampare[0]));
            Utils.redirectTo( Constants.PRINT_PAGE );
		},

        loggaPersonaggio: function ( e )
        {
            var target = $(e.target);
            window.localStorage.setItem("pg_da_loggare",target.attr("data-id"));
            window.location.href = Constants.PG_PAGE;
		},

        vaiACreaPG: function ( e )
        {
            window.localStorage.removeItem('logged_pg');
            window.location.href = Constants.CREAPG_PAGE;
		},

        scriviMessaggio: function ( e )
        {
            var target = $(e.target);
            window.localStorage.setItem("scrivi_a",JSON.stringify( {id: target.attr("data-id"), nome: target.attr("data-nome") } ) );
            window.location.href = Constants.MESSAGGI_PAGE;
        },

        modificaPuntiPG: function ( e )
        {
            var target = $(e.target);
            PointsManager.impostaModal({
                pg_ids          : [ target.attr("data-id") ],
                nome_personaggi : [ target.attr("data-nome") ],
                onSuccess       : this.pg_grid.ajax.reload.bind(this,null,false)
            });
        },

        modificaCreditoPG: function ( e )
        {
            var target = $(e.target);
            CreditManager.impostaModal({
                pg_ids          : [ target.attr("data-id") ],
                nome_personaggi : [ target.attr("data-nome") ],
                onSuccess       : this.pg_grid.ajax.reload.bind(this,null,false)
            });
        },

        modificaContattabilePG: function ( e )
        {
            var target = $(e.target);
            target.attr("disabled",true);
            Utils.requestData(
                Constants.API_POST_EDIT_PG,
                "POST",
                {
                    pgid: target.attr("data-id"),
                    modifiche: { "contattabile_personaggio" : target.is(":checked") ? 1 : 0 }
                },
                function ()
                {
                    target.attr("disabled",false);
                    this.pg_grid.ajax.reload(null,false);
                }
            );
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
                container: '#lista_pg'
            });

            $( 'input[type="checkbox"]' ).iCheck("destroy");
            $( 'input[type="checkbox"]' ).iCheck( {
                checkboxClass : 'icheckbox_square-blue'
            } );

            $("td > button.eliminaPG").unbind( "click", this.confermaEliminaPersonaggio.bind(this) );
            $("td > button.eliminaPG").click( this.confermaEliminaPersonaggio.bind(this) );

            $("td > button.scrivi-messaggio").unbind( "click", this.scriviMessaggio.bind(this) );
            $("td > button.scrivi-messaggio").click( this.scriviMessaggio.bind(this) );

            $("td > button.modificaPG_pc_personaggio").unbind( "click", this.modificaPuntiPG.bind(this) );
            $("td > button.modificaPG_pc_personaggio").click( this.modificaPuntiPG.bind(this) );

            $("td > button.modificaPG_credito_personaggio").unbind( "click", this.modificaCreditoPG.bind(this) );
            $("td > button.modificaPG_credito_personaggio").click( this.modificaCreditoPG.bind(this) );

            $("td input.modificaPG_contattabile_personaggio").unbind( "ifChanged", this.modificaContattabilePG.bind(this) );
            $("td input.modificaPG_contattabile_personaggio").on( "ifChanged", this.modificaContattabilePG.bind(this) );

            $("td > button.pg-login-btn").unbind( "click", this.loggaPersonaggio.bind(this) );
            $("td > button.pg-login-btn").click( this.loggaPersonaggio.bind(this) );
		},

        erroreDataTable: function ( e, settings, techNote, message )
        {
            if( !settings.jqXHR.responseText )
                return false;

            var real_error = settings.jqXHR.responseText.replace(/^([\S\s]*?)\{"[\S\s]*/i,"$1");
            real_error = real_error.replace("\n","<br>");
            Utils.showError(real_error);
        },

        creaCheckBoxContattabile: function (data, type, row)
        {
            var checked = data === "1" ? "checked" : "";
            return  "<div class='checkbox icheck'>" +
                        "<input type='checkbox' " +
                            "class='modificaPG_contattabile_personaggio' " +
                            "data-id='"+row.id_personaggio+"' " +
                            ""+checked+">" +
                    "</div>";
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

        creaPulsantiAzioniPg: function (data, type, row)
        {
            var pulsanti = "";

            if( this.user_info && this.user_info.permessi.indexOf( "mostraPersonaggi_altri" ) !== -1 )
            {
                pulsanti += "<button type='button' " +
                                    "class='btn btn-xs btn-default scrivi-messaggio' " +
                                    "data-id='ig#" + row.id_personaggio + "' " +
                                    "data-nome='" + row.nome_personaggio + "' " +
                                    "data-toggle='tooltip' " +
                                    "data-placement='top' " +
                                    "title='Scrivi Messaggio'><i class='fa fa-envelope-o'></i></button>";
            }
            pulsanti += "<button type='button' " +
                                "class='btn btn-xs btn-default inizialmente-nascosto modificaPG_px_personaggio modificaPG_pc_personaggio' " +
                                "data-id='"+row.id_personaggio+"' " +
                                "data-nome='"+row.nome_personaggio+"' " +
                                "data-pc='"+row.pc_personaggio+"' " +
                                "data-px='"+row.px_personaggio+"' " +
                                "data-toggle='tooltip' " +
                                "data-placement='top' " +
                                "title='Modifica Punti'>P</button>";
            pulsanti += "<button type='button' " +
                                "class='btn btn-xs btn-default inizialmente-nascosto modificaPG_credito_personaggio' " +
                                "data-id='"+row.id_personaggio+"' " +
                                "data-nome='"+row.nome_personaggio+"' " +
                                "data-toggle='tooltip' " +
                                "data-placement='top' " +
                                "title='Credito PG'><i class='fa fa-money'></i></button>";
            /*pulsanti += "<button type='button' " +
                                "class='btn btn-xs btn-default inizialmente-nascosto stampaCartelliniPG' " +
                                "data-id='"+row.id_personaggio+"' " +
                                "data-toggle='tooltip' " +
                                "data-placement='top' " +
                                "title='Stampa Cartellino'><i class='fa fa-print'></i></button>";*/
            pulsanti += "<button type='button' " +
                                "class='btn btn-xs btn-default inizialmente-nascosto eliminaPG' " +
                                "data-id='"+row.id_personaggio+"' " +
                                "data-toggle='tooltip' " +
                                "data-placement='top' " +
                                "title='Elimina PG'><i class='fa fa-trash-o'></i></button>";

            return pulsanti;
		},

        //TODO: temporanea
        etaInserite: function( num_input )
        {
            if( ++this.inserimenti_eta === num_input )
                Utils.showMessage("Dati inseriti con successo. Grazie!",Utils.reloadPage);
        },

        //TODO: temporanea
        inviaEta: function( e )
        {
            var inputs = $("#modal_aggiungi_eta").find("#personaggi").find("input");

            this.inserimenti_eta = 0;

            inputs.each(function (i, item)
            {
                if( $(item).val() === "0" )
                {
                    Utils.showError("Non possono esserci et&agrave; uguali a 0.",Utils.reloadPage);
                    throw new Error("Non possono esserci eta' uguali a 0.");
                }
            });

            inputs.each(function (i, item)
            {
                var el = $(item);

                Utils.requestData(
                    Constants.API_POST_EDIT_ETA_PG,
                    "POST",
                    { pgid: el.attr("data-id"), eta: el.val() },
                    this.etaInserite.bind(this,inputs.length)
                );
            }.bind(this));
        },

        //TODO: temporanea
        mostraModalEta: function( _data )
        {
            var data      = _data.result,
                append_to = $("#modal_aggiungi_eta").find("#personaggi").find("form");

            for( var d in data )
            {
                if( data[d].anno_nascita_personaggio === Constants.ANNO_PRIMO_LIVE+"" )
                    $(  '<div class="form-group">'+
                            '<label class="col-sm-2 control-label">'+data[d].nome_personaggio+'</label>'+
                            '<div class="col-sm-10">'+
                                '<input type="number" ' +
                                        'class="form-control" ' +
                                        'min="0" ' +
                                        'data-id="'+data[d].id_personaggio+'" ' +
                                        'name="eta_pg['+data[d].id_personaggio+']" ' +
                                        'placeholder="Et&agrave personaggio" value="0" />'+
                            '</div>'+
                        '</div>'
                    ).appendTo(append_to);
            }

            if( append_to.find("input").length > 0 )
            {
                $("#modal_aggiungi_eta").find("#btn_invia_eta").click(this.inviaEta.bind(this));
                $("#modal_aggiungi_eta").modal({drop:"static",backdrop:"static",keyboard:false});
            }
        },

        creaDataTable: function (  )
        {
            var columns = [];

            columns.push({data : "id_personaggio"});
            columns.push({
                data           : "nome_giocatore",
                className      : 'inizialmente-nascosto mostraPersonaggi_altri'
            });
            columns.push({
                data   : "nome_personaggio",
                render : this.formattaNomePg.bind(this)
            });
            columns.push({data : "data_creazione_personaggio"});
            columns.push({data : "anno_nascita_personaggio"});
            columns.push({
                data : "classi_civili",
                render: $.fn.dataTable.render.ellipsis( 20, true, false )
            });
            columns.push({
                data : "classi_militari",
                render: $.fn.dataTable.render.ellipsis( 20, true, false )
            });
            columns.push({data : "px_personaggio"});
            columns.push({data : "pc_personaggio"});
            columns.push({data : "pf_personaggio"});
            columns.push({data : "mente_personaggio"});
            columns.push({data : "shield_personaggio"});
            columns.push({data : "credito_personaggio"});
            columns.push({
                data           : "contattabile_personaggio",
                render         : this.creaCheckBoxContattabile.bind(this),
                className      : 'inizialmente-nascosto text-center modificaPG_contattabile_personaggio'
            });
            columns.push({
                render         : this.creaPulsantiAzioniPg.bind(this),
                className      : 'inizialmente-nascosto modificaPG_px_personaggio modificaPG_pc_personaggio eliminaPG stampaCartelliniPG',
                orderable      : false,
                data           : null,
                defaultContent : ""
            });


            this.pg_grid = $( '#pg_grid' )
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
                            Constants.API_GET_PGS,
                            "GET",
                            data,
                            callback
                        );
                    },
                    columns    : columns,
                    order      : [[0, 'desc']]
                } );
        },

        recuperaPropriPg: function()
        {
            Utils.requestData(
                Constants.API_GET_PGS_PROPRI,
                "GET",
                {},
                this.mostraModalEta.bind(this)
            );
        },

        recuperaDatiLocali: function()
        {
            this.user_info = JSON.parse( window.localStorage.getItem("user") );
        },

        setListeners: function()
        {
            $("#btn_creaPG").click( this.vaiACreaPG.bind(this) );

            $("#btn_modificaPG_px_personaggio").click( this.modificaPuntiAiFiltrati.bind(this) );
            $("#btn_modificaPG_credito_personaggio").click( this.modificaCreditoAiFiltrati.bind(this) );
            $("#btn_stampaCartelliniPG").click( this.stampaCartellini.bind(this) );

            $( "[data-toggle='tooltip']" ).tooltip();
        }
    };
}();

$(function () {
    PgListManager.init();
});