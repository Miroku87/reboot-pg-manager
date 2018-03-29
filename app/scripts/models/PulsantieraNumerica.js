/**
 * Created by Miroku on 29/03/2018.
 */
var PulsantieraNumerica = PulsantieraNumerica || function ()
{
    function PulsantieraNumerica( settings )
    {
        this.target = $(settings.target);
        this.pulsantiera = $(settings.pulsantiera);

        if( !this.target.is("input[type='number']") )
            throw new Error("Il target deve essere un input di tipo number.");

        _setListeners.call(this);
    }

    PulsantieraNumerica.prototype = Object.create( Object.prototype );
    PulsantieraNumerica.prototype.constructor = PulsantieraNumerica;

    function _aggiungiValore( val )
    {
        this.target.val( parseFloat( this.target.val() ) + val );
    }

    function _setListeners()
    {
        this.pulsantiera.find(".meno10").click(_aggiungiValore.bind(this,-10));
        this.pulsantiera.find(".meno1").click(_aggiungiValore.bind(this,-1));
        this.pulsantiera.find(".piu1").click(_aggiungiValore.bind(this,1));
        this.pulsantiera.find(".piu10").click(_aggiungiValore.bind(this,10));
    }

    return PulsantieraNumerica;
}();

/*
$(function () {
    PulsantieraNumerica.init();
});*/
