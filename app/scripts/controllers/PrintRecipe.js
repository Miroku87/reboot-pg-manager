var PrintSignedTable = function ()
{
    var CARTELLINI_PER_PAG = 6,
        ICONE = {
            "Programmazione" : "fa-qrcode",
            "Tecnico" : "fa-wrench",
            "Chimico" : "fa-flask"
        };

	return {

		init: function ()
		{
			this.setListeners();
            this.recuperaInfoIscritti();
		},

        riempiCartellini: function ( data )
		{
            var ricette = data.result,
                num_pagine = ricette.length / CARTELLINI_PER_PAG;

            for( var p = 0; p < num_pagine; p++ )
            {
                var pagina = $("#page_template").clone();
                pagina.attr("id",null);

                for( var c = 0; c < CARTELLINI_PER_PAG; c++ )
                {
                    var i = ( CARTELLINI_PER_PAG * p ) + c;

                    if( ricette[i] )
                    {
                        var cartellino = $("#cartellino_template").clone(),
                            unico_ricetta = ricette[i].id_unico_risultato ? ricette[i].tipo_ricetta.substr(0,1).toUpperCase() + Utils.pad( ricette[i].id_unico_risultato, Constants.ID_RICETTA_PAG ) : "";

                        cartellino.attr("id",null);

                        cartellino.find( ".unico_ricetta" ).text(unico_ricetta);
                        cartellino.find( ".icona" ).html("<i class='fa "+ICONE[ricette[i].tipo_ricetta]+"'></i>");

                        for( var r in ricette[i] )
                        {
                            var text = Utils.unStripHMTLTag(decodeURIComponent(ricette[i][r])),
                                text = text === "null" ? "" : text;
                            cartellino.find("." + r)
                                      .html( cartellino.find("." + r).html() + text );
                        }

                        pagina.append(cartellino);
                    }
                    else
                        break;
                }

                $("#container").append(pagina);
                $("#container").append("<div class='page-break'></div>");
            }
		},

        recuperaInfoIscritti: function ()
		{
            Utils.requestData(
                Constants.API_GET_RICETTE_CON_ID,
                "GET",
                {ids: JSON.parse(window.localStorage.getItem("ricette_da_stampare"))},
                this.riempiCartellini.bind(this)
            );
		},

		setListeners: function ()
		{

		}
	}
}();
$(function ()
{
    PrintSignedTable.init();
});

