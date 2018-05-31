var PrintSignedTable = function ()
{
	return {

		init: function ()
		{
			this.setListeners();
            this.recuperaInfoIscritti();
		},

        ordinaDati: function(a, b)
        {
            var A = a.nome_completo.toUpperCase(),
                B = b.nome_completo.toUpperCase();

            if (A < B)
                return -1;

            if (A > B)
                return 1;

            return 0;
        },

        riempiTabella: function ( data )
		{
            var pgs = data.data;

            pgs = pgs.sort(this.ordinaDati);

            for( var i in pgs )
            {
                if( pgs[i] )
                {
                    var tr = $("<tr></tr>");

                    tr.append( $("<td></td>").html( "&#9744;" ) );
                    tr.append( $("<td></td>").text( pgs[i].nome_completo ) );
                    tr.append( $("<td></td>").text( pgs[i].personaggi_id_personaggio ) );
                    tr.append( $("<td></td>").text( pgs[i].nome_personaggio ) );
                    tr.append( $("<td></td>").html( pgs[i].pagato_iscrizione === "1" ? "&#9745;" : "&#9744;" ) );
                    tr.append( $("<td></td>").text( pgs[i].tipo_pagamento_iscrizione ) );
                    tr.append( $("<td></td>").html( !pgs[i].note_iscrizione ? "" : pgs[i].note_iscrizione ) );
                    tr.append( $("<td></td>").html( !pgs[i].note_giocatore ? "" : pgs[i].note_giocatore ) );

                    $("#info_iscritti").find("tbody").append(tr);
                }
            }

            for( var j = 0; j < 5; j++ )
            {
                var tr = $("<tr></tr>");

                tr.append( $("<td></td>").html( "&#9744;" ) );
                tr.append( $("<td></td>").html("&nbsp;") );
                tr.append( $("<td></td>").html("&nbsp;") );
                tr.append( $("<td></td>").html("&nbsp;") );
                tr.append( $("<td></td>").html( "&#9744;" ) );
                tr.append( $("<td></td>").html("&nbsp;") );
                tr.append( $("<td></td>").html("&nbsp;") );
                tr.append( $("<td></td>").html("&nbsp;") );

                $("#info_iscritti").find("tbody").append(tr);
            }
		},

        recuperaInfoIscritti: function ()
		{
            Utils.requestData(
                Constants.API_GET_INFO_ISCRITTI_AVANZATE,
                "GET",
                "draw=1&columns=&order=&start=0&length=999&search=&quando=prossimo",
                this.riempiTabella.bind(this)
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

