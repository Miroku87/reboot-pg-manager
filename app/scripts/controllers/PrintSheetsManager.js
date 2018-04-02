var PrintSheetsManager = function ()
{
    var CARTELLINI_PER_PAG = 6;

	return {

		init: function ()
		{
			this.setListeners();
            this.recuperaInfoCartellini();
		},

        riempiCartellini: function ( data )
		{
            var pgs = data.data,
                num_pagine = pgs.length / CARTELLINI_PER_PAG;

            for( var p = 0; p < num_pagine; p++ )
            {
                var pagina = $("#page_template").clone();
                pagina.attr("id",null);

                for( var c = 0; c < CARTELLINI_PER_PAG; c++ )
                {
                    var i = ( CARTELLINI_PER_PAG * p ) + c;

                    if( pgs[i] )
                    {
                        var cartellino = $("#cartellino_template").clone();

                        cartellino.find(".giocatore").text( pgs[i].nome_giocatore );
                        cartellino.find(".pg-id").text( Utils.pad( pgs[i].id_personaggio ) );
                        cartellino.find(".pg-nome").text( pgs[i].nome_personaggio );
                        cartellino.find(".pg-anno").text( pgs[i].anno_nascita_personaggio );
                        cartellino.find(".pg-pf").text( Utils.pad( pgs[i].pf_personaggio ) );
                        cartellino.find(".pg-ps").text( Utils.pad( pgs[i].shield_personaggio ) );
                        cartellino.find(".pg-mente").text( Utils.pad( pgs[i].mente_personaggio, 4 ) );
                        cartellino.find(".pg-pc").text( Utils.pad( pgs[i].pc_risparmiati, 4 ) + "/" + Utils.pad( pgs[i].pc_personaggio, 4 ) );
                        cartellino.find(".pg-px").text( Utils.pad( pgs[i].px_risparmiati, 4 ) + "/" + Utils.pad( pgs[i].px_personaggio, 4 ) );
                        cartellino.find(".lista-classi-civili").text( pgs[i].classi_civili || "" );
                        cartellino.find(".lista-classi-militari").text( pgs[i].classi_militari || "" );
                        cartellino.find(".lista-abilita-civili").text( pgs[i].abilita_civili || "" );
                        cartellino.find(".lista-abilita-militari").text( pgs[i].abilita_militari || "" );
                        cartellino.attr("id",null);

                        new QRCode( cartellino.find(".qr-code")[0], {
                            text: "PG-"+pgs[i].id_personaggio,
                            width: 75,
                            height: 75,
                            colorLight : "white",
                            correctLevel : QRCode.CorrectLevel.H
                        } );
                        pagina.append(cartellino);
                    }
                    else
                        break;
                }

                $("#container").append(pagina);
                $("#container").append("<div class='page-break'></div>");
            }
		},

        recuperaInfoCartellini: function ()
		{
            Utils.requestData(
                Constants.API_GET_PGS_CON_ID,
                "GET",
                {ids: JSON.parse(window.localStorage.getItem("da_stampare"))},
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
    PrintSheetsManager.init();
});

