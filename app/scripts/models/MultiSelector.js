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
            elemDeselezionato  : null,
            elemNegatoCliccato : null,
            elemRenderizzato   : null,
            aggiuntaPossibile  : null,
            onError            : null
        },
        ATTR_TYPES     = ["number","string","boolean"];

    function MultiSelector( params )
    {
        Object.call(this);

        this._settings        = {};
        this._dati_lista      = [];
        this._dati_carrello   = [];
        this._selezionati     = [];
        this._gia_selezionati = [];

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

    MultiSelector.TIPI_LISTE = {
        LISTA    : "lista",
        CARRELLO : "carrello"
    };

    MultiSelector.prototype = Object.create( Object.prototype );
    MultiSelector.prototype.constructor = MultiSelector;

    function _eventoAsincrono( callback )
    {
        var arg_reali = Utils.trasformaInArray( arguments );
        arg_reali.splice(0,1);

        setTimeout( function()
        {
            callback.apply( this, arg_reali );
        }.bind(this), 0 );
    }

    function _getDOMElements()
    {
        this.elem_lista    = Utils.getJQueryObj( this._settings.id_lista );
        this.elem_carrello = Utils.getJQueryObj( this._settings.id_carrello );
        this.elem_aggiungi = Utils.getJQueryObj( this._settings.btn_aggiungi );
        this.elem_rimuovi  = Utils.getJQueryObj( this._settings.btn_rimuovi );

        if( !this.elem_lista.is("ul") )
            throw new Error( "L'elemento lista deve essere un tag UL." );

        //if( !this.elem_carrello.is("ul") )
            //throw new Error( "L'elemento carrello deve essere un tag UL." );
    }

    function _controllaPrerequisiti( indice_elem, dato )
    {
        var enabled     = false,
            indici_sel  = this._selezionati.map( function( elem ){ return parseInt( elem.replace(/\D/g, "") ); }),
            selezionati = this._dati_lista.filter( function( elem, i ){ return indici_sel.indexOf( i ) !== -1; }),
            elem        = this.elem_lista.find("li").eq( indice_elem );

        if( typeof dato.prerequisito === "function" )
            enabled = dato.prerequisito( dato, this._dati_lista, this._dati_carrello, selezionati );
        else if ( typeof dato.prerequisito === "object" && Object.keys( dato.prerequisito ).length > 0 )
        {
            var da_controllare = this._dati_carrello.concat( selezionati );
            for( var dc in da_controllare )
            {
                var requisito_incontrato = true;
                //Qui serve che "requisito_incontrato" sia false se anche una sola proprietà dell'oggetto this._dati_carrello[dc]
                //non rispetta il prerequisito
                for ( var p in dato.prerequisito )
                    requisito_incontrato = requisito_incontrato && da_controllare[dc][p] === dato.prerequisito[p];

                //Qui serve che "enabled" sia true se anche un solo "requisito_incontrato" è true;
                enabled = enabled || requisito_incontrato;
            }
        }

        elem.attr( "disabled", !enabled );
        
        if( !enabled )
        {
            var lista      = MultiSelector.TIPI_LISTE.LISTA,
                indice_sel =  this._selezionati.indexOf( lista+"_"+indice_elem );
            elem.removeClass("selected");

            if( indice_sel !== -1 )
            {
                this._selezionati.splice(indice_sel, 1);

                if (typeof this._settings.elemDeselezionato === "function")
                    _eventoAsincrono.call( this, this._settings.elemDeselezionato, lista, this["_dati_"+lista][elem.attr("data-index")], this["_dati_"+lista], elem, this._selezionati );
            }
        }
    }

    function _controllaTuttiPrerequisiti()
    {
        for( var d in this._dati_lista )
        {
            if ( !isNaN( parseInt(d, 10) ) )
            {
                var dato = this._dati_lista[d];

                if ( dato.prerequisito )
                    _controllaPrerequisiti.call(this, parseInt(d, 10), dato);
            }
        }
    }

    function _aggiornaListe( pulisci_liste )
    {
        pulisci_liste = typeof pulisci_liste === "undefined" ? true : pulisci_liste;

        _riempiDOMListe.call( this, this.elem_carrello, this._dati_carrello, pulisci_liste );
        _riempiDOMListe.call( this, this.elem_lista, this._dati_lista, pulisci_liste );
        _controllaTuttiPrerequisiti.call( this );
        _impostaEventi.call( this, this.elem_carrello );
        _impostaEventi.call( this, this.elem_lista );
        _setPopovers.call( this, this.elem_carrello.children() );
        _setPopovers.call( this, this.elem_lista.children() );
    }

    function _controllaGiaSelezionati()
    {
        var tipo_lista = MultiSelector.TIPI_LISTE.LISTA;

        for( var d in this._dati_lista )
        {
            var dato = this._dati_lista[d];

            if ( dato.gia_selezionato )
            {
                if (typeof this._settings.elemSelezionato === "function")
                    _eventoAsincrono.call( this, this._settings.elemSelezionato, tipo_lista, dato, this._dati_lista, dato.element, this._selezionati, false );
            }
        }
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

            if( !isNaN( parseInt( d, 10 ) ) && lista_opposta.indexOf( dato ) === -1 )
            {
                var elem = {};
                if( pulisci_lista )
                {
                    elem = $("<li>");
                    dato.element = elem;
                    elem.attr("data-index", d);
                }
                else
                    elem = listaDOM.find("li").eq( d );

                for( var dd in dato )
                {
                    if ( dd === "innerHTML" )
                        elem.html(dato[dd]);
                    else if ( dd === "prerequisito" )
                        elem.attr( "data-prerequisito", true );
                    else if ( ATTR_TYPES.indexOf( typeof dato[dd] ) !== -1 && !elem.attr( "data-"+dd ) )
                        elem.attr( "data-"+dd, dato[dd] );

                    if( pulisci_lista )
                        elem.attr( "class", "" );
                }
                if ( dato.gia_selezionato && this._selezionati.indexOf("lista_" + d) === -1 )
                {
                    this._selezionati.push("lista_" + d);
                    this._gia_selezionati.push("lista_" + d);
                }

                if( typeof this._settings.elemRenderizzato === 'function' )
                    _eventoAsincrono.call( this, this._settings.elemRenderizzato, dato, dati, parseInt( d ), elem );

                if( pulisci_lista )
                {
                    listaDOM.append(elem);
                }
            }
        }
    }

    function _elementoDoppioClick( e )
    {
        var cliccato   = $( e.target ),
            tipo_lista = cliccato.parent().is( this.elem_lista ) ? MultiSelector.TIPI_LISTE.LISTA : MultiSelector.TIPI_LISTE.CARRELLO;

        if ( cliccato.is("[disabled]") )
        {
            if (typeof this._settings.onError === "function")
                _eventoAsincrono.call( this, this._settings.onError, MultiSelector.ERRORS.ELEM_NEGATO_CLICCATO );

            return false;
        }

        cliccato.addClass( "selected" );
        this._selezionati.push( tipo_lista + "_" + cliccato.attr( "data-index" ) );

        if( cliccato.parent().is( this.elem_lista ) )
            _aggiungiElementoACarrello.call( this );
        else if ( cliccato.parent().is( this.elem_carrello ) )
            _rimuoviElementoDaCarrello.call( this );
    }

    function _elementoCliccato( e )
    {
        var target        = $(e.target),
            tipo_lista    = target.parent().is( this.elem_lista ) ? MultiSelector.TIPI_LISTE.LISTA : MultiSelector.TIPI_LISTE.CARRELLO,
            lista_opposta = target.parent().is( this.elem_lista ) ? this.elem_carrello : this.elem_lista;

        lista_opposta.find(".selected").removeClass("selected");

        if( !target.is(".selected") )
        {
            if (target.is("[disabled]"))
            {
                if (typeof this._settings.onError === "function")
                    _eventoAsincrono.call( this, this._settings.onError, MultiSelector.ERRORS.ELEM_NEGATO_CLICCATO );

                return false;
            }

            if (tipo_lista === MultiSelector.TIPI_LISTE.LISTA && this._settings.max_selezioni && this.elem_carrello.size() >= this._settings.max_selezioni)
            {
                if (typeof this._settings.onError === "function")
                    _eventoAsincrono.call( this, this._settings.onError, MultiSelector.ERRORS.MAX_SELEZIONI_RAGGIUNTO );

                return false;
            }

            this._selezionati = this._selezionati.filter( function( elem ){ return elem.indexOf( tipo_lista ) !== -1; } );
            this._selezionati.push( tipo_lista+"_"+target.attr("data-index") );

            if (typeof this._settings.elemSelezionato === "function")
                _eventoAsincrono.call( this, this._settings.elemSelezionato, tipo_lista, this["_dati_"+tipo_lista][target.attr("data-index")], this["_dati_"+tipo_lista], target, this._selezionati );
        }
        else
        {
            var indice   = this._selezionati.indexOf( tipo_lista+"_"+target.attr("data-index") );
            this._selezionati.splice( indice, 1 );

            if (typeof this._settings.elemDeselezionato === "function")
                _eventoAsincrono.call( this, this._settings.elemDeselezionato, tipo_lista, this["_dati_"+tipo_lista][target.attr("data-index")], this["_dati_"+tipo_lista], target, this._selezionati );
        }

        _controllaTuttiPrerequisiti.call( this );

        target.toggleClass( "selected" );
    }

    function _impostaEventi( lista )
    {
        lista.find("li").unbind("click");
        lista.find("li").click( _elementoCliccato.bind(this) );

        //lista.find("li").unbind("dblclick");
        //lista.find("li").dblclick( _elementoDoppioClick.bind(this) );
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
        if( this._selezionati.filter( function( elem ){ return elem.indexOf( MultiSelector.TIPI_LISTE.LISTA ) !== -1; }).length === 0 )
            return false;

        _sposta.call( this, this._dati_lista, this._dati_carrello );
        _aggiornaListe.call(this);
    }

    function _rimuoviElementoDaCarrello( )
    {
        if( this._selezionati.filter( function( elem ){ return elem.indexOf( MultiSelector.TIPI_LISTE.CARRELLO ) !== -1; }).length === 0 )
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
            _eventoAsincrono.call( this, this._settings.elemAggiunti, selezionati, da_lista, in_lista );
        if ( typeof this._settings.elemRimossi === "function" && !$( da_lista ).is( this._dati_lista ) )
            _eventoAsincrono.call( this, this._settings.elemRimossi, selezionati, in_lista, da_lista );
    }

    function _setPopovers( elements )
    {
        var is_mobile = Utils.isDeviceMobile();

        if ( !is_mobile )
        {
            elements.popover( {
                trigger: 'hover',
                placement: 'top',
                html : true,
                container: "body"
            } );
        }
        else
        {
            elements.popover( {
                trigger: 'manual',
                html : true,
                container: "body",
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
                if( $( this ).is(".selected") )
                    $( this ).popover( "show" );
            } );

            elements.on( 'inserted.bs.popover', function ()
            {
                var close = $( "<a class='pull-right'><i class='fa fa-times' aria-hidden='true'></i></a>" );

                $( '.popover-title' ).append( close );
                close.click( function ()
                {
                    console.log(11);
                    elements.popover( "hide" );
                } );
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

        _aggiornaListe.call(this, false);
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
        for( var s = this._selezionati.length - 1; s >= 0; s-- )
        {
            var selezionato = this._selezionati[s],
                splittato   = selezionato.split("_"),
                lista       = splittato[0],
                indice      = splittato[1],
                elem        = this["elem_"+lista].find("li").eq( indice );

            if( this._gia_selezionati.indexOf( selezionato ) === -1 )
            {
                this._selezionati.splice( s, 1 );
                if (typeof this._settings.elemDeselezionato === "function")
                    _eventoAsincrono.call(this, this._settings.elemDeselezionato, lista, this["_dati_" + lista][elem.attr("data-index")], this["_dati_" + lista], elem, []);
            }
        }

        this.elem_lista.find("li").removeClass("selected");
        this.elem_carrello.find("li").removeClass("selected");
        _controllaTuttiPrerequisiti.call(this);
    };

    MultiSelector.prototype.deselezionaUltimo = function( )
    {
        var selezionato = this._selezionati.pop(),
            splittato   = selezionato.split("_"),
            lista       = splittato[0],
            indice      = splittato[1],
            elem        = this["elem_"+lista].find("li").eq( indice );

        elem.removeClass("selected");
        _controllaTuttiPrerequisiti.call(this);
    };

    MultiSelector.prototype.numeroCarrello = function( )
    {
        return this.elem_carrello.find("li").size();
    };

    MultiSelector.prototype.numeroLista = function( )
    {
        return this.elem_lista.find("li").size();
    };

    MultiSelector.prototype.datiListaAttuali = function( )
    {
        return this._dati_lista;
    };

    MultiSelector.prototype.lista = function( )
    {
        return this._dati_lista;
    };

    MultiSelector.prototype.carrello = function( )
    {
        return this._dati_carrello;
    };

    MultiSelector.prototype.ridisegnaListe = function( )
    {
        _aggiornaListe.call( this, false );
    };

    MultiSelector.prototype.datiSelezionati = function( )
    {
        var indici_sel     = this._selezionati.map( function( elem ){ return parseInt( elem.replace(/\D/g, "") ); }),
            selezionati    = this._dati_lista.filter( function( elem, i ){ return indici_sel.indexOf( i ) !== -1; }),
            selezionati    = selezionati.filter( function( elem ){ return !elem.gia_selezionato; });

        return selezionati;
    };

    MultiSelector.prototype.crea = function( )
    {
        _getDOMElements.call(this);
        _impostaPulsanti.call( this );
        _aggiornaListe.call(this);
        _controllaGiaSelezionati.call(this);
    };

    MultiSelector.prototype.toString = function( )
    {
        return "[ MultiSelector - " + this._settings.id_lista + " ]";
    };

    return MultiSelector;
})();