var MarketplaceManager = function ()
{
    return {
        init: function ()
        {
            $("#box_carrello").width($("#box_carrello").parent().width());
            $("#box_carrello").css("max-height",$(".content-wrapper").height() - 41 - 51 - 20);
            $("#sconto_msg").text( $("#sconto_msg").text().replace( /\{X}/g, Constants.CARTELLINI_PER_PAG ).replace( /\{Y}/g, Constants.SCONTO_MERCATO ) );

            this.pg_info             = JSON.parse( window.localStorage.getItem("logged_pg") );
            this.placeholder_credito = $("#riga_credito").find("td:nth-child(2)").html();
            this.carrello_componenti = [];

            if( !this.pg_info )
            {
                $("#paga").wrap("<div data-toggle='tooltip' data-title='Devi essere loggato con un personaggio.'></div>");
                $("#paga").attr("disabled",true);
            }

            this.setListeners();
            this.impostaTabellaTecnico();
            this.impostaTabellaChimico();
        },

        mostraCreditoResiduo: function ( e )
        {
            if( this.pg_info )
                $("#riga_credito").find("td:nth-child(2)").html( this.pg_info.credito_personaggio );
        },

        nascondiCreditoResiduo: function ( e )
        {
            $("#riga_credito").find("td:nth-child(2)").html( this.placeholder_credito );
        },

        faiPartireStampa: function ( e )
        {
            $("#pagina_stampa")[0].contentWindow.print();
        },

        stampa: function ( e )
        {
            window.localStorage.setItem( "componenti_da_stampare", JSON.stringify(this.carrello_componenti) );
            $("#pagina_stampa").attr("src",Constants.STAMPA_RICETTE);
            window.stampa_subito = true;
            //setTimeout( this.faiPartireStampa.bind(this), 1000 );
        },

        scalaSoldi: function ( data )
        {
            Utils.requestData(
                Constants.API_POST_EDIT_PG,
                "POST",
                {
                    pgid      : this.pg_info.id_personaggio,
                    modifiche : { credito_personaggio : parseInt( data.result, 10 ) * -1 },
                    offset    : true
                },
                "Pagamento avvenuto con successo.",
                null,
                this.stampa.bind(this)
            );
        },

        paga: function ( e )
        {
            Utils.requestData(
                Constants.API_COMPRA_COMPONENTI,
                "POST",
                { ids: this.carrello_componenti },
                this.scalaSoldi.bind(this)
            );
        },

        controllaQtaPerSconto: function ()
        {
            var qta_tot      = $("#carrello tr > td:nth-child(2)")
                                .toArray()
                                .map(function(el){return parseInt( el.innerText, 10 ) || 0;})
                                .reduce(function(acc, val) { return acc + val; }),
                sconto       = qta_tot % Constants.QTA_PER_SCONTO_MERCATO === 0 ? Constants.SCONTO_MERCATO : 0;

            $("#riga_sconto > td:nth-child(2)").text( sconto + "%" );
        },

        calcolaTotaleCarrello: function ()
        {
            var sconto       = parseInt( $("#riga_sconto > td:nth-child(2)").text(), 10 ) / 100 || 0,
                tot          = $("#carrello tr > td:nth-child(3)")
                                .toArray()
                                .map(function(el){return parseInt( el.innerText, 10 ) || 0;})
                                .reduce(function(acc, val) { return acc + val; }),
                tot_scontato = tot - ( tot * sconto );

            $("#riga_totale > td:nth-child(2)").text( tot_scontato );
        },

        aumentaQtaProdotto: function ( e )
        {
            var t           = $(e.target),
                riga        = t.parents("tr"),
                id_prodotto = riga.find("td:nth-child(1)").text(),
                qta         = parseInt( riga.find("td:nth-child(2)").text(), 10) || 0,
                vecchio_tot = parseInt( riga.find("td:nth-child(3)").text(), 10) || 0,
                costo       = vecchio_tot / qta,
                indice      = Utils.indexOfArrayOfObjects( this.carrello_componenti, "id", id_prodotto );

            riga.hide();
            riga.find("td:nth-child(2)").text( qta + 1);
            riga.find("td:nth-child(3)").text( vecchio_tot + costo );
            riga.show(500);

            this.carrello_componenti.push(id_prodotto);
            this.controllaQtaPerSconto();
            this.calcolaTotaleCarrello();
        },

        diminuisciQtaProdotto: function ( e )
        {
            var t           = $(e.target),
                riga        = t.parents("tr"),
                id_prodotto = riga.find("td:nth-child(1)").text(),
                qta         = parseInt( riga.find("td:nth-child(2)").text(), 10) || 0,
                vecchio_tot = parseInt( riga.find("td:nth-child(3)").text(), 10) || 0,
                costo       = vecchio_tot / qta,
                indice      = this.carrello_componenti.indexOf(id_prodotto);//Utils.indexOfArrayOfObjects( this.carrello_componenti, "id", id_prodotto );

            if( qta - 1 <= 0 )
                riga.remove();
            else
            {
                riga.hide();
                riga.find("td:nth-child(2)").text( qta - 1);
                riga.find("td:nth-child(3)").text( vecchio_tot - costo );
                riga.show(500);
            }

            this.carrello_componenti.splice(indice,1);
            this.controllaQtaPerSconto();
            this.calcolaTotaleCarrello();
        },

        impostaPulsantiCarrello: function ()
        {
            $("td > button.add-item").unbind( "click" );
            $("td > button.add-item").click( this.aumentaQtaProdotto.bind(this) );

            $("td > button.remove-item").unbind( "click" );
            $("td > button.remove-item").click( this.diminuisciQtaProdotto.bind(this) );
        },

        oggettoInCarrello: function ( e )
        {
            var t           = $(e.target),
                datatable   = this[ t.parents("table").attr("id") ],
                dati        = datatable.row( t.parents("tr") ).data(),
                id_prodotto = dati.id_componente,
                costo       = parseInt( dati.costo_attuale_componente, 10 ),
                col_car     = $("#carrello").find("#"+id_prodotto+" td:first-child");

            if( col_car.length === 0 )
            {
                var riga = $("<tr></tr>");
                riga.attr("id",id_prodotto);
                riga.append("<td>"+id_prodotto+"</td>");
                riga.append("<td>1</td>");
                riga.append("<td>"+costo+"</td>");
                riga.append(
                    $("<td></td>")
                        .append("<button class='btn btn-xs btn-default remove-item'><i class='fa fa-minus'></i></button>")
                        .append("&nbsp;")
                        .append("<button class='btn btn-xs btn-default add-item'><i class='fa fa-plus'></i></button>")
                );
                riga.hide();

                $("#riga_sconto").before(riga);
                riga.show(500);

                this.carrello_componenti.push( id_prodotto );
            }
            else
                this.aumentaQtaProdotto({target: col_car});

            this.controllaQtaPerSconto();
            this.calcolaTotaleCarrello();
            this.impostaPulsantiCarrello();
        },

        setGridListeners: function ()
        {
            AdminLTEManager.controllaPermessi();

            $( "td [data-toggle='popover']" ).popover("destroy");
            $( "td [data-toggle='popover']" ).popover();

            //$( 'input[type="checkbox"]' ).iCheck("destroy");
            //$( 'input[type="checkbox"]' ).iCheck( { checkboxClass : 'icheckbox_square-blue' } );
            //$( 'input[type="checkbox"]' ).on( "ifChanged", this.ricettaSelezionata.bind(this) );

            $( "[data-toggle='tooltip']" ).tooltip("destroy");
            $( "[data-toggle='tooltip']" ).tooltip();

            $("td > button.carrello").unbind( "click" );
            $("td > button.carrello").click( this.oggettoInCarrello.bind(this) );
        },

        erroreDataTable: function ( e, settings )
        {
            if( !settings.jqXHR || !settings.jqXHR.responseText )
            {
                console.log("DataTable error:",e, settings);
                return false;
            }

            var real_error = settings.jqXHR.responseText.replace(/^([\S\s]*?)\{"[\S\s]*/i,"$1");
            real_error = real_error.replace("\n","<br>");
            Utils.showError(real_error);
        },

        renderCaratteristiche: function ( data, type, row )
        {
            var text_color_energia = "yellow",
                text_color_volume = "yellow",
                caret_energia = "left",
                caret_volume = "left";

            if (parseInt(row.energia_componente) > 0)
            {
                text_color_energia = "green";
                caret_energia = "up";
            }
            else if (parseInt(row.energia_componente) < 0)
            {
                text_color_energia = "red";
                caret_energia = "down";
            }

            if (parseInt(row.volume_componente) > 0)
            {
                text_color_volume = "green";
                caret_volume = "up";
            }
            else if (parseInt(row.volume_componente) < 0)
            {
                text_color_volume = "red";
                caret_volume = "down";
            }

            return "<span class='description-percentage text-"+text_color_energia+"'><i class='fa fa-caret-"+caret_energia+"'></i></span> Enerigia ("+row.energia_componente+")</span><br>" +
                   "<span class='description-percentage text-"+text_color_volume+"'><i class='fa fa-caret-"+caret_volume+"'></i></span> Volume ("+row.volume_componente+")</span>";
        },

        renderVariazioni: function ( data, type, row )
        {
            var variazione = 0,
                caret      = "left",
                text_color = "yellow";

            if ( row.costo_vecchio_componente && parseInt(row.costo_vecchio_componente) !== 0 )
                variazione = ( ( parseInt( row.costo_attuale_componente ) - parseInt( row.costo_vecchio_componente ) ) / parseInt( row.costo_vecchio_componente ) ) * 100;
            else
                variazione = 100;

            if ( variazione > 0 )
            {
                caret      = "up";
                text_color = "red";
            }
            else if ( variazione < 0 )
            {
                caret      = "down";
                text_color = "green";
            }

            return "<span class='description-percentage text-"+text_color+"'>" +
                      "<i class='fa fa-caret-"+caret+"'></i> " + variazione.toFixed(2) + " %</span>";
        },

        renderAzioni: function ( data, type, row )
        {
            var pulsanti = "";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default carrello' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Aggiungi al Carrello'><i class='fa fa-cart-plus'></i></button>";

            return pulsanti;
        },

        impostaTabellaTecnico: function()
        {
            var columns = [];

            columns.push({
                title: "ID",
                data: "id_componente"
            });
            columns.push({
                title: "Tipo",
                data: "tipo_componente"
            });
            columns.push({
                title: "Nome",
                data : "nome_componente"
            });
            columns.push({
                title: "Descrizione",
                data : "descrizione_componente"
            });
            columns.push({
                title: "Caratteristiche",
                render : this.renderCaratteristiche.bind(this),
                orderable: false
            });
            columns.push({
                title: "Costo",
                data : "costo_attuale_componente"
            });
            columns.push({
                title: "Variazioni",
                render : this.renderVariazioni.bind(this),
                orderable: false
            });
            columns.push({
                title: "Azioni",
                render : this.renderAzioni.bind(this),
                orderable: false
            });

            this.tabella_tecnico = $( '#tabella_tecnico' )
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
                            Constants.API_GET_COMPONENTI_BASE,
                            "GET",
                            $.extend( data, { tipo: "tecnico" } ),
                            callback
                        );
                    },
                    columns    : columns,
                    order      : [[0, 'asc']]
                } );
        },

        impostaTabellaChimico: function()
        {
            var columns = [];

            columns.push({
                title: "ID",
                data: "id_componente"
            });
            columns.push({
                title: "Tipo",
                data: "tipo_componente"
            });
            columns.push({
                title: "Nome",
                data : "nome_componente"
            });
            columns.push({
                title: "Descrizione",
                data : "descrizione_componente"
            });
            columns.push({
                title: "Val Curativo &#8544;",
                data : "curativo_primario_componente"
            });
            columns.push({
                title: "Val Tossico &#8544;",
                data : "tossico_primario_componente",
                type : "num"
            });
            columns.push({
                title: "Val Psicotropo &#8544;",
                data : "psicotropo_primario_componente",
                type : "num"
            });
            columns.push({
                title: "Val Curativo &#8545;",
                data : "curativo_secondario_componente",
                type : "num"
            });
            columns.push({
                title: "Val Tossico &#8545;",
                data : "tossico_secondario_componente",
                type : "num"
            });
            columns.push({
                title: "Val Psicotropo &#8545;",
                data : "psicotropo_secondario_componente",
                type : "num"
            });
            columns.push({
                title: "Costo",
                data : "costo_attuale_componente",
                type : "num"
            });
            columns.push({
                title: "Azioni",
                render : this.renderAzioni.bind(this),
                orderable: false
            });

            this.tabella_chimico = $( '#tabella_chimico' )
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
                            Constants.API_GET_COMPONENTI_BASE,
                            "GET",
                            $.extend( data, { tipo: "chimico" } ),
                            callback
                        );
                    },
                    columns    : columns,
                    order      : [[0, 'asc']]
                } );
        },

        pageResize: function()
        {
            $("#box_carrello").width($("#box_carrello").parent().width());
        },

        setListeners: function()
        {
            $(window).resize(this.pageResize.bind(this));
            $("#paga").click(this.paga.bind(this));
            $("#riga_credito").find("td:nth-child(2)").mousedown(this.mostraCreditoResiduo.bind(this));
            $("#riga_credito").find("td:nth-child(2)").mouseup(this.nascondiCreditoResiduo.bind(this));
        }
    };
}();

$(function () {
    MarketplaceManager.init();
});

