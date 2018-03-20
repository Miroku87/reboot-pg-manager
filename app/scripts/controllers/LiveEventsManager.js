/**
 * Created by Miroku on 11/03/2018.
 */
var LiveEventManager = function ()
{
    return {
        init: function ()
        {
            this.setListeners();
        },

        mostraModalIscrizione: function()
        {
            $("#modal_iscrivi_pg").modal({drop:"static"});
        },

        vaiAModificaEvento: function()
        {
            window.localStorage.setItem("azione_evento","modifica");
            Utils.redirectTo( Constants.CREA_EVENTO_PAGE );
        },

        setListeners: function()
        {
            $("#btn_visualizza_pagina_crea_evento").click( Utils.redirectTo.bind(this, Constants.CREA_EVENTO_PAGE) );
            $("#btn_modifica_evento").click( this.vaiAModificaEvento.bind(this) );
            $("#btn_modifica_evento").click( this.mostraModalIscrizione.bind(this) );
        }
    };
}();

$(function () {
    LiveEventManager.init();
});