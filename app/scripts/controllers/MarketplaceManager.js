var MarketplaceManager = function ()
{
    return {
        init: function ()
        {
            this.setListeners();
            this.impostaTabella();
        },

        setGridListeners: function ()
        {
            /*AdminLTEManager.controllaPermessi();

            $( "td [data-toggle='popover']" ).popover("destroy");
            $( "td [data-toggle='popover']" ).popover();

            $( 'input[type="checkbox"]' ).iCheck("destroy");
            $( 'input[type="checkbox"]' ).iCheck( { checkboxClass : 'icheckbox_square-blue' } );
            $( 'input[type="checkbox"]' ).on( "ifChanged", this.ricettaSelezionata.bind(this) );

            $( "[data-toggle='tooltip']" ).tooltip();

            $("button.modifica-note").unbind( "click", this.mostraModalRicetta.bind(this) );
            $("button.modifica-note").click( this.mostraModalRicetta.bind(this) );*/
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
                title: "Descrizione",
                data : "descrizione_componente"
            });
            columns.push({
                title: "Caratteristiche",
                render : this.renderCaratteristiche.bind(this)
            });
            columns.push({
                title: "Costo",
                data : "costo_attuale_componente"
            });
            columns.push({
                title: "Variazioni",
                render : this.renderVariazioni.bind(this)
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
                    order      : [[0, 'desc']]
                } );
        },

        setListeners: function()
        {

        }
    };
}();

$(function () {
    MarketplaceManager.init();
});

