var CreditManager = function ()
{
	return {

		init: function ( )
		{
            //TODO: mettere pulsanti per aumentare e diminure il valore a causa di cel che non fanno inserire numeri negativi
            this.modal_selector = "#modal_modifica_credito";
            this.setListeners();
		},

		impostaModal: function ( settings )
		{
            this.settings = settings;
            this.risettaValori();
            this.impostaValori();
		},

        inviaRichiestaAssegna: function ()
		{
            if( parseInt($(this.modal_selector).find("#offset_crediti").val(), 10) < 0 )
            {
                Utils.showError("Per rimuovere dei Bit far fare un bonifico al pg.");
                return false;
            }

            Utils.requestData(
                Constants.API_POST_TRANSAZIONE_MOLTI,
                "POST",
                {
                    importo      : $(this.modal_selector).find("#offset_crediti").val(),
                    note         : "Accredito a vostro favore.",
                    creditori    : this.settings.pg_ids
                },
                "Credito modificato con successo.",
                null,
                this.settings.onSuccess
            );
		},

        impostaValori: function ()
		{
            $(this.modal_selector).find("#nome_personaggi").text(this.settings.nome_personaggi.join(", "));
            $(this.modal_selector).modal({drop:"static"});
		},

        risettaValori: function ()
		{
            $(this.modal_selector).find("#btn_modifica").attr("disabled",false).find("i").remove();
            $(this.modal_selector).find("#nome_personaggi").html("");
            $(this.modal_selector).find("#offset_crediti").val(0);
		},

		setListeners: function ()
		{
            $(this.modal_selector).find("#btn_modifica").unbind("click",this.inviaRichiestaAssegna.bind(this));
            $(this.modal_selector).find("#btn_modifica").click(this.inviaRichiestaAssegna.bind(this));

            if ( Utils.isDeviceMobile() )
            {
                $("#modal_modifica_credito").find(".pulsantiera-mobile").removeClass("inizialmente-nascosto");
                new PulsantieraNumerica({
                    target : $("#modal_modifica_credito").find("#offset_crediti"),
                    pulsantiera : $("#modal_modifica_credito").find("#pulsanti_credito")
                });
            }
		}
	}
}();

$(function () {
    CreditManager.init();
});