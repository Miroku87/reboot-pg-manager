var MarketplaceManager = function ()
{
    return {
        init: function ()
        {
            $("#box_carrello").width($("#box_carrello").parent().width());
            $("#box_carrello").css("max-height",$(".content-wrapper").height() - 41 - 51 - 20);

            this.setListeners();
            this.impostaTabella();
        },

        oggettoInCarrello: function ( e )
        {
            var t           = $(e.target),
                dati        = this.tabella_prodotti.row( t.parents("tr") ).data(),
                id_prodotto = dati.id_componente,
                costo       = parseInt( dati.costo_attuale_componente, 10 ),
                vecchio_tot = parseInt( $("#riga_totale > td:last-child").text(), 10 ) || 0,
                riga_car    = $("#carrello").find("#"+id_prodotto);

            if( riga_car.length === 0 )
            {
                var riga = $("<tr></tr>");
                riga.attr("id",id_prodotto)
                riga.append("<td>"+id_prodotto+"</td>");
                riga.append("<td>1</td>");
                riga.append("<td>"+costo+"</td>");
                riga.hide();

                $("#riga_totale").before(riga);
                riga.show(500);
            }
            else
            {
                var qta = parseInt( riga_car.find("td:nth-child(2)").text(), 10 ) + 1;
                riga_car.hide();
                riga_car.find("td:nth-child(2)").text( qta );
                riga_car.find("td:nth-child(3)").text( costo * qta );
                $("#riga_totale").before(riga_car);
                riga_car.show(500);
            }

            $("#riga_totale > td:last-child").text( vecchio_tot + costo );
        },

        setGridListeners: function ()
        {
            AdminLTEManager.controllaPermessi();

            $( "td [data-toggle='popover']" ).popover("destroy");
            $( "td [data-toggle='popover']" ).popover();

            //$( 'input[type="checkbox"]' ).iCheck("destroy");
            //$( 'input[type="checkbox"]' ).iCheck( { checkboxClass : 'icheckbox_square-blue' } );
            //$( 'input[type="checkbox"]' ).on( "ifChanged", this.ricettaSelezionata.bind(this) );

            $( "[data-toggle='tooltip']" ).tooltip();

            $("td > button.carrello").unbind( "click", this.oggettoInCarrello.bind(this) );
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

        impostaTabella: function()
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

            this.tabella_prodotti = $( '#mercato' )
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

        pageResize: function()
        {
            $("#box_carrello").width($("#box_carrello").parent().width());
        },

        setListeners: function()
        {
            $(window).resize(this.pageResize.bind(this))
        }
    };
}();

$(function () {
    MarketplaceManager.init();
});

