/**
 * Created by Miroku on 11/03/2018.
 */
var LiveEventsManager = function ()
{
    return {
        init: function ()
        {
            this.setListeners();
            this.recuperaUltimoEvento();
            this.recuperaPersonaggi();
            this.impostaModalIscrizione();
        },

        mandaIscrizione: function()
        {
            Utils.requestData(
                Constants.API_POST_ISCRIZIONE,
                "POST",
                {
                    id_evento : this.id_evento,
                    id_pg     : $("#personaggio").val(),
                    pagato    : $("#pagato").is(":checked") ? 1 : 0,
                    tipo_pag  : $("#metodo_pagamento").val(),
                    note      : $("#note").val()
                },
                "Personaggio iscritto con successo.",
                null,
                Utils.reloadPage
            );
        },

        mostraModalIscrizione: function()
        {
            $("#note").val("");
            $("#pagato").attr("checked",false);
            $("#modal_iscrivi_pg").modal({drop:"static"});
        },

        impostaModalIscrizione: function()
        {
            $( '#modal_iscrivi_pg input[type="checkbox"]' ).iCheck( {
                checkboxClass : 'icheckbox_square-blue'
            } );
            $("#btn_iscrivi").click(this.mandaIscrizione.bind(this));
        },

        vaiAMaps: function()
        {
            var win = window.open('https://www.google.it/maps/search/' + encodeURIComponent(this.luogo_evento), '_blank');
            win.focus();
        },

        impostaMappa : function ()
        {
            var latlng = new google.maps.LatLng(45.464133, 9.191300);
            var mapOptions = {
                zoom : 12,
                center : latlng
            };
            this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
            this.mappa_pronta = true;

            if( this.dati_pronti )
                this.centraMappaInLuogo();
        },

        centraMappaInLuogo : function ( )
        {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'address' : this.luogo_evento}, function (results, status)
            {
                if (status == 'OK')
                {
                    this.map.setCenter(results[0].geometry.location);
                    var marker = new google.maps.Marker({
                        map : this.map,
                        position : results[0].geometry.location
                    });
                    marker.addListener('click', this.vaiAMaps.bind(this) );
                }
                else
                {
                    Utils.showError('Google Map non &egrave; riuscito a restituire la mappa. Errore: ' + status);
                }
            }.bind(this));
        },

        mostraDati: function( d )
        {
            var data = d.result;

            this.id_evento = data.id_evento;
            this.luogo_evento = data.luogo_evento;

            $("#titolo_evento").text( data.titolo_evento );
            $("#data_inizio_evento").text( data.data_inizio_evento_it );
            $("#ora_inizio_evento").text( data.ora_inizio_evento.replace(/:00$/,"") );
            $("#data_fine_evento").text( data.data_fine_evento_it );
            $("#ora_fine_evento").text( data.ora_fine_evento.replace(/:00$/,"") );
            $("#luogo_evento").text( data.luogo_evento );
            $("#costo_evento").html( data.costo_evento + "&euro;" );
            $("#costo_maggiorato_evento").html( data.costo_maggiorato_evento + "&euro;" );
            $("#note_evento").html( data.note_evento );

            this.dati_pronti = true;

            if( this.mappa_pronta )
                this.centraMappaInLuogo();
        },

        creaListaPG: function( d )
        {
            var data = d.result,
                elems = data.reduce(function( pre, ora ){ return pre + "<option value=\""+ora.id_personaggio+"\">"+ora.nome_personaggio+"</option>" },"");

            $("#personaggio").append(elems);
        },

        recuperaUltimoEvento: function()
        {
            Utils.requestData(
                Constants.API_GET_EVENTO,
                "GET",
                "",
                this.mostraDati.bind(this)
            );
        },

        recuperaPersonaggi: function()
        {
            Utils.requestData(
                Constants.API_GET_PGS_PROPRI,
                "GET",
                "",
                this.creaListaPG.bind(this)
            );
        },

        vaiAModificaEvento: function()
        {
            window.localStorage.setItem("azione_evento","modifica");
            Utils.redirectTo( Constants.CREA_EVENTO_PAGE );
        },

        setListeners: function()
        {
            //TODO: disabilitare il pulsante nel caso il giocatore abbia già un pg iscritto
            //TODO: mostrare agli admin se l'evento è pubblico e meno e mettere pulsante per pubblicare
            $("#btn_visualizza_pagina_crea_evento").click( Utils.redirectTo.bind(this, Constants.CREA_EVENTO_PAGE) );
            $("#btn_modifica_evento").click( this.vaiAModificaEvento.bind(this) );
            $("#iscrivi_pg").click( this.mostraModalIscrizione.bind(this) );
        }
    };
}();

$(function () {
    LiveEventsManager.init();
});