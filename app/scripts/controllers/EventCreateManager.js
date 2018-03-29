/**
 * Created by Miroku on 11/03/2018.
 */
var EventCreateManager = function ()
{
    return {

        init: function ()
        {
            this.setListeners();
            this.analizzaAzione();
        },

        mostraTimePicker: function()
        {
            $(this).timepicker('showWidget');
        },

        initAutocomplete : function ()
        {
            new google.maps.places.Autocomplete( document.getElementById('luogo') );
        },

        mostraDati: function( d )
        {
            var data = d.result;
            $("#titolo").val( data.titolo_evento );
            $("#data_inizio").val( data.data_inizio_evento_it );
            $("#ora_inizio").val( data.ora_inizio_evento.replace(/:00$/,"") );
            $("#data_fine").val( data.data_fine_evento_it );
            $("#ora_fine").val( data.ora_fine_evento.replace(/:00$/,"") );
            $("#luogo").val( data.luogo_evento );
            $("#costo").val( data.costo_evento );
            $("#costo_maggiorato").val( data.costo_maggiorato_evento );
            $("#note").val( data.note_evento.replace(/<br>/g,"\r").replace(/<br \/>/g,"\r") );
        },

        inviaDatiEvento: function()
        {
            var data  = {},
                url   = Constants.API_POST_EVENTO,
                mex   = "Evento inserito correttamente.<br>Ricordati che non è ancora pubblico e che pu&ograve; essere modificato.";

            if( this.evento_mod_id )
            {
                window.localStorage.removeItem("azione_evento");
                url = Constants.API_POST_MOD_EVENTO;
                mex   = "Evento modificato correttamente.<br>Ricordati che non è ancora pubblico e che pu&ograve; essere modificato."
                data.id = this.evento_mod_id;
            }

            data.titolo      = $("#titolo").val();
            data.data_inizio = $("#data_inizio").val();
            data.ora_inizio  = $("#ora_inizio").val();
            data.data_fine   = $("#data_fine").val();
            data.ora_fine    = $("#ora_fine").val();
            data.luogo       = $("#luogo").val();
            data.costo       = $("#costo").val() || 0;
            data.costo_magg  = $("#costo_maggiorato").val() || 0;
            data.note        = $("#note").val();

            Utils.requestData(
                url,
                "POST",
                data,
                mex,
                null,
                Utils.redirectTo.bind(this,Constants.EVENTI_PAGE)
            );
        },

        checkInputData: function()
        {
            var titolo      = $("#titolo").val(),
                data_inizio = $("#data_inizio").val(),
                ora_inizio  = $("#ora_inizio").val(),
                data_fine   = $("#data_fine").val(),
                ora_fine    = $("#ora_fine").val(),
                luogo       = $("#luogo").val(),
                costo       = $("#costo").val(),
                costo_magg  = $("#costo_maggiorato").val(),
                note        = $("#note").val(),
                d_inizio_ts = 0,
                d_fine_ts   = 0,
                error       = "";

            if( !titolo || Utils.soloSpazi(titolo) )
                error += "<li>Il campo Titolo non pu&ograve; essere lasciato vuoto.</li>";
            if( !data_inizio || Utils.soloSpazi(data_inizio) )
                error += "<li>Il campo Data Inizio non pu&ograve; essere lasciato vuoto.</li>";
            else
            {
                var data_spl = data_inizio.split("/");
                d_inizio_ts = new Date( data_spl[2], parseInt(data_spl[1],10)-1, data_spl[0]).getTime();
            }
            if( !ora_inizio || Utils.soloSpazi(ora_inizio) )
                error += "<li>Il campo Ora Inizio non pu&ograve; essere lasciato vuoto.</li>";
            if( !data_fine || Utils.soloSpazi(data_fine) )
                error += "<li>Il campo Data Fine non pu&ograve; essere lasciato vuoto.</li>";
            else
            {
                var data_spl = data_fine.split("/");
                d_fine_ts = new Date( data_spl[2], parseInt(data_spl[1],10)-1, data_spl[0]).getTime();
            }
            if( !ora_fine || Utils.soloSpazi(ora_fine) )
                error += "<li>Il campo Ora Fine non pu&ograve; essere lasciato vuoto.</li>";
            if( costo && !Utils.soloSpazi(costo) && !/^\d+(\.\d+)?$/.test(costo) )
                error += "<li>Il campo Costo pu&ograve; contenere solo numeri.</li>";
            if( costo_magg && Utils.soloSpazi(costo_magg) && !/^\d+$/.test(costo_magg) )
                error += "<li>Il campo Costo Maggiorato pu&ograve; contenere solo numeri.</li>";
            if( !luogo || Utils.soloSpazi(luogo) )
                error += "<li>Il campo Luogo non pu&ograve; essere lasciato vuoto.</li>";

            if( d_fine_ts !== 0 && d_inizio_ts !== 0 && d_fine_ts < d_inizio_ts )
                error += "<li>La data di fine non pu&ograve; essere prima di quella d'inizio.</li>"

            return error;
        },

        checkForWarnings: function()
        {
            var costo       = $("#costo").val(),
                costo_magg  = $("#costo_maggiorato").val(),
                note        = $("#note").val(),
                warning     = "";

            if( !costo || Utils.soloSpazi(costo) || parseInt( costo, 10 ) === 0 )
                warning += "<li>Il campo Costo non &egrave; stato riempito.</li>";
            if( !costo_magg || Utils.soloSpazi(costo_magg) || parseInt( costo, 10 ) === 0 )
                warning += "<li>Il campo Costo Maggiorato non &egrave; stato riempito.</li>";
            if( !note || Utils.soloSpazi(note) )
                warning += "<li>Il campo Dettagli non &egrave; stato riempito.</li>";

            return warning;
        },

        controllaDatiEvento: function()
        {
            var errors   = this.checkInputData(),
                warnings = this.checkForWarnings();

            if( errors )
            {
                Utils.showError("Sono stati rilevati i seguenti errori:<ul>" + errors + "</ul>");
                return false;
            }

            if( warnings )
                Utils.showConfirm("Sono state rilevate queste anomalie:<ul>"+warnings+"</ul>Vuoi proseguire lo stesso?", this.inviaDatiEvento.bind(this), false );
            else
                this.inviaDatiEvento();
        },

        analizzaAzione: function()
        {
            this.evento_mod_id = window.localStorage.getItem("evento_mod_id");

            if( this.evento_mod_id )
            {
                $("#invia_evento").text("Modifica Evento");
                Utils.requestData(
                    Constants.API_GET_EVENTO,
                    "GET",
                    {id:this.evento_mod_id},
                    this.mostraDati.bind(this)
                );
            }
        },

        setListeners: function()
        {
            $('[data-provide="timepicker"]').focus(this.mostraTimePicker);

            $("#invia_evento").click(this.controllaDatiEvento.bind(this));
            $("#indietro").click(Utils.redirectTo.bind(this,Constants.EVENTI_PAGE));
        }
    };
}();

$(function () {
    EventCreateManager.init();
});