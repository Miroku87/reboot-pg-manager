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
        MILITARY_ADVA_CLASS_LABEL  = "avanzata",
        EXP                        = "Esperienza",
        COM                        = "Combattimento",
        PX_TOT                     = 100,
        PC_TOT                     = 18,
        COSTI_PROFESSIONI          = [30,50,70,100,100,150,200];

    return {
        init: function ()
        {
            this.getClassesInfo();
        },

        controllaPrerequisitoClasseMilitare: function ( elem, dati_lista, dati_carrello )
        {
            return true;
        },

        controllaPrerequisitoAbilita: function ( elem, dati_lista, dati_carrello )
        {
            if( parseInt( elem.prerequisito_abilita ) === Constants.PREREQUISITO_4_SPORTIVO )
                return dati_carrello.filter( function( e ){ return parseInt( e.id_classe ) === 1; }).length >= 4;

            return false;
        },

        classeCivileRenderizzata: function ( dato, lista, indice, dom_elem )
        {
            dato.innerHTML = dom_elem[0].innerHTML = dato.nome_classe + " ( " + COSTI_PROFESSIONI[indice] + " PX )";
            console.log( dati, dom_elem );
        },

        classeCivileSelezionata: function ( dati_lista, dom_elem )
        {

        },

        setClassList: function ()
        {
            var dati = [];

            for( var d in this.classInfos.classi.civile )
            {
                var dato = this.classInfos.classi.civile[d];

                if( typeof dato === "object" )
                {
                    dato = JSON.parse( JSON.stringify( dato ) );

                    dato.innerHTML = dato.nome_classe + " ( 30 PX )";
                    dato.prerequisito = null;
                    dati.push( dato );
                }
            }

            /*for( var d in this.classInfos.abilita["1"] )
            {
                var dato = this.classInfos.abilita["1"][d];

                if( typeof dato === "object" )
                {
                    dato = JSON.parse( JSON.stringify( dato ) );

                    dato.innerHTML = dato.nome_abilita + " ( " + dato.costo_abilita + " PX )";
                    dato.prerequisito = null;

                    if( dato.prerequisito_abilita && dato.prerequisito_abilita > 0 )
                        dato.prerequisito = { id_abilita: dato.prerequisito_abilita }
                    else if( dato.prerequisito_abilita && dato.prerequisito_abilita < 0 )
                        dato.prerequisito = this.controllaPrerequisitoAbilita;


                    dati.push( dato );
                }
            }*/

            var ms_classi_civili = new MultiSelector(
                {
                    id_lista           : CIVILIAN_CLASS_LIST_ID,
                    id_carrello        : CIVILIAN_CLASS_BUCKET_ID,
                    id_btn_aggiungi    : "aggiungiClasseCivile",
                    id_btn_rimuovi     : "rimuoviClasseCivile",
                    ordina_per_attr    : "id_classe",
                    dati_lista         : dati,
                    elemSelezionato    : this.classeCivileSelezionata,
                    elemRenderizzato   : this.classeCivileRenderizzata
                });
        },

        getClassesInfo: function ()
        {
            this.px_ora     = PX_TOT;
            this.pc_ora     = PC_TOT;

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
                        this.setClassList();
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