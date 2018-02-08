/**
 * Created by Miroku on 07/12/2017.
 */

var MultiSelector = MultiSelector || (function ()
{
    var DEFAULT_PARAMS = {
            id_lista           : "lista",
            id_carrello        : "carrello",
            btn_aggiungi       : "aggiungi",
            btn_rimuovi        : "rimuovi",
            ordina_per_attr    : "id",
            dati_lista         : [],
            dati_carrello      : [],
            max_selezioni      : null,
            elemAggiunti       : null,
            elemRimossi        : null,
            elemSelezionato    : null,
            elemNegatoCliccato : null,
            elemRenderizzato   : null,
            aggiuntaPossibile  : null,
            onError            : null
        },
        ATTR_TYPES     = ["number","string","boolean"];

    function MultiSelector( params )
    {
        Object.call(this);

        this._settings      = {};
        this._dati_lista    = [];
        this._dati_carrello = [];
        this._selezionati   = [];

        for( var d in DEFAULT_PARAMS )
        {
            if( params[d] )
                this._settings[d] = params[d];
            else
                this._settings[d] = DEFAULT_PARAMS[d];
        }

        this._dati_lista    = this._settings.dati_lista.concat();
        this._dati_carrello = this._settings.dati_carrello.concat();

        return this;
    }

    MultiSelector.ERRORS = {
        ELEM_NEGATO_CLICCATO    : "elementoNegatoCliccato",
        MAX_SELEZIONI_RAGGIUNTO : "massimoSelezioniRaggiunto"
    };

    MultiSelector.prototype = Object.create( Object.prototype );
    MultiSelector.prototype.constructor = MultiSelector;

    function _getJQueryObj( obj )
    {
        var jobj = {};

        if( typeof obj === "string" )
            jobj = $( "#" + obj );
        else if ( obj instanceof $ )
            jobj = obj;
        else if ( obj instanceof HTMLElement )
            jobj = $( obj );

        return jobj;
    }

    function _getDOMElements()
    {
        this.elem_lista    = _getJQueryObj( this._settings.id_lista );
        this.elem_carrello = _getJQueryObj( this._settings.id_carrello );
        this.elem_aggiungi = _getJQueryObj( this._settings.btn_aggiungi );
        this.elem_rimuovi  = _getJQueryObj( this._settings.btn_rimuovi );

        if( !this.elem_lista.is("ul") )
            throw new Error( "L'elemento lista deve essere un tag UL." );

        if( !this.elem_carrello.is("ul") )
            throw new Error( "L'elemento carrello deve essere un tag UL." );
    }

    function _aggiornaListe( )
    {
        _riempiDOMListe.call( this, this.elem_carrello, this._dati_carrello );
        _riempiDOMListe.call( this, this.elem_lista, this._dati_lista );
        _impostaEventi.call( this, this.elem_carrello );
        _impostaEventi.call( this, this.elem_lista );
        _setPopovers.call( this, this.elem_carrello.children() );
        _setPopovers.call( this, this.elem_lista.children() );
    }

    function _riempiDOMListe( listaDOM, dati, pulisci_lista )
    {
        pulisci_lista = typeof pulisci_lista === "undefined" ? true : pulisci_lista;

        var lista_opposta = dati === this._dati_lista ? this._dati_carrello : this._dati_lista;

        if( pulisci_lista )
            listaDOM.html("");

        if( Object.keys( dati).length < 1 )
            return false;

        for( var d in dati )
        {
            var dato  = dati[d];

            if( !isNaN( parseInt( d ) ) && lista_opposta.indexOf( dato ) === -1 )
            {
                var elem  = $("<li>");
                elem.attr( "data-index", d );

                for( var dd in dato )
                {
                    if ( dd === "innerHTML" )
                        elem.html( dato[dd] );
                    else if ( dd === "prerequisito" )
                        elem.attr( "data-prerequisito", true );
                    else if ( ATTR_TYPES.indexOf( typeof dato[dd] ) !== -1 )
                        elem.attr( "data-"+dd, dato[dd] );

                    elem.attr( "data-original-title", "" );
                    elem.attr( "data-original", "" );
                    elem.attr( "class", "" );
                }

                if( listaDOM.is( this.elem_lista ) && dato.prerequisito )
                {
                    var enabled = false;

                    if( typeof dato.prerequisito === "function" )
                        enabled = dato.prerequisito(dato, this._dati_lista, this._dati_carrello);
                    else if ( typeof dato.prerequisito === "object" && Object.keys( dato.prerequisito ).length > 0 )
                    {
                        for( var dc in this._dati_carrello )
                        {
                            var requisito_incontrato = true;
                            //Qui serve che "requisito_incontrato" sia false se anche una sola proprietà dell'oggetto this._dati_carrello[dc]
                            //non rispetta il prerequisito
                            for ( var p in dato.prerequisito )
                                requisito_incontrato = requisito_incontrato && this._dati_carrello[dc][p] === dato.prerequisito[p];

                            //Qui serve che "enabled" sia true se anche un solo "requisito_incontrato" è true;
                            enabled = enabled || requisito_incontrato;
                        }
                    }

                    elem.attr( "disabled", !enabled );
                }

                if( this._settings.elemRenderizzato )
                    this._settings.elemRenderizzato( dato, dati, parseInt( d ), elem );

                listaDOM.append( elem );
                elem.dblclick( _elementoDoppioClick.bind( this ) );
            }
        }
    }

    function _elementoDoppioClick( e )
    {
        var cliccato   = $( e.target ),
            tipo_lista = cliccato.parent().is( this.elem_lista ) ? "lista" : "carrello";

        if ( cliccato.is("[disabled]") )
        {
            if (typeof this._settings.onError === "function")
                this._settings.onError(MultiSelector.ERRORS.ELEM_NEGATO_CLICCATO);

            return false;
        }

        cliccato.addClass( "selected" );
        this._selezionati.push( tipo_lista + "_" + cliccato.attr( "data-index" ) );

        if( cliccato.parent().is( this.elem_lista ) )
            _aggiungiElementoACarrello.call( this );
        else if ( cliccato.parent().is( this.elem_carrello ) )
            _rimuoviElementoDaCarrello.call( this );
    }

    function _impostaEventi( lista )
    {
        lista.find("li").unbind("click");
        lista.find("li").click( _elementoListaCliccato.bind(this) );
    }

    function _elementoListaCliccato( e )
    {
        var target        = $(e.target),
            tipo_lista    = target.parent().is( this.elem_lista ) ? "lista" : "carrello",
            lista_opposta = target.parent().is( this.elem_lista ) ? this.elem_carrello : this.elem_lista;

        lista_opposta.find(".selected").removeClass("selected");

        if( !target.is(".selected") )
        {
            if (target.is("[disabled]"))
            {
                if (typeof this._settings.onError === "function")
                    this._settings.onError(MultiSelector.ERRORS.ELEM_NEGATO_CLICCATO);

                return false;
            }

            if (tipo_lista === "lista" && this._settings.max_selezioni && this.elem_carrello.size() >= this._settings.max_selezioni)
            {
                if (typeof this._settings.onError === "function")
                    this._settings.onError(MultiSelector.ERRORS.MAX_SELEZIONI_RAGGIUNTO);

                return false;
            }

            if (typeof this._settings.elemSelezionato === "function")
                this._settings.elemSelezionato( this["_dati_"+tipo_lista], target );

            this._selezionati = this._selezionati.filter( function( elem ){ return elem.indexOf( tipo_lista ) !== -1; } );
            this._selezionati.push( tipo_lista+"_"+target.attr("data-index") );
        }
        else
        {
            var indice   = this._selezionati.indexOf( tipo_lista+"_"+target.attr("data-index") );

            this._selezionati.splice( indice, 1 );
        }

        target.toggleClass( "selected" );
    }

    function _impostaPulsanti()
    {
        this.elem_aggiungi.unbind("click");
        this.elem_aggiungi.click( _aggiungiElementoACarrello.bind( this ) );

        this.elem_rimuovi.unbind("click");
        this.elem_rimuovi.click( _rimuoviElementoDaCarrello.bind( this ) );
    }

    function _aggiungiElementoACarrello( )
    {
        if( this._selezionati.filter( function( elem ){ return elem.indexOf( "lista" ) !== -1; }).length === 0 )
            return false;

        _sposta.call( this, this._dati_lista, this._dati_carrello );
        _aggiornaListe.call(this);
    }

    function _rimuoviElementoDaCarrello( )
    {
        if( this._selezionati.filter( function( elem ){ return elem.indexOf( "carrello" ) !== -1; }).length === 0 )
            return false;

        _sposta.call( this, this._dati_carrello, this._dati_lista );
        _aggiornaListe.call(this);
    }

    function _sposta( da_lista, in_lista )
    {
        var indici_sel     = this._selezionati.map( function( elem ){ return parseInt( elem.replace(/\D/g, "") ); }),
            selezionati    = da_lista.filter( function( elem, i ){ return indici_sel.indexOf( i ) !== -1; }),
            spostaOk       = true;

        indici_sel.sort();

        if( typeof this._settings.aggiuntaPossibile === "function" )
            spostaOk = this._settings.aggiuntaPossibile( selezionati, da_lista, in_lista );

        if( !spostaOk )
            return false;

        $( '[data-toggle="popover"]' ).popover( "hide" );
        Array.prototype.push.apply( in_lista, selezionati );

        for( var i = indici_sel.length - 1; i >= 0; i-- )
            da_lista.splice( indici_sel[i],1 );

        Utils.sortArrayByAttribute( da_lista, this._settings.ordina_per_attr );
        Utils.sortArrayByAttribute( in_lista, this._settings.ordina_per_attr );

        this._selezionati = [];

        if ( typeof this._settings.elemAggiunti === "function" && $( da_lista ).is( this._dati_lista ) )
            setTimeout(function(){ this._settings.elemAggiunti( selezionati, da_lista, in_lista )}.bind(this), 0);
        if ( typeof this._settings.elemRimossi === "function" && !$( da_lista ).is( this._dati_lista ) )
            this._settings.elemRimossi( selezionati, in_lista, da_lista );
    }

    function _setPopovers( elements )
    {
        var is_mobile = Utils.isDeviceMobile();

        if ( !is_mobile )
        {
            elements.popover( {
                trigger: 'hover'
            } );
        }
        else
        {
            elements.popover( {
                trigger: 'manual',
                placement: function ( popover_elem, li_elem )
                {
                    if ( $( li_elem ).parent().is( this.elem_carrello ) )
                        return 'bottom';
                    else
                        return 'top';
                }
            } );

            elements.click( function ( event )
            {
                $( this ).parent().find( '[data-toggle="popover"]' ).popover( "hide" );
                $( this ).popover( "show" );
            } );

            elements.on( 'inserted.bs.popover', function ()
            {
                var close = $( "<div class='popover-close-btn'><span class='fa fa-times' aria-hidden='true'></span></div>" );
                close.click( function ()
                {
                    $( '[data-toggle="popover"]' ).popover( "hide" );
                } );

                $( '.popover-body' ).append( close );
            } );
        };
    }

    MultiSelector.prototype.aggiungiDatiLista = function( dati )
    {
        var nuovi_dati = dati.concat();
        this._dati_lista = this._dati_lista.concat( nuovi_dati );
        _aggiornaListe.call(this);
    };

    MultiSelector.prototype.rimuoviDatiLista = function( chiave_primaria, valore )
    {
        for( var d = this._dati_lista.length - 1; d >= 0; d-- )
        {
            if( this._dati_lista[d][ chiave_primaria ] && this._dati_lista[d][ chiave_primaria ] === valore )
                this._dati_lista.splice( d, 1 );
        }

        _aggiornaListe.call(this);
    };

    MultiSelector.prototype.spostaDaCarrello = function( chiave_primaria, valore )
    {
        for( var d = this._dati_carrello.length - 1; d >= 0; d-- )
        {
            if( this._dati_carrello[d][ chiave_primaria ] && this._dati_carrello[d][ chiave_primaria ] === valore )
                this._dati_lista.push( this._dati_carrello.splice( d, 1 )[0] );
        }

        Utils.sortArrayByAttribute( this._dati_lista, this._settings.ordina_per_attr );

        _aggiornaListe.call(this);
    };

    MultiSelector.prototype.deselezionaTutti = function( )
    {
        this._selezionati = [];
        this.elem_lista.children().removeClass("selected");
        this.elem_carrello.children().removeClass("selected");
    };

    MultiSelector.prototype.numeroCarrello = function( )
    {
        return this.elem_carrello.find("li").size();
    };

    MultiSelector.prototype.numeroLista = function( )
    {
        return this.elem_lista.find("li").size();
    };

    MultiSelector.prototype.lista = function( )
    {
        return this._dati_lista;
    };

    MultiSelector.prototype.carrello = function( )
    {
        return this._dati_carrello;
    };

    MultiSelector.prototype.crea = function( )
    {
        _getDOMElements.call(this);
        _impostaPulsanti.call( this );
        _aggiornaListe.call(this);
    };

    MultiSelector.prototype.toString = function( )
    {
        return "[ MultiSelector - " + this._settings.id_lista + " ]";
    };

    return MultiSelector;
})();