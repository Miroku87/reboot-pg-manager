var BankManager = function ()
{
	return {

		init: function ()
		{
            this.pg_info = JSON.parse( window.localStorage.getItem("logged_pg") );
            this.placeholder_credito = 'XXXX <i class="fa fa-eye"></i>';
            this.movimenti = 0;

			this.setListeners();
			this.recuperaInfoBanca();
			this.impostaGrigliaMovimenti();
		},

        bonificoOk: function ()
		{
            this.griglia_movimenti.ajax.reload(null,true);
            this.recuperaInfoBanca();
		},

        controllaMovimenti: function ()
		{
            this.movimenti++;

            if( this.movimenti === 2 )
            {
                this.movimenti = 0;
                Utils.showMessage("Bonifico eseguito con successo.",this.bonificoOk.bind(this));
            }
		},

        modificaCrediti: function ()
		{
            Utils.requestData(
                Constants.API_POST_EDIT_PG,
                "POST",
                {
                    pgid: this.pg_info.id_personaggio,
                    modifiche: { credito_personaggio: Math.abs(parseInt($("#offset_crediti").val(),10)) * -1 },
                    offset: true
                },
                this.controllaMovimenti.bind(this)
            );

            Utils.requestData(
                Constants.API_POST_EDIT_PG,
                "POST",
                {
                    pgid: this.id_creditore,
                    modifiche: { credito_personaggio: Math.abs(parseInt($("#offset_crediti").val(),10)) },
                    offset: true
                },
                this.controllaMovimenti.bind(this)
            );
		},

        inviaBonifico: function ( e )
		{
            //$id_debitore, $importo, $id_creditore = NULL, $note = NULL, $id_acq_comp = NULL
            Utils.requestData(
                Constants.API_POST_TRANSAZIONE,
                "POST",
                {
                    id_debitore  : this.pg_info.id_personaggio,
                    importo      : Math.abs(parseInt($("#offset_crediti").val(),10)),
                    id_creditore : this.id_creditore,
                    note         : $("#causale").val()
                },
                this.modificaCrediti.bind(this)
            );
		},

        confermaInvioBonifico: function ( e )
		{
            Utils.showConfirm( "Conferma il bonifico", this.inviaBonifico.bind(this), true );
		},

        mostraModalBonifico: function ( e )
		{
            $("#modal_bonifico").find("#personaggio").val("");
            $("#modal_bonifico").find("#causale").val("");
            $("#modal_bonifico").find("#offset_crediti").val(0);
            $("#modal_bonifico").modal({drop:"static"});
		},

        pgSelezionato: function ( event, ui )
        {
            this.id_creditore = ui.item.real_value;
        },

        scrittoSuPg: function ( e, ui )
        {
            if( $(e.target).val().substr(0,1) === "#" )
                this.id_creditore = $(e.target).val().substr(1);
        },

        recuperaPgAutofill: function ( req, res )
        {
            Utils.requestData(
                Constants.API_GET_DESTINATARI_IG,
                "GET",
                { term : req.term },
                function( data )
                {
                    res( data.results );
                }
            );
        },

        mostraCredito: function ( e )
		{
            var t = $(e.target);
            if( this.info )
                t.html( this.info[t.parents(".box-saldo").attr("id")] + " <i class='fa fa-btc'></i>" );
		},

        nascondiCredito: function ( )
		{
            $(".saldo").html(this.placeholder_credito);
		},

        infoBancaRecuperate: function ( data )
		{
            this.info = {
                totale           : data.result.credito_personaggio,
                entrate_corrente : data.result.entrate_anno_personaggio,
                uscite_corrente  : data.result.uscite_anno_personaggio
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
            $(document).mouseup(this.nascondiCredito.bind(this));
            $("#btn_bonifico").mouseup(this.mostraModalBonifico.bind(this));
            $("#btn_invia").mouseup(this.confermaInvioBonifico.bind(this));

            if ( Utils.isDeviceMobile() )
            {
                $("#modal_bonifico").find(".pulsantiera-mobile").removeClass("inizialmente-nascosto");
                new PulsantieraNumerica({
                    target      : $("#modal_bonifico").find("#offset_crediti"),
                    pulsantiera : $("#modal_bonifico").find("#pulsanti_credito")
                });
            }

            $("#personaggio").autocomplete({
                autoFocus : true,
                select : this.pgSelezionato.bind(this),
                search : this.scrittoSuPg.bind(this),
                source : this.recuperaPgAutofill.bind(this),
                appendTo: ".scelta-pg"
            });
		}
	}
}();

$(function () {
    BankManager.init();
});