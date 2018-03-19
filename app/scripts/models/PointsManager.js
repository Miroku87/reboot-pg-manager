var PointsManager = function ()
{
	return {

		init: function ( )
		{
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
                        pc_personaggio: $("#modal_assegna_punti").find("#offset_pc").val(),
                        px_personaggio: $("#modal_assegna_punti").find("#offset_px").val()
                    },
                    is_offset : true
                },
                "Punti modificati con successo.",
                null,
                this.settings.onSuccess
            );
		},

        impostaValori: function ()
		{
            $("#modal_assegna_punti").find("#nome_personaggi").text(this.settings.nome_personaggi.join(", "));
            $("#modal_assegna_punti").modal({drop:"static"});
		},

        risettaValori: function ()
		{
            $("#modal_assegna_punti").find("#btn_assegna").attr("disabled",false).find("i").remove();
            $("#modal_assegna_punti").find("#nome_personaggi").html("");

            $("#modal_assegna_punti").find("#offset_pc").val(0);
            $("#modal_assegna_punti").find("#offset_px").val(0);
		},

		setListeners: function ()
		{
            $("#modal_assegna_punti").find("#btn_assegna").unbind("click",this.inviaRichiestaAssegna.bind(this));
            $("#modal_assegna_punti").find("#btn_assegna").click(this.inviaRichiestaAssegna.bind(this));
		}
	}
}();

$(function () {
    PointsManager.init();
});