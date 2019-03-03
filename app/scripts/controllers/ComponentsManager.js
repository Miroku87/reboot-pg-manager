/**
 * Created by Miroku on 11/03/2018.
 */
var ComponentsManager = function ()
{
    return {
        init : function ()
        {
            this.componenti_selezionati = {};

            this.setListeners();
            this.impostaTabellaTecnico();
            this.impostaTabellaChimico();
        },

        resettaContatori : function (e)
        {
            var t        = $(e.currentTarget),
                table_id = t.parents(".box-body").find("table").attr("id");

            this.componenti_selezionati[table_id] = {};
            window.localStorage.removeItem("componenti_da_stampare");

            $("#" + table_id).find("input[type='number']").val(0);
        },

        stampaCartellini : function (e)
        {
            var t          = $(e.currentTarget),
                table_id   = t.parents(".box-body").find("table").attr("id"),
                componenti = this.componenti_selezionati[table_id];

            if (Object.keys(componenti).length === 0)
            {
                var tipo_comp = table_id.replace("tabella_", "");
                Utils.showError("Non è stato selezionato nessun componente " + tipo_comp + " da stampare.");
                return false;
            }

            window.localStorage.removeItem("componenti_da_stampare");
            window.localStorage.setItem("componenti_da_stampare", JSON.stringify(componenti));
            window.open(Constants.STAMPA_RICETTE, "Stampa Oggetti");
        },

        componenteSelezionato : function (e)
        {
            var t         = $(e.target),
                num       = parseInt(t.val(), 10),
                table_id  = t.parents("table").attr("id"),
                datatable = this[table_id],
                dati      = datatable.row(t.parents("tr")).data();

            if (num > 0)
                this.componenti_selezionati[table_id][dati.id_componente] = num;
            else
                delete this.componenti_selezionati[table_id][dati.id_componente];
        },

        selezionaComponente : function (e)
        {
            $("input[type='number']").val(0);

            for (var t in this.componenti_selezionati)
                for (var c in this.componenti_selezionati[t])
                    $("#ck_" + c).val(this.componenti_selezionati[t][c]);
        },

        renderAzioni : function (data, type, row)
        {
            var pulsanti = "";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default modifica' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Modifica Componente'><i class='fa fa-pencil'></i></button>";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default elimina' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Elimina Componente'><i class='fa fa-trash-o'></i></button>";

            return pulsanti;
        },

        renderCheckStampa : function (data, type, row)
        {
            return "<div class=\"input-group\">" +
                "<input type='number' min='0' step='1' value='0' class='form-control' style='width:70px' id='ck_" + row.id_componente + "'>" +
                "</div>";
        },

        componenteModificato : function ( modal, tabella )
        {
            modal.modal("hide");
            tabella.ajax.reload(null,false);
            Utils.resetSubmitBtn();
        },

        inviaModifiche : function (e)
        {
            var t        = $(e.currentTarget),
                modal    = t.parents(".modal"),
                table_id = modal.attr("id").replace("modal_modifica_componente_", ""),
                data     = Utils.getFormData(t.parents(".modal").find("form"));

            Utils.requestData(
                Constants.API_POST_EDIT_COMPONENT,
                "POST",
                { id: data.id_componente, modifiche: data },
                "Componente modificato con successo.",
                null,
                this.componenteModificato.bind( this, modal, this[table_id] )
            );
        },

        mostraModalModifica : function (e)
        {
            var t         = $(e.target),
                table_id  = t.parents("table").attr("id"),
                datatable = this[table_id],
                dati      = datatable.row(t.parents("tr")).data();

            $("#modal_modifica_componente_" + table_id).modal("show");

            for (var d in dati)
            {
                var val = /\d+,\d+/.test(dati[d]) ? parseFloat(dati[d].replace(",", ".")) : dati[d];
                $("#modal_modifica_componente_" + table_id).find("[name='" + d + "']").val(val);
            }
            $("#modal_modifica_componente_" + table_id).find("[name='costo_attuale_componente_old']").val(dati.costo_attuale_componente);
        },

        eliminaComponente : function (id_comp, modal, table_id)
        {
            Utils.requestData(
                Constants.API_POST_REMOVE_COMPONENT,
                "POST",
                { id: id_comp },
                "Componente eliminato con successo.",
                null,
                this.componenteModificato.bind( this, modal, this[table_id] )
            );
        },

        mostraConfermaElimina : function (e)
        {
            var t         = $(e.currentTarget),
                modal    = t.parents(".modal"),
                table_id  = t.parents("table").attr("id"),
                datatable = this[table_id],
                dati      = datatable.row(t.parents("tr")).data();

            Utils.showConfirm("Sicuro di voler eliminare il componente <strong>"+dati.id_componente+"</strong>?<br>" +
                "ATTENZIONE:<br>Ogni ricetta che contiene questo componente verr&agrave; eliminata a sua volta.", this.eliminaComponente.bind(this, dati.id_componente, modal, table_id), true );
        },

        setGridListeners : function ()
        {
            AdminLTEManager.controllaPermessi();

            $("td [data-toggle='popover']").popover("destroy");
            $("td [data-toggle='popover']").popover();

            $("[data-toggle='tooltip']").tooltip("destroy");
            $("[data-toggle='tooltip']").tooltip();

            $("td > button.modifica").unbind("click");
            $("td > button.modifica").click(this.mostraModalModifica.bind(this));

            $("td > button.elimina").unbind("click");
            $("td > button.elimina").click(this.mostraConfermaElimina.bind(this));

            $("td > button.stampa-cartellino").unbind("click", this.stampaCartellini.bind(this));
            $("td > button.stampa-cartellino").click(this.stampaCartellini.bind(this));

            $('input[type="number"]').unbind("change");
            $('input[type="number"]').on("change", this.componenteSelezionato.bind(this));

            this.selezionaComponente();
        },

        erroreDataTable : function (e, settings)
        {
            if (!settings.jqXHR || !settings.jqXHR.responseText)
            {
                console.log("DataTable error:", e, settings);
                return false;
            }

            var real_error = settings.jqXHR.responseText.replace(/^([\S\s]*?)\{"[\S\s]*/i, "$1");
            real_error     = real_error.replace("\n", "<br>");
            Utils.showError(real_error);
        },

        impostaTabellaTecnico : function ()
        {
            var columns = [];

            this.componenti_selezionati.tabella_tecnico = {};

            columns.push({
                title  : "Stampa",
                render : this.renderCheckStampa.bind(this)
            });
            columns.push({
                title : "ID",
                data  : "id_componente"
            });
            columns.push({
                title : "Nome",
                data  : "nome_componente"
            });
            columns.push({
                title : "Descrizione",
                data  : "descrizione_componente"
            });
            columns.push({
                title : "Tipo",
                data  : "tipo_componente"
            });
            columns.push({
                title : "Energia",
                data  : "energia_componente"
            });
            columns.push({
                title : "Volume",
                data  : "volume_componente"
            });
            columns.push({
                title : "Costo",
                data  : "costo_attuale_componente"
            });
            columns.push({
                title : "Effetti",
                data  : "effetto_sicuro_componente"
            });
            columns.push({
                title     : "Azioni",
                render    : this.renderAzioni.bind(this),
                orderable : false
            });

            this.tabella_tecnico = $('#tabella_tecnico')
                .on("error.dt", this.erroreDataTable.bind(this))
                .on("draw.dt", this.setGridListeners.bind(this))
                .DataTable({
                    processing : true,
                    serverSide : true,
                    dom        : "<'row'<'col-sm-6'lB><'col-sm-6'f>>" +
                    "<'row'<'col-sm-12 table-responsive'tr>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                    buttons    : ["reload"],
                    language   : Constants.DATA_TABLE_LANGUAGE,
                    ajax       : function (data, callback)
                    {
                        Utils.requestData(
                            Constants.API_GET_COMPONENTI_BASE,
                            "GET",
                            $.extend(data, {tipo : "tecnico"}),
                            callback
                        );
                    },
                    columns    : columns,
                    order      : [[0, 'asc']]
                });
        },

        impostaTabellaChimico : function ()
        {
            var columns = [];

            this.componenti_selezionati.tabella_chimico = {};

            columns.push({
                title  : "Stampa",
                render : this.renderCheckStampa.bind(this)
            });
            columns.push({
                title : "ID",
                data  : "id_componente"
            });
            columns.push({
                title : "Tipo",
                data  : "tipo_componente"
            });
            columns.push({
                title : "Nome",
                data  : "nome_componente"
            });
            columns.push({
                title : "Descrizione",
                data  : "descrizione_componente"
            });
            columns.push({
                title : "Val Curativo &#8544;",
                data  : "curativo_primario_componente"
            });
            columns.push({
                title : "Val Tossico &#8544;",
                data  : "tossico_primario_componente",
                type  : "num"
            });
            columns.push({
                title : "Val Psicotropo &#8544;",
                data  : "psicotropo_primario_componente",
                type  : "num"
            });
            columns.push({
                title : "Val Curativo &#8545;",
                data  : "curativo_secondario_componente",
                type  : "num"
            });
            columns.push({
                title : "Val Tossico &#8545;",
                data  : "tossico_secondario_componente",
                type  : "num"
            });
            columns.push({
                title : "Val Psicotropo &#8545;",
                data  : "psicotropo_secondario_componente",
                type  : "num"
            });
            columns.push({
                title : "Fattore Dipendeza",
                data  : "possibilita_dipendeza_componente",
                type  : "num"
            });
            columns.push({
                title : "Costo",
                data  : "costo_attuale_componente",
                type  : "num"
            });
            columns.push({
                title     : "Azioni",
                render    : this.renderAzioni.bind(this),
                orderable : false
            });

            this.tabella_chimico = $('#tabella_chimico')
                .on("error.dt", this.erroreDataTable.bind(this))
                .on("draw.dt", this.setGridListeners.bind(this))
                .DataTable({
                    processing : true,
                    serverSide : true,
                    dom        : "<'row'<'col-sm-6'lB><'col-sm-6'f>>" +
                    "<'row'<'col-sm-12 table-responsive'tr>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                    buttons    : ["reload"],
                    language   : Constants.DATA_TABLE_LANGUAGE,
                    ajax       : function (data, callback)
                    {
                        Utils.requestData(
                            Constants.API_GET_COMPONENTI_BASE,
                            "GET",
                            $.extend(data, {tipo : "chimico"}),
                            callback
                        );
                    },
                    columns    : columns,
                    order      : [[0, 'asc']]
                });
        },

        setListeners : function ()
        {
            $("#btn_stampaRicetteTecnico").click(this.stampaCartellini.bind(this));
            $("#btn_stampaRicetteChimico").click(this.stampaCartellini.bind(this));
            $("#btn_resettaContatoriTecnico").click(this.resettaContatori.bind(this));
            $("#btn_resettaContatoriChimico").click(this.resettaContatori.bind(this));
            $("#btn_invia_modifiche_tabella_tecnico").click(this.inviaModifiche.bind(this));
            $("#btn_invia_modifiche_tabella_chimico").click(this.inviaModifiche.bind(this));
        }
    };
}();

$(function ()
{
    ComponentsManager.init();
});