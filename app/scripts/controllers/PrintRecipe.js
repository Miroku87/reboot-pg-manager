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

        creaCartellinoChimico: function ( ricetta )
        {

        },

        creaCartellinoTecnico: function ( ricetta )
        {

        },

        creaCartellinoProgrammazione: function ( ricetta )
        {
            var cartellino = $("#cartellino_programma_template").clone(),
            unico_ricetta = ricetta.id_unico_risultato ? ricetta.tipo_ricetta.substr(0,1).toUpperCase() + Utils.pad( ricetta.id_unico_risultato, Constants.ID_RICETTA_PAG ) : "";

            cartellino.attr("id",null);

            cartellino.find( ".unico_ricetta" ).text(unico_ricetta);
            cartellino.find( ".icona" ).html("<i class='fa "+ICONE[ricetta.tipo_ricetta]+"'></i>");

            for( var r in ricetta )
            {
                var text = Utils.unStripHMTLTag(decodeURIComponent(ricetta[r])),
                    text = text === "null" ? "" : text;

                cartellino.find("." + r)
                          .html( cartellino.find("." + r).html() + text );
            }

            return cartellino;
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
                        var cartellino = {};

                        //Programmazione, Tecnico, Chimico
                        if( ricette[i].tipo_ricetta === "Programmazione" )
                            cartellino = this.creaCartellinoProgrammazione( ricette[i] );
                        else if( ricette[i].tipo_ricetta === "Tecnico" )
                            cartellino = this.creaCartellinoTecnico( ricette[i] );
                        else if( ricette[i].tipo_ricetta === "Chimico" )
                            cartellino = this.creaCartellinoChimico( ricette[i] );

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

