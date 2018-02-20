    var RegistrationManager = function ()
{
    var CIVILIAN_CLASS_LIST_ID     = "listaClassiCivili",
        CIVILIAN_CLASS_BUCKET_ID   = "listaClassiCiviliAcquistate",
        MILITARY_CLASS_LIST_ID     = "listaClassiMilitari",
        MILITARY_CLASS_BUCKET_ID   = "listaClassiMilitariAcquistate",
        CIVILIAN_ABILITY_LIST_ID   = "listaAbilitaCivili",
        CIVILIAN_ABILITY_BUCKET_ID = "listaAbilitaCiviliAcquistate",
        MILITARY_ABILITY_LIST_ID   = "listaAbilitaMilitari",
        MILITARY_ABILITY_BUCKET_ID = "listaAbilitaMilitariAcquistate",
        MILITARY_BASE_CLASS_LABEL  = "base",
        MILITARY_ADVA_CLASS_LABEL  = "avanzata";

    return {
        init: function ()
        {
            this.getClassesInfo();
            $("#inviaDati").click( this.inviaDati.bind(this) );
        },

        onMSError: function ( err )
        {
            console.log( err );
        },

        classeCivileRenderizzata: function ( dato, lista, indice, dom_elem )
        {
            //dato.costo_classe = Constants.COSTI_PROFESSIONI[ this.ms_classi_civili.numeroCarrello() ];
            //dato.innerHTML = dom_elem[0].innerHTML = dato.nome_classe + " ( " + Constants.COSTI_PROFESSIONI[
            // this.ms_classi_civili.numeroCarrello() ] + " PX )";
        },

        ricalcolaCostiClassiCivili: function ( )
        {
            var indice_costo   = this.ms_classi_civili.numeroCarrello(),
                dati_lista     = this.ms_classi_civili.datiListaAttuali();

            for( var l in dati_lista )
            {
                var d = dati_lista[l];

                if( d.id_classe )
                {
                    d.costo_classe = Constants.COSTI_PROFESSIONI[indice_costo];
                    d.innerHTML = d.nome_classe + " ( " + d.costo_classe + " PX )";
                }
            }

            this.ms_classi_civili.ridisegnaListe();
        },

        classeCivileSelezionata: function ( tipo_lista, dato, lista, dom_elem, selezionati )
        {
            if( tipo_lista !== MultiSelector.TIPI_LISTE.LISTA )
                return false;

            var indice_costo   = this.ms_classi_civili.numeroCarrello() + selezionati.length,
                id_selezionati = selezionati.map( function( el ){ return el.replace(/\D/g, "")+""; } );

            for( var l in lista )
            {
                var d = lista[l];

                if( d.id_classe && id_selezionati.indexOf( l ) === -1 )
                {
                    d.costo_classe = Constants.COSTI_PROFESSIONI[indice_costo];
                    d.innerHTML = d.nome_classe + " ( " + d.costo_classe + " PX )";
                }
            }

            this.ms_classi_civili.ridisegnaListe();

            try
            {
                this.punti_exp.diminuisciConteggio( dato.costo_classe );
                this.inserisciDatiAbilitaCivili([dato]);
            }
            catch ( e )
            {
                if( e.message === Contatore.ERRORS.VAL_TROPPO_BASSO )
                {
                    this.ms_classi_civili.deselezionaUltimo();
                    Utils.showError("Non hai più punti per comprare altre professioni.");
                }
            }
        },

        abilitaCivileSelezionata: function ( tipo_lista, dato, lista, dom_elem, selezionati )
        {
            if( tipo_lista !== MultiSelector.TIPI_LISTE.LISTA )
                return false;

            try
            {
                this.punti_exp.diminuisciConteggio( dato.costo_abilita );
            }
            catch ( e )
            {
                if( e.message === Contatore.ERRORS.VAL_TROPPO_BASSO )
                {
                    this.ms_abilita_civili.deselezionaUltimo();
                    Utils.showError("Non hai più punti per comprare altre abilit&agrave;.");
                }
            }
        },

        classeCivileDeselezionata: function ( tipo_lista, dato, lista, dom_elem, selezionati )
        {
            if( tipo_lista !== MultiSelector.TIPI_LISTE.LISTA )
                return false;

            var indice_costo   = this.ms_classi_civili.numeroCarrello() + selezionati.length,
                id_selezionati = selezionati.map( function( el ){ return el.replace(/\D/g, "")+""; } );

            for( var l in lista )
            {
                var d = lista[l];

                if( d.id_classe && id_selezionati.indexOf( l ) === -1 )
                {
                    d.costo_classe = Constants.COSTI_PROFESSIONI[indice_costo];
                    d.innerHTML = d.nome_classe + " ( " + d.costo_classe + " PX )";
                }
            }

            this.ms_classi_civili.ridisegnaListe();

            this.punti_exp.aumentaConteggio( dato.costo_classe );
            this.ms_abilita_civili.rimuoviDatiLista("id_classe", dato.id_classe);
        },

        abilitaCivileDeselezionata: function ( tipo_lista, dato, lista, dom_elem, selezionati )
        {
            this.punti_exp.aumentaConteggio( dato.costo_abilita );
        },

        abilitaMilitareSelezionata: function ( tipo_lista, dato, lista, dom_elem, selezionati )
        {
            if( tipo_lista !== MultiSelector.TIPI_LISTE.LISTA )
                return false;

            try
            {
                this.punti_comb.diminuisciConteggio( dato.costo_abilita );
            }
            catch ( e )
            {
                if( e.message === Contatore.ERRORS.VAL_TROPPO_BASSO )
                {
                    this.ms_abilita_militari.deselezionaUltimo();
                    Utils.showError("Non hai più punti per comprare altre abilit&agrave;.");
                }
            }
        },

        abilitaMilitareDeselezionata: function ( tipo_lista, dato, lista, dom_elem, selezionati )
        {
            if( tipo_lista !== MultiSelector.TIPI_LISTE.LISTA )
                return false;

            this.punti_comb.aumentaConteggio( dato.costo_abilita );
        },

        impostaMSClassiCivili: function ()
        {
            var dati = [];

            for( var d in this.classInfos.classi.civile )
            {
                var dato = this.classInfos.classi.civile[d];

                if( typeof dato === "object" )
                {
                    dato = JSON.parse( JSON.stringify( dato ) );

                    dato.innerHTML = dato.nome_classe + " ( 30 PX )";
                    dato.costo_classe = 30;
                    dato.prerequisito = null;
                    dati.push( dato );
                }
            }

            this.ms_classi_civili = new MultiSelector(
                {
                    id_lista           : CIVILIAN_CLASS_LIST_ID,
                    id_carrello        : CIVILIAN_CLASS_BUCKET_ID,
                    btn_aggiungi       : $( ".compra-classe-civile-btn" ),
                    btn_rimuovi        : $( ".butta-classe-civile-btn" ),
                    ordina_per_attr    : "id_classe",
                    dati_lista         : dati,
                    onError            : this.onMSError.bind( this ),
                    elemSelezionato    : this.classeCivileSelezionata.bind(this),
                    elemDeselezionato  : this.classeCivileDeselezionata.bind(this),
                    elemRenderizzato   : this.classeCivileRenderizzata.bind(this)
                });
            this.ms_classi_civili.crea();

            this.punti_exp = new Contatore(
                {
                    elemento    : $("#puntiEsperienza"),
                    valore_max  : Constants.PX_TOT,
                    valore_ora  : Constants.PX_TOT
                }
            );
        },

        classeMilitareSelezionata: function ( tipo_lista, dato )
        {
            if( tipo_lista !== MultiSelector.TIPI_LISTE.LISTA )
                return false;

            try
            {
                this.punti_comb.diminuisciConteggio( dato.costo_classe );
                this.inserisciDatiAbilitaMilitari( [dato] )
            }
            catch ( e )
            {
                if( e.message === Contatore.ERRORS.VAL_TROPPO_BASSO )
                {
                    this.ms_classi_militari.deselezionaUltimo();
                    Utils.showError("Non hai più punti per comprare altre classi.");
                }
            }
        },

        classeMilitareDeselezionata: function ( tipo_lista, dato )
        {
            if( tipo_lista !== MultiSelector.TIPI_LISTE.LISTA )
                return false;

            this.punti_comb.aumentaConteggio( dato.costo_classe );
            this.ms_abilita_militari.rimuoviDatiLista( "id_classe", dato.id_classe );
        },

        classeMilitareAcquistabile: function ( id_prerequisito, dato, dati_lista, dati_carrello, selezionati )
        {
            var da_controllare   = dati_carrello.concat( selezionati || []),
                elem_selezionato = selezionati.filter( function( el ){ return el.id_classe === dato.id_classe }).length > 0;

            if( da_controllare.length === 2 && !elem_selezionato )
                return false;

            if( !id_prerequisito )
                return true;

            return da_controllare.filter( function( el ){ return el.id_classe === id_prerequisito; }).length > 0;
        },

        impostaMSClassiMilitari: function ()
        {
            var dati = [];

            for( var d in this.classInfos.classi.militare )
            {
                var dato = this.classInfos.classi.militare[d];

                if( typeof dato === "object" )
                {
                    dato = JSON.parse( JSON.stringify( dato ) );

                    dato.innerHTML = dato.nome_classe + " ( 1 PC )";
                    dato.prerequisito = this.classeMilitareAcquistabile.bind( this, dato.prerequisito_classe );
                    dati.push( dato );
                }
            }

            this.ms_classi_militari = new MultiSelector(
                {
                    id_lista           : MILITARY_CLASS_LIST_ID,
                    id_carrello        : MILITARY_CLASS_BUCKET_ID,
                    btn_aggiungi       : $( ".compra-classe-militare-btn" ),
                    btn_rimuovi        : $( ".butta-classe-militare-btn" ),
                    ordina_per_attr    : "id_classe",
                    dati_lista         : dati,
                    onError            : this.onMSError.bind( this ),
                    elemSelezionato    : this.classeMilitareSelezionata.bind(this),
                    elemDeselezionato  : this.classeMilitareDeselezionata.bind(this)
                });
            this.ms_classi_militari.crea();

            this.punti_comb = new Contatore(
                {
                    elemento    : $("#puntiCombattimento"),
                    valore_max  : Constants.PC_TOT,
                    valore_ora  : Constants.PC_TOT
                }
            );
        },

        controllaPrerequisitoAbilita: function ( elem, dati_lista, dati_carrello, selezionati )
        {
            var da_controllare = dati_carrello.concat( selezionati || [] );

            if( parseInt( elem.prerequisito_abilita ) === Constants.PREREQUISITO_TUTTE_ABILITA )
                return da_controllare.length >= this.classInfos.abilita[ elem.id_classe ].length - 1;
            else if( parseInt( elem.prerequisito_abilita ) === Constants.PREREQUISITO_F_TERRA_T_SCELTO )
                return da_controllare.filter( function( e )
                    {
                        return parseInt( e.id_abilita ) === Constants.ID_ABILITA_F_TERRA ||
                            parseInt( e.id_abilita ) === Constants.ID_ABILITA_T_SCELTO;
                    }).length === 2;
            else if( parseInt( elem.prerequisito_abilita ) === Constants.PREREQUISITO_5_SUPPORTO_BASE )
                return da_controllare.filter( function( e ){ return parseInt( e.id_classe ) === Constants.ID_CLASSE_SUPPORTO_BASE; } ).length >= 5;
            else if( parseInt( elem.prerequisito_abilita ) === Constants.PREREQUISITO_3_CONTROLLER )
                return da_controllare.filter( function( e ){ return e.nome_abilita.toLowerCase().indexOf( "controller" ) !== -1; } ).length >= 3;
            else if( parseInt( elem.prerequisito_abilita ) === Constants.PREREQUISITO_4_SPORTIVO ) //TODO: gli elementi selezionati
                                                                                  // grazie al fatto che un altra era
                                                                                  // selezionata
            {
                da_controllare = da_controllare.filter(function (el)
                {
                    return parseInt( el.id_abilita, 10 ) !== Constants.ID_ABILITA_IDOLO &&
                        ( !el.prerequisito || (el.prerequisito && parseInt( el.prerequisito.id_abilita, 10 ) !== Constants.ID_ABILITA_IDOLO ))
                });

                return da_controllare.filter(function (e)
                    {
                        return parseInt(e.id_classe) === Constants.ID_CLASSE_SPORTIVO;
                    }).length >= 4;
            }

            return false;
        },

        impostaMSAbilitaCivili: function ()
        {
            this.ms_abilita_civili = new MultiSelector(
                {
                    id_lista           : CIVILIAN_ABILITY_LIST_ID,
                    id_carrello        : CIVILIAN_ABILITY_BUCKET_ID,
                    btn_aggiungi       : $( ".compra-abilita-civile-btn" ),
                    btn_rimuovi        : $( ".butta-abilita-civile-btn" ),
                    ordina_per_attr    : "id_abilita",
                    onError            : this.onMSError.bind( this ),
                    elemSelezionato    : this.abilitaCivileSelezionata.bind(this),
                    elemDeselezionato  : this.abilitaCivileDeselezionata.bind(this)
                });
            this.ms_abilita_civili.crea();
        },

        impostaMSAbilitaMilitari: function ()
        {
            this.ms_abilita_militari = new MultiSelector(
                {
                    id_lista           : MILITARY_ABILITY_LIST_ID,
                    id_carrello        : MILITARY_ABILITY_BUCKET_ID,
                    btn_aggiungi       : $( ".compra-abilita-militare-btn" ),
                    btn_rimuovi        : $( ".butta-abilita-militare-btn" ),
                    ordina_per_attr    : "id_abilita",
                    onError            : this.onMSError.bind( this ),
                    elemSelezionato    : this.abilitaMilitareSelezionata.bind(this),
                    elemDeselezionato  : this.abilitaMilitareDeselezionata.bind(this)
                });
            this.ms_abilita_militari.crea();
        },

        inserisciDatiAbilita: function ( selezionati, ms  )
        {
            var dati = [];

            for ( var s in selezionati )
            {
                var id_classe = selezionati[s].id_classe,
                    px_testo  = selezionati[s].tipo_classe === "civile" ? "PX" : "PC";

                for (var d in this.classInfos.abilita[id_classe])
                {
                    var dato = this.classInfos.abilita[id_classe][d];

                    if (typeof dato === "object")
                    {
                        dato = JSON.parse(JSON.stringify(dato));

                        dato.innerHTML = dato.nome_abilita + " ( " + dato.costo_abilita + " " + px_testo + " )";
                        dato.prerequisito = null;
                        dato.title = dato.nome_abilita ? dato.nome_abilita : dato.nome_classe;

                        if( dato.descrizione_abilita )
                        {
                            dato.content = dato.descrizione_abilita;
                            dato.title = dato.nome_abilita;
                            delete dato.descrizione_abilita;
                        }

                        if (dato.prerequisito_abilita && dato.prerequisito_abilita > 0)
                            dato.prerequisito = {id_abilita : dato.prerequisito_abilita};
                        else if (dato.prerequisito_abilita && dato.prerequisito_abilita < 0)
                            dato.prerequisito = this.controllaPrerequisitoAbilita.bind(this);

                        dati.push(dato);
                    }
                }
            }

            ms.aggiungiDatiLista( dati );
        },

        inserisciDatiAbilitaCivili: function ( selezionati  )
        {
            this.inserisciDatiAbilita.call( this, selezionati, this.ms_abilita_civili );
        },

        inserisciDatiAbilitaMilitari: function ( selezionati  )
        {
            this.inserisciDatiAbilita.call( this, selezionati, this.ms_abilita_militari );
        },

        getClassesInfo: function ()
        {
            $.ajax({
                url: Constants.API_GET_INFO,
                method: "GET",
                xhrFields: {
                    withCredentials: true
                },
                success: function( data )
                {
                    if ( data.status === "ok" )
                    {
                        this.classInfos = data.info;
                        this.impostaMSClassiCivili();
                        this.impostaMSClassiMilitari();
                        this.impostaMSAbilitaCivili();
                        this.impostaMSAbilitaMilitari();
                    }
                    else if ( data.status === "error" )
                    {
                        Utils.showError( data.message );
                    }
                }.bind(this),
                error: function ( jqXHR, textStatus, errorThrown )
                {
                    Utils.showError( textStatus+"<br>"+errorThrown );
                }
            });
        },

        goToMainPage: function ()
        {
            window.location.href = Constants.MAIN_PAGE;
        },

        inviaDati: function ()
        {
            var vuoto  = /^\s+$/,
                errori = "",
                cc_selezionate = this.ms_classi_civili.datiSelezionati(),
                cm_selezionate = this.ms_classi_militari.datiSelezionati(),
                ac_selezionate = this.ms_abilita_civili.datiSelezionati(),
                am_selezionate = this.ms_abilita_militari.datiSelezionati();

            if( !$( "#nomePG").val() || ( $( "#nomePG").val() && vuoto.test( $( "#nomePG").val() ) ) )
                errori += "<li>Il campo nome utente non pu&ograve; essere vuoto.</li>";
            if( cc_selezionate.length === 0 )
                errori += "<li>Devi acquistare almeno una professione.</li>";
            if( cm_selezionate.length === 0 )
                errori += "<li>Devi acquistare almeno un'abilit&agrave; civile.</li>";
            if( ac_selezionate.length === 0 )
                errori += "<li>Devi acquistare almeno una classe militare.</li>";
            if( am_selezionate.length === 0 )
                errori += "<li>Devi acquistare almeno un'abilit&agrave; militare.</li>";

            if( errori )
            {
                Utils.showError( "Sono stati rilevati degli errori:<ul>" + errori + "</ul>" );
                return false;
            }

            var id_cl     = 0,
                id_ab     = 0,
                classi    = cc_selezionate.concat( cm_selezionate )
                                .reduce( function( pre, curr )
                                {
                                    return pre + "classi[]=" + curr.id_classe + "&";
                                }, ""),

                abilita   = ac_selezionate.concat( am_selezionate )
                                .reduce( function( pre, curr )
                                {
                                    return pre + "abilita[]=" + curr.id_abilita + "&";
                                }, ""),

                data             = "nome=" + encodeURIComponent( $( "#nomePG").val() ) + "&" + classi + abilita;

            $.ajax(
                Constants.API_POST_CREAPG,
                {
                    method: "POST",
                    data: data,
                    cache: false,
                    //contentType: false,
                    //processData: false,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function( data )
                    {
                        if ( data.status === "ok" )
                        {
                            $("#messageText").html("La creazione è avvenuta con successo.<br>Potrai vedere il tuo nuovo personaggio nella sezione apposita.<br>È consigliato aggiungere un Background.");
                            $("#message").modal("show");
                            $("#message").unbind("hidden.bs.modal");
                            $("#message").on("hidden.bs.modal", this.goToMainPage.bind(this) );
                        }
                        else if ( data.status === "error" )
                        {
                            Utils.showError( data.message );
                            return;
                        }
                    }.bind(this),
                    error: function ( jqXHR, textStatus, errorThrown )
                    {
                        Utils.showError( textStatus+"<br>"+errorThrown );
                    }
                }
            );
        }
    };
}();

// eslint-disable-line no-console
$(function () {
    RegistrationManager.init();
});