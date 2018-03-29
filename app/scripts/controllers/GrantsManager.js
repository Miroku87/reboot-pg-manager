/**
 * Created by Miroku on 11/03/2018.
 */
var GrantsManager = function ()
{
    return {
        init: function ()
        {
            this.user_info = JSON.parse( window.localStorage.getItem("user") );

            this.setListeners();
            this.recuperaRuoli();
            this.recuperaListaPermessi();
            this.recuperaListaPermessiDeiRuoli();
        },

        recuperaListaPermessiDeiRuoli: function()
        {

        },

        recuperaListaPermessi: function()
        {

        },

        eliminaRuolo: function( nome )
        {
            if( nome === Constants.RUOLO_ADMIN )
            {
                Utils.showError("Non puoi eliminare il ruolo "+Constants.RUOLO_ADMIN);
                return;
            }

            Utils.requestData(
                Constants.API_POST_DEL_RUOLO,
                "POST",
                { ruolo: nome, sostituto: $("#modal_nuovo_ruolo").find("select").val() },
                "Ruolo rimosso con successo."
            );
        },

        chiediNuovoRuolo: function( nome )
        {
            $('.modal').modal('hide');
            $("#modal_nuovo_ruolo").find("select").html("");

            for( var r in this.ruoli )
            {
                if( this.ruoli[r] !== nome )
                    $("#modal_nuovo_ruolo").find("select").append("<option value='"+this.ruoli[r]+"'>"+this.ruoli[r]+"</option>");
            }

            $("#modal_nuovo_ruolo").find("#ruolo_del").text(nome);
            $("#modal_nuovo_ruolo").find("#scegli_ruolo").unbind("click");
            $("#modal_nuovo_ruolo").find("#scegli_ruolo").click(this.eliminaRuolo.bind(this,nome));
            $("#modal_nuovo_ruolo").modal({drop:"static"});
        },

        confermaEliminazioneRuolo: function( e )
        {
            var t = $(e.target);
            Utils.showConfirm("Sicuro di voler eliminare questo ruolo?<br>Tutti i permessi associati verranno persi.",
                this.chiediNuovoRuolo.bind(this, t.attr("data-nome")));
        },

        mostraModalAssociazione: function( e )
        {
            var t = $(e.target);
            $("#modal_scegli_permessi").find("#ruolo_ass").text(t.attr("data-nome"));
            $("#modal_scegli_permessi").modal({drop:"static"});
        },

        tabellaPronta: function()
        {
            AdminLTEManager.controllaPermessi();

            this.setTooltip();

            $("td button.eliminaRuolo").unbind("click",this.confermaEliminazioneRuolo.bind(this));
            $("td button.eliminaRuolo").click(this.confermaEliminazioneRuolo.bind(this));

            $("td button.associaPermessi").unbind("click",this.mostraModalAssociazione.bind(this));
            $("td button.associaPermessi").click(this.mostraModalAssociazione.bind(this));

            $("td a.nome-ruolo").unbind("click",this.mostraModalAssociazione.bind(this));
            $("td a.nome-ruolo").click(this.mostraModalAssociazione.bind(this));
        },

        mostraRuoli: function( data )
        {
            var res = data.result,
                count = 0;

            this.ruoli = [];

            var elimina_btn = $("<button type='button' " +
                                    "class='btn btn-xs btn-default eliminaRuolo' " +
                                    "data-toggle='tooltip' " +
                                    "data-placement='top' " +
                                    "title='Elimina Ruolo'><i class='fa fa-trash-o'></i></button>"),
                associa_btn = $("<button type='button' " +
                                    "class='btn btn-xs btn-default inizialmente-nascosto associaPermessi recuperaPermessiDeiRuoli' " +
                                    "data-toggle='tooltip' " +
                                    "data-placement='top' " +
                                    "title='Associa Permessi'><i class='fa fa-pencil'></i></button>");

            for( var r in res )
            {
                this.ruoli.push(res[r].nome_ruolo);

                var tr = $("<tr></tr>"),
                    nome = Utils.controllaPermessi(this.user_info, ["associaPermessi","recuperaPermessiDeiRuoli"], false) ?
                                    "<a class='nome-ruolo' data-nome='"+res[r].nome_ruolo+"'>"+res[r].nome_ruolo+"</a>" : res[r].nome_ruolo,
                    azioni = $("<td></td>");

                azioni.append( associa_btn.clone().attr("data-nome",res[r].nome_ruolo) );
                azioni.append( elimina_btn.clone().attr("data-nome",res[r].nome_ruolo) );


                tr.append("<td>"+(++count)+"</td>")
                tr.append("<td>"+nome+"</td>")
                tr.append("<td>"+res[r].numero_grants+"</td>");
                tr.append( azioni );

                $("#tabella_ruoli").find("tbody").append(tr);
            }

            setTimeout( this.tabellaPronta.bind(this), 100 );
        },

        recuperaRuoli: function()
        {
            Utils.requestData(
                Constants.API_GET_RUOLI,
                "GET",
                {},
                this.mostraRuoli.bind(this)
            );
        },

        setTooltip: function()
        {
            $( "td [data-toggle='tooltip']" ).tooltip("destroy");
            $( "td [data-toggle='tooltip']" ).tooltip();
        },

        setListeners: function()
        {
            this.setTooltip();
        }
    };
}();

$(function () {
    GrantsManager.init();
});