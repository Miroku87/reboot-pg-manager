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

        creaCartellinoGenerico: function ( ricetta, template )
        {
            var cartellino = template.clone();

            cartellino.attr( "id", null );
            cartellino.find( ".icona" ).html("<i class='fa "+ICONE[ricetta.tipo_ricetta]+"'></i>");

            for( var r in ricetta )
            {
                if( ricetta[r] === null )
                    continue;

                var text = Utils.unStripHMTLTag(decodeURIComponent(ricetta[r])),
                    text = text === "null" ? "" : text;

                text = text.replace(/;/g,"<br>");

                cartellino
                    .find("." + r)
                    .html( cartellino.find("." + r).html() + text );
            }

            return cartellino;
        },

        creaCartellinoProgrammazione: function ( ricetta )
        {
            var cartellino = $("#cartellino_programma_template").clone(),
                unico_ricetta = ricetta.id_unico_risultato_ricetta !== null ?
                                    ricetta.tipo_ricetta.substr(0,1).toUpperCase() + Utils.pad( ricetta.id_unico_risultato_ricetta, Constants.ID_RICETTA_PAG ) :
                                    "";

            console.log(ricetta.tipo_ricetta.substr(0,1).toUpperCase() + Utils.pad( ricetta.id_unico_risultato_ricetta, Constants.ID_RICETTA_PAG ));

            cartellino.attr( "id", null );
            cartellino.find( ".icona" ).html("<i class='fa "+ICONE[ricetta.tipo_ricetta]+"'></i>");
            cartellino.find( ".unico_ricetta" ).html(unico_ricetta);

            for( var r in ricetta )
            {
                if( ricetta[r] === null )
                    continue;

                var text = Utils.unStripHMTLTag(decodeURIComponent(ricetta[r])),
                    text = text === "null" ? "" : text;

                text = text.replace(/;/g,"<br>");

                cartellino
                    .find("." + r)
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
                        {
                            cartellino = this.creaCartellinoGenerico(ricette[i], $("#cartellino_oggetto_template"));
                            cartellino.find(".risultato_ricetta").html( cartellino.find(".risultato_ricetta").html() + "<br><br>FCC: " + ricette[i].fcc_componente );
                        }
                        else if( ricette[i].tipo_ricetta === "Chimico" )
                            cartellino = this.creaCartellinoGenerico( ricette[i], $("#cartellino_sostanza_template") );

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

