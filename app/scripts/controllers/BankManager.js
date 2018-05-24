var BankManager = function ()
{
	return {

		init: function ()
		{
            this.pg_info = JSON.parse( window.localStorage.getItem("logged_pg") );
            this.placeholder_credito = 'XXXX <i class="fa fa-eye"></i>';

			this.setListeners();
			this.recuperaInfoBanca();
			this.impostaGrigliaMovimenti();
		},

        mostraCredito: function ()
		{
            if( this.info )
                $(".saldo").html( this.info[$(this).parents(".box-saldo")] );
		},

        nascondiCredito: function ()
		{
            $(this).html(this.placeholder_credito);
		},

        infoBancaRecuperate: function ( data )
		{
            this.info = {
                totale           : this.bank_info.credito_personaggio,
                entrate_corrente : this.bank_info.entrate_anno_personaggio,
                uscite_corrente  : this.bank_info.uscite_anno_personaggio
            };
		},

        recuperaInfoBanca: function ()
		{
            Utils.requestData(
                Constants.API_GET_INFO_BANCA,
                "GET",
                { },
                this.infoBancaRecuperate.bind(this)
            );
		},

        renderTipoMovimento: function ( data, type, row )
		{
            return data;
		},

        impostaGrigliaMovimenti: function ()
		{
            var columns = [];

            columns.push({
                title: "Tipo",
                data: "tipo_transazione",
                render: this.renderTipoMovimento.bind(this)
            });
            columns.push({
                title: "Data",
                data: "datait_transazione"
            });
            columns.push({
                title: "Beneficiario",
                data : "nome_creditore"
            });
            columns.push({
                title: "Importo",
                data : "importo_transazione"
            });
            columns.push({
                title: "Descrizione",
                data : "note_transazione"
            });

            this.griglia_movimenti = $( '#movimenti' )
                //.on("error.dt", this.erroreDataTable.bind(this) )
                //.on("draw.dt", this.setGridListeners.bind(this) )
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
                            Constants.API_GET_MOVIMENTI,
                            "GET",
                            data,
                            callback
                        );
                    },
                    columns    : columns,
                    order      : [[1, 'desc']]
                } );
		},

		setListeners: function ()
		{
            $(".saldo").mousedown(this.mostraCredito.bind(this));
            $(".saldo").mouseup(this.nascondiCredito.bind(this));
		}
	}
}();

$(function () {
    BankManager.init();
});