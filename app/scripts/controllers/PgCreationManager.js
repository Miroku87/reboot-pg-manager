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
        },

        onMSError: function ( err )
        {
            console.log( err );
        },

        classeCivileRenderizzata: function ( dato, lista, indice, dom_elem )
        {
            //dato.costo_classe = Constants.COSTI_PROFESSIONI[ this.ms_classi_civili.numeroCarrello() ];
            //dato.innerHTML = dom_elem[0].innerHTML = dato.nome_classe + " ( " + Constants.COSTI_PROFESSIONI[ this.ms_classi_civili.numeroCarrello() ] + " PX )";
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
            }
            catch ( e )
            {
                if( e.message === Contatore.ERRORS.VAL_TROPPO_BASSO )
                {
                    this.ms_classi_civili.deselezionaUltimo();
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
                    elemRenderizzato   : this.classeCivileRenderizzata.bind(this),
                    elemAggiunti       : this.inserisciDatiAbilitaCivili.bind(this),
                    elemRimossi        : this.classiCiviliRimosse.bind(this)
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

        classiMilitariRimosse: function ( rimossi, dati_lista, dati_carrello )
        {
            for( var r in rimossi )
            {
                var dato     = rimossi[r],
                    spostare = [];

                if( !dato.id_classe )
                    continue;

                spostare = dati_carrello.filter( function( el ){ return el.prerequisito_classe === dato.id_classe; });
                this.ms_abilita_militari.rimuoviDatiLista( "id_classe", dato.id_classe );

                if( spostare.length > 0 )
                {
                    for( var s in spostare )
                    {
                        if (spostare[s].id_classe)
                        {
                            this.ms_classi_militari.spostaDaCarrello("id_classe", spostare[s].id_classe);
                            this.ms_abilita_militari.rimuoviDatiLista( "id_classe", spostare[s].id_classe );
                        }
                    }
                }
            }
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
                    elemAggiunti       : this.inserisciDatiAbilitaMilitari.bind(this),
                    elemRimossi        : this.classiMilitariRimosse.bind( this )
                });
            this.ms_classi_militari.crea();

            this.punti_comb = new Contatore(
                {
                    elemento    : $("#puntiCombattimento"),
                    valore_max  : Constants.PC_TOT
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
            else if( parseInt( elem.prerequisito_abilita ) === Constants.PREREQUISITO_4_SPORTIVO ) //TODO: gli elementi selezionati grazie al fatto che un altra era selezionata
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
                    onError            : this.onMSError.bind( this )
                });
            this.ms_abilita_civili.crea();
        },

        classiCiviliRimosse: function ( rimossi, in_lista, da_lista )
        {
            for( var r in rimossi )
            {
                var dato = rimossi[r];

                if( dato.id_classe )
                {
                    this.ms_abilita_civili.rimuoviDatiLista("id_classe", dato.id_classe); //TODO: rimuovere anche da carrello
                    this.punti_exp.aumentaConteggio( dato.costo_classe );
                }
            }

            var indice_costo   = this.ms_classi_civili.numeroCarrello();

            for( var l in in_lista )
            {
                var d = in_lista[l];

                if( d.id_classe )
                {
                    d.costo_classe = Constants.COSTI_PROFESSIONI[indice_costo];
                    d.innerHTML = d.nome_classe + " ( " + d.costo_classe + " PX )";
                }
            }

            this.ms_classi_civili.ridisegnaListe();
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
                    onError            : this.onMSError.bind( this )
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
            this.ricalcolaCostiClassiCivili();

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
                errori = "";

            if( !$( "#nomePG").val() || ( $( "#nomePG").val() && vuoto.test( $( "#nomePG").val() ) ) )
                errori += "<li>Il campo nome utente non pu&ograve; essere vuoto.</li>";
            if( $( "#" + CIVILIAN_CLASS_BUCKET_ID ).find("li").size() === 0 )
                errori += "<li>Devi acquistare almeno una professione.</li>";
            if( $( "#" + CIVILIAN_ABILITY_BUCKET_ID ).find("li").size() === 0 )
                errori += "<li>Devi acquistare almeno un'abilit&agrave; civile.</li>";
            if( $( "#" + MILITARY_CLASS_BUCKET_ID ).find("li").size() === 0 )
                errori += "<li>Devi acquistare almeno una classe militare.</li>";
            if( $( "#" + MILITARY_ABILITY_BUCKET_ID ).find("li").size() === 0 )
                errori += "<li>Devi acquistare almeno un'abilit&agrave; militare.</li>";

            if( errori )
            {
                Utils.showError( "Sono stati rilevati degli errori:<ul>" + errori + "</ul>" );
                return false;
            }

            var id_cl     = 0,
                id_ab     = 0,
                classi    = $( "#" + CIVILIAN_CLASS_BUCKET_ID + " li, #" + MILITARY_CLASS_BUCKET_ID + " li")
                                .toArray()
                                .reduce( function( pre, curr ){ return pre + "classi["+id_cl+"][id]=" + $(curr).attr("data-id") + "&classi["+(id_cl++)+"][pre]=" + ( $(curr).attr("data-prerequisito") || "null" ) + "&"; }, ""),

                abilita   = $( "#" + CIVILIAN_ABILITY_BUCKET_ID + " li, #" + MILITARY_ABILITY_BUCKET_ID + " li")
                                .toArray()
                                .reduce( function( pre, curr ){ return pre + "abilita["+id_ab+"][id]=" + $(curr).attr("data-id") + "&abilita["+(id_ab++)+"][pre]=" + ( $(curr).attr("data-prerequisito") || "null" ) + "&"; }, ""),

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