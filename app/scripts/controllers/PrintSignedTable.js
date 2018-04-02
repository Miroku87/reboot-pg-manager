var PrintSignedTable = function ()
{
	return {

		init: function ()
		{
			this.setListeners();
            this.recuperaInfoIscritti();
		},

        riempiTabella: function ( data )
		{
            var pgs = data.data;

            for( var i in pgs )
            {
                if( pgs[i] )
                {
                    var tr = $("<tr></tr>");

                    tr.append( $("<td></td>").text( pgs[i].nome_completo ) );
                    tr.append( $("<td></td>").text( pgs[i].personaggi_id_personaggio ) );
                    tr.append( $("<td></td>").text( pgs[i].nome_personaggio ) );
                    tr.append( $("<td></td>").html( pgs[i].pagato_iscrizione === "1" ? "&#9745;" : "&#9744;" ) );
                    tr.append( $("<td></td>").text( pgs[i].tipo_pagamento_iscrizione ) );
                    tr.append( $("<td></td>").text( pgs[i].note_iscrizione ) );

                    $("#info_iscritti").find("tbody").append(tr);
                }
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

