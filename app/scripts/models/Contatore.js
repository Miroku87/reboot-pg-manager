/**
 * Created by Miroku on 10/02/2018.
 */
var Contatore = Contatore || (function ()
{
    var DEFAULT_PARAMS = {
            valore_max : 0,
            valore_min : 0,
            valore_ora : 0,
            testo      : "{num}",
            macro      : "{num}",
            elemento   : "contatore"
        };

    function Contatore( params )
    {
        Object.call(this);

        this._settings      = {};

        for( var d in DEFAULT_PARAMS )
        {
            if( params[d] )
                this._settings[d] = params[d];
            else
                this._settings[d] = DEFAULT_PARAMS[d];
        }

        this._valore_max = this._settings.valore_max;
        this._valore_min = this._settings.valore_min;
        this._valore_ora = this._settings.valore_ora;

        if( this._valore_ora > this._valore_max )
            throw new Error( Contatore.ERRORS.VAL_TROPPO_ALTO );

        if( this._valore_ora < this._valore_min )
            throw new Error( Contatore.ERRORS.VAL_TROPPO_BASSO );

        _getDOMElements.call(this);
        this.impostaConteggio();

        return this;
    }

    Contatore.ERRORS = {
        VAL_TROPPO_ALTO  : "valTroppoAlto",
        VAL_TROPPO_BASSO : "valTroppoBasso"
    };

    Contatore.prototype = Object.create( Object.prototype );
    Contatore.prototype.constructor = Contatore;

    function _getDOMElements()
    {
        this.elem_testo = Utils.getJQueryObj( this._settings.elemento )
    }

    function _renderizzaConteggio()
    {
        this.elem_testo.html( this._settings.testo.replace( this._settings.macro, this._valore_ora ) );
    }

    Contatore.prototype.impostaConteggio = function( valore )
    {
        this._valore_ora = this._settings.valore_ora;

        if( this._valore_ora > this._valore_max )
            throw new Error( Contatore.ERRORS.VAL_TROPPO_ALTO );

        if( this._valore_ora < this._valore_min )
            throw new Error( Contatore.ERRORS.VAL_TROPPO_BASSO );

        _renderizzaConteggio.call( this );
    };

    Contatore.prototype.aumentaConteggio = function( valore )
    {
        valore = typeof valore === "undefined" ? 1 : valore;

        var nuovo_valore = this._valore_ora + valore;

        if( nuovo_valore > this._valore_max )
            throw new Error( Contatore.ERRORS.VAL_TROPPO_ALTO );

        this._valore_ora = nuovo_valore;
        _renderizzaConteggio.call( this );
    };

    Contatore.prototype.diminuisciConteggio = function( valore )
    {
        valore = typeof valore === "undefined" ? 1 : valore;

        var nuovo_valore = this._valore_ora - valore;

        if( nuovo_valore < this._valore_min )
            throw new Error( Contatore.ERRORS.VAL_TROPPO_BASSO );

        this._valore_ora = nuovo_valore;
        _renderizzaConteggio.call( this );
    };

    Contatore.prototype.valoreConteggio = function( )
    {
        return this._valore_ora;
    };

    return Contatore;
})();