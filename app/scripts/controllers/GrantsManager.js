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

        inserisciNuovoRuolo: function( )
        {
            var nome = $("#nome_nuovo_ruolo").val();
            Utils.requestData(
                Constants.API_POST_CREA_RUOLO,
                "POST",
                { nome: nome },
                "Il nuovo ruolo <strong>"+nome+"</strong> &egrave; stato creato correttamente.<br>Ora potrai associargli dei permessi.",
                null,
                Utils.reloadPage
            );
        },

        salvaPermessiDeiRuoli: function( data )
        {
            this.permessi_dei_ruoli = data.result;
        },

        recuperaListaPermessiDeiRuoli: function()
        {
            Utils.requestData(
                Constants.API_GET_PERMESSI_DEI_RUOLI,
                "GET",
                {},
                this.salvaPermessiDeiRuoli.bind(this)
            );

        },

        impostaModalPermessi: function( data )
        {
            var res = data.result;

            for( var r in res )
            {
                var p    = res[r],
                    tr   = $("<tr></tr>"),
                    cbox = $("<div class='checkbox icheck'>" +
                                "<input type='checkbox' " +
                                    "class='permesso-cbox' " +
                                    "name='permessi["+ p.nome_grant+"]'>" +
                           "</div>");

                tr.append( $("<td></td>").append(cbox) );
                tr.append( $("<td></td>").text(p.nome_grant) );
                tr.append( $("<td></td>").text(p.descrizione_grant) );

                $("#tabella_associazioni").find("tbody").append(tr);
            }

            $( 'input[type="checkbox"]' ).iCheck("destroy");
            $( 'input[type="checkbox"]' ).iCheck( {
                checkboxClass : 'icheckbox_square-blue'
            } );
        },

        recuperaListaPermessi: function()
        {
            Utils.requestData(
                Constants.API_GET_PERMESSI,
                "GET",
                {},
                this.impostaModalPermessi.bind(this)
            );

        },

        eliminaRuolo: function( nome )
        {
            if( nome === Constants.RUOLO_ADMIN )
            {
                Utils.showError("Non puoi eliminare il ruolo "+Constants.RUOLO_ADMIN);
                return;
            }

            var nuovo_ruolo = $("#modal_nuovo_ruolo").find("select").val();

            if( parseInt( nuovo_ruolo, 10 ) === -1 )
            {
                Utils.showError("Devi scegliere un ruolo sostitutivo");
                return;
            }

            Utils.requestData(
                Constants.API_POST_DEL_RUOLO,
                "POST",
                { ruolo: nome, sostituto: nuovo_ruolo },
                "Ruolo rimosso con successo.",
                null,
                Utils.reloadPage
            );
        },

        chiediNuovoRuolo: function( nome )
        {
            $('.modal').modal('hide');

            $("#nuovo_ruolo").find("option[value='"+nome+"']").attr("disabled",true);

            $("#modal_nuovo_ruolo").find("#ruolo_del").text(nome);
            $("#modal_nuovo_ruolo").find("#scegli_ruolo").unbind("click");
            $("#modal_nuovo_ruolo").find("#scegli_ruolo").click(this.eliminaRuolo.bind(this,nome));
            $("#modal_nuovo_ruolo").modal({drop:"static"});
        },

        confermaEliminazioneRuolo: function( e )
        {
            var t = $(e.target);

            if( t.attr("data-nome") === Constants.RUOLO_ADMIN )
            {
                Utils.showError("Non puoi eliminare il ruolo di <strong>admin</strong>");
                return;
            }

            Utils.showConfirm("Sicuro di voler eliminare questo ruolo?<br>Tutti i permessi associati verranno persi.",
                this.chiediNuovoRuolo.bind(this, t.attr("data-nome")));
        },

        spuntaCheckboxPermessi: function( ruolo )
        {
            $("#modal_scegli_permessi").find("input[type='checkbox']").prop("checked",false);
            $("#modal_scegli_permessi").find("input[type='checkbox']").iCheck('update');

            if( this.permessi_dei_ruoli[ruolo] )
            {
                for( var pdr in this.permessi_dei_ruoli[ruolo] )
                {
                    var p = this.permessi_dei_ruoli[ruolo][pdr],
                        box = $("#modal_scegli_permessi").find("input[type='checkbox'][name='permessi["+p+"]']");
                    box.prop("checked",true);
                    box.iCheck('update');
                }
            }
        },

        copiaPermessi: function( e )
        {
            var t     = $(e.target),
                ruolo = t.val();

            this.spuntaCheckboxPermessi(ruolo);
        },

        inviaAssociazioni: function( e )
        {
            var t = $(e.target),
                nome = t.attr("data-ruolo"),
                data = "ruolo="+nome+"&"+ $("#modal_scegli_permessi").find("input[type='checkbox']").serialize();

            Utils.requestData(
                Constants.API_POST_ASSOCIA_PERMESSI,
                "POST",
                data,
                "Permessi aggiornati con successo.",
                null,
                Utils.reloadPage
            );

        },

        mostraModalAssociazione: function( e )
        {
            var t = $(e.target),
                nome = t.attr("data-nome");

            if( t.attr("data-nome") === Constants.RUOLO_ADMIN )
            {
                Utils.showError("Non puoi modificare il ruolo di <strong>admin</strong>");
                return;
            }

            this.spuntaCheckboxPermessi(nome);

            $("#modal_scegli_permessi").find("#lista_ruoli_copia").val(-1);
            $("#modal_scegli_permessi").find("#lista_ruoli_copia").unbind("change");
            $("#modal_scegli_permessi").find("#lista_ruoli_copia").change( this.copiaPermessi.bind(this) );

            $("#modal_scegli_permessi").find("#invia_associazioni").attr("data-ruolo",nome);
            $("#modal_scegli_permessi").find("#invia_associazioni").unbind("click");
            $("#modal_scegli_permessi").find("#invia_associazioni").click( this.inviaAssociazioni.bind(this) );

            $("#modal_scegli_permessi").find("#ruolo_ass").text(nome);
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
                    nome = Utils.controllaPermessiUte(this.user_info, ["associaPermessi","recuperaPermessiDeiRuoli"], false) ?
                                    "<a class='nome-ruolo' data-nome='"+res[r].nome_ruolo+"'>"+res[r].nome_ruolo+"</a>" : res[r].nome_ruolo,
                    azioni = $("<td></td>");

                azioni.append( associa_btn.clone().attr("data-nome",res[r].nome_ruolo) );
                azioni.append( elimina_btn.clone().attr("data-nome",res[r].nome_ruolo) );


                tr.append("<td>"+(++count)+"</td>");
                tr.append("<td>"+nome+"</td>");
                tr.append("<td>"+res[r].numero_grants+"</td>");
                tr.append( azioni );

                $("#tabella_ruoli").find("tbody").append(tr);

                $("#nuovo_ruolo").append("<option value='"+res[r].nome_ruolo+"'>"+res[r].nome_ruolo+"</option>");
                $("#ruolo_giocatore").append("<option value='"+res[r].nome_ruolo+"'>"+res[r].nome_ruolo+"</option>");
                $("#lista_ruoli_copia").append("<option value='"+res[r].nome_ruolo+"'>"+res[r].nome_ruolo+"</option>");
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
            $("#btn_nome_nuovo_ruolo").click(this.inserisciNuovoRuolo.bind(this));
        }
    };
}();

$(function () {
    GrantsManager.init();
});