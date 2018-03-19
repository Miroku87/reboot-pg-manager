var CreditManager = function ()
{
	return {

		init: function ( )
		{
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
            Utils.requestData(
                Constants.API_POST_EDIT_MOLTI_PG,
                "POST",
                {
                    pg_ids: this.settings.pg_ids,
                    modifiche: {
                        credito_personaggio: $(this.modal_selector).find("#offset_crediti").val()
                    },
                    is_offset : true
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
		}
	}
}();

$(function () {
    CreditManager.init();
});