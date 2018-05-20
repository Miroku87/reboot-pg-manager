var PrintSignedTable = function ()
{
    var ICONE = {
            "Programmazione" : "fa-qrcode",
            "Tecnico" : "fa-wrench",
            "Chimico" : "fa-flask",
            "tecnico" : "fa-wrench",
            "chimico" : "fa-flask"
        },
        BIOSTRUTTURE = ["cerotto","fiala","solido"];

	return {

		init: function ()
		{
			this.setListeners();
            this.recuperaInfoCartellini();
		},

        stampaPagina: function ()
		{
			if( this.costa_si_stampa === "ricette" )
            {
                Utils.requestData(
                    Constants.API_POST_RICETTE_STAMPATE,
                    "POST",
                    { ids: this.id_ricette },
                    window.print
                );
            }
		},

        creaCartellinoGenerico: function ( ricetta, template )
        {
            var cartellino = template.clone();

            cartellino.attr( "id", null );
            cartellino.removeClass("template");
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

            if( ricetta.tipo_oggetto && ricetta.tipo_oggetto.toLowerCase().indexOf("protesi") !== -1 )
                cartellino.text( cartellino.text() + "<br><br>FCC: " + ricette[i].fcc_componente );

            return cartellino;
        },

        creaCartellinoProgrammazione: function ( ricetta )
        {
            var cartellino = $("#cartellino_programma_template").clone(),
                unico_ricetta = ricetta.id_unico_risultato_ricetta !== null ?
                                    ricetta.tipo_ricetta.substr(0,1).toUpperCase() + Utils.pad( ricetta.id_unico_risultato_ricetta, Constants.ID_RICETTA_PAG ) :
                                    "";

            cartellino.attr( "id", null );
            cartellino.removeClass("template");
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

        creaCartellinoComponenteTecnico: function ( componente, template )
        {
            var cartellino = template.clone();

            cartellino.attr( "id", null );
            cartellino.removeClass("template");
            cartellino.find( ".icona" ).html("<i class='fa "+ICONE[componente.tipo_crafting_componente]+"'></i>");

            for( var c in componente )
            {
                if( componente[c] === null )
                    continue;

                var text = Utils.unStripHMTLTag(decodeURIComponent(componente[c])),
                    text = text === "null" ? "" : text;

                cartellino
                    .find("." + c)
                    .html( cartellino.find("." + c).html() + text );
            }

            return cartellino;
        },

        creaCartellinoComponente: function ( componente, template )
        {
            var cartellino = template.clone();

            cartellino.attr( "id", null );
            cartellino.removeClass("template");
            cartellino.find( ".icona" ).html("<i class='fa "+ICONE[componente.tipo_crafting_componente]+"'></i>");

            for( var c in componente )
            {
                if( componente[c] === null )
                    continue;

                var text = Utils.unStripHMTLTag(decodeURIComponent(componente[c])),
                    text = text === "null" ? "" : text;

                cartellino
                    .find("." + c)
                    .html( cartellino.find("." + c).html() + text );
            }

            return cartellino;
        },

        riempiCartelliniRicette: function ( data )
		{
            var ricette = data.result,
                num_pagine = ricette.length / Constants.CARTELLINI_PER_PAG;

            window.localStorage.removeItem("ricette_da_stampare");

            for( var p = 0; p < num_pagine; p++ )
            {
                var pagina = $("#page_template").clone();
                pagina.attr("id",null);
                pagina.removeClass("template");

                for( var c = 0; c < Constants.CARTELLINI_PER_PAG; c++ )
                {
                    var i = ( Constants.CARTELLINI_PER_PAG * p ) + c;

                    if( ricette[i] )
                    {
                        var cartellino = {};

                        //Programmazione, Tecnico, Chimico
                        if( ricette[i].tipo_ricetta === "Programmazione" )
                            cartellino = this.creaCartellinoProgrammazione( ricette[i] );
                        else if( ricette[i].tipo_ricetta === "Tecnico" )
                            cartellino = this.creaCartellinoGenerico( ricette[i], $("#cartellino_oggetto_template") );
                        else
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

        riempiCartelliniComponenti: function ( data )
		{
            var info_componenti = JSON.parse( window.localStorage.getItem("componenti_da_stampare") ),
                dati_componenti = data.result,
                num_pagine = info_componenti.length / Constants.CARTELLINI_PER_PAG;

            window.localStorage.removeItem("componenti_da_stampare");

            for( var p = 0; p < num_pagine; p++ )
            {
                var pagina = $("#page_template").clone();
                pagina.attr("id",null);
                pagina.removeClass("template");

                for( var c = 0; c < Constants.CARTELLINI_PER_PAG; c++ )
                {
                    var i = ( Constants.CARTELLINI_PER_PAG * p ) + c;

                    if( info_componenti[i] )
                    {
                        var indice     = Utils.indexOfArrayOfObjects(dati_componenti,"id_componente",info_componenti[i]),
                            componente = dati_componenti[ indice ],
                            cartellino = {};

                        //Programmazione, Tecnico, Chimico
                        if( componente.tipo_crafting_componente === "tecnico" )
                            cartellino = this.creaCartellinoComponente( componente, $("#cartellino_componente_tecnico_template") );
                        else if( componente.tipo_crafting_componente === "chimico" )
                        {
                            cartellino = this.creaCartellinoComponente(componente, $("#cartellino_componente_chimico_template"));
                            if( BIOSTRUTTURE.indexOf( componente.tipo_componente ) !== -1 )
                                cartellino.find(".proprieta_componente").remove();
                        }

                        pagina.append(cartellino);
                    }
                    else
                        break;
                }

                $("#container").append(pagina);
                $("#container").append("<div class='page-break'></div>");
            }

            if( window.top.stampa_subito )
                setTimeout( window.print, 1000 );
		},

        recuperaInfoCartellini: function ()
		{
            if( window.localStorage.getItem("ricette_da_stampare") )
            {
                this.costa_si_stampa = "ricette";
                this.id_ricette = JSON.parse(window.localStorage.getItem("ricette_da_stampare"));
                Utils.requestData(
                    Constants.API_GET_RICETTE_CON_ID,
                    "GET",
                    {ids : this.id_ricette},
                    this.riempiCartelliniRicette.bind(this)
                );
            }
            else if( window.localStorage.getItem("componenti_da_stampare") )
            {
                this.costa_si_stampa = "componenti";
                Utils.requestData(
                    Constants.API_GET_COMPONENTI_CON_ID,
                    "GET",
                    {ids : JSON.parse(window.localStorage.getItem("componenti_da_stampare"))},
                    this.riempiCartelliniComponenti.bind(this)
                );
            }
		},

		setListeners: function ()
		{
            $("#stampa").click(this.stampaPagina.bind(this));
		}
	}
}();
$(function ()
{
    PrintSignedTable.init();
});

