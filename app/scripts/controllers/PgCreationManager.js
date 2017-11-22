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
            this.setSharedVariables();
            this.setClassList();
            this.setListeners();
        },

        setSharedVariables: function ()
        {
            this.classInfos = JSON.parse( window.localStorage.getItem("classinfos") );
            this.px_ora     = PX_TOT;
            this.pc_ora     = PC_TOT;

            this.updateRemainingPoints( EXP, this.px_ora );
            this.updateRemainingPoints( COM, this.pc_ora );
        },

        setListeners: function ()
        {
            $("[data-toggle='tooltip']").tooltip();
            $("#inviaDati").click(this.inviaDati.bind(this));
        },

        nomeRequisito: function ( element )
        {
            var id_prerequisito = parseInt( element.attr("data-prerequisito"));

            if( element.parent().is( $( "#"+CIVILIAN_ABILITY_LIST_ID ) ) )
            {
                if( id_prerequisito === -1 )
                    return "Almeno 4 abilit&agrave; da Sportivo.";

                return this.classInfos.abilita_civili.filter( function( item ){ return parseInt( item.id_abilita ) === id_prerequisito; } )[0].nome_abilita;
            }
            else if ( element.parent().is( $( "#"+MILITARY_ABILITY_LIST_ID ) ) )
            {
                var classe = this.classInfos.classi_militari.filter( function( item ){ return item.id_classe && parseInt( item.id_classe ) === parseInt( element.attr("data-classe") ); } )[0].nome_classe;

                if( id_prerequisito === -1 )
                    return "tutte le abilit&agrave; della classe "+classe+".";
                else if( id_prerequisito === -2 )
                    return "servono le abilit&agrave; FUOCO A TERRA e TIRATORE SCELTO.";
                else if( id_prerequisito === -3 )
                    return "almeno 5 abilit&agrave; di Supporto Base.";
                else if( id_prerequisito === -4 )
                    return "almeno 3 abilit&agrave; per CONTROLLER.";

                return this.classInfos.abilita_militari.filter( function( item ){ return parseInt( item.id_abilita ) === id_prerequisito; } )[0].nome_abilita;
            }
        },

        prerequisitoCivileRaggiunto: function ( abilita )
        {
            if( parseInt( abilita.prerequisito_abilita ) === -1 )
                return $("#" + CIVILIAN_ABILITY_BUCKET_ID).find("li[data-classe='"+abilita.id_classe+"']").length >= 4;

            return abilita.prerequisito_abilita === null || $( "#"+CIVILIAN_ABILITY_BUCKET_ID ).find("li[data-id='"+abilita.prerequisito_abilita+"']").length > 0;
        },

        aggiornaListaAbilitaCivili: function ( e )
        {
            var classi_selezionate = $( "#" + CIVILIAN_CLASS_BUCKET_ID ).find("li").toArray().map( function( item ){ return $( item).attr("data-id"); } ),
                abilita_lista      = this.classInfos.abilita_civili.filter( function( item ){ return item.id_classe && classi_selezionate.indexOf( item.id_classe+"" ) !== -1; } ),
                abilita            = {},
                abilita_elem       = {};

            $( "#" + CIVILIAN_ABILITY_LIST_ID ).html("");

            for( var a in abilita_lista )
            {
                abilita = abilita_lista[a];
                if( parseInt( abilita.costo_abilita ) <= this.px_ora &&
                    $("#"+CIVILIAN_ABILITY_BUCKET_ID).find("li[data-id='"+abilita.id_abilita+"']").length === 0 )
                {
                    abilita_elem = $( "<li data-id=\"" + abilita.id_abilita + "\" data-classe=\"" + abilita.id_classe + "\" data-prerequisito=\"" + abilita.prerequisito_abilita + "\" data-costo='" + abilita.costo_abilita + "'>" + abilita.nome_abilita + "</li>" );
                    abilita_elem.attr("data-toggle","popover");
                    abilita_elem.attr("data-placement","top");
                    abilita_elem.attr("data-content",abilita.descrizione_abilita);

                    if( !this.prerequisitoCivileRaggiunto( abilita ) )
                        abilita_elem.attr("disabled",true);

                    $("#" + CIVILIAN_ABILITY_LIST_ID).append(abilita_elem);
                }
            }

            this.setPopovers();
            this.setupListSelect();
            this.setupAbilityMarket();
        },

	    /**
         * -1: servono tutte le abilta della classe dell'abilita che si sta cercando di inserire
         * -2: servono FUOCO A TERRA e TIRATORE SCELTO (id 44 e 39)
         * -3: servono almeno 5 abilita di Supporto Base (id 5)
         * -4: servono almeno 3 abilita "CONTROLLER"
         * @param abilita
         * @returns {boolean}
         */
        prerequisitoMilitareRaggiunto: function ( abilita, lista )
        {
            var num_abilita_classe = this.classInfos.abilita_militari.filter( function( item ){ return item.id_classe && item.id_classe === abilita.id_classe; }).length;

            if( parseInt( abilita.prerequisito_abilita ) === -1 )
                return $("#" + MILITARY_ABILITY_BUCKET_ID).find("li[data-classe='"+abilita.id_classe+"']").length === num_abilita_classe - 1;
            else if( parseInt( abilita.prerequisito_abilita ) === -2 )
                return $("#" + MILITARY_ABILITY_BUCKET_ID).find("li[data-id='44']").length > 0 && $("#" + MILITARY_ABILITY_BUCKET_ID).find("li[data-id='39']").length > 0;
            else if( parseInt( abilita.prerequisito_abilita ) === -3 )
            {
                return $("#" + MILITARY_ABILITY_BUCKET_ID).find("li[data-classe='5']").length >= 5;
            }
            else if( parseInt( abilita.prerequisito_abilita ) === -4 )
                return $("#" + MILITARY_ABILITY_BUCKET_ID).find("li:contains(CONTROLLER)").length >= 3;

            return abilita.prerequisito_abilita === null || $( "#"+MILITARY_ABILITY_BUCKET_ID ).find("li[data-id='"+abilita.prerequisito_abilita+"']").length > 0;
        },

        aggiornaListaAbilitaMilitari: function ()
        {
            var classi_selezionate = $( "#" + MILITARY_CLASS_BUCKET_ID ).find("li").toArray().map( function( item ){ return $( item ).attr("data-id"); } ),
                abilita_lista      = this.classInfos.abilita_militari.filter( function( item ){ return item.id_classe && classi_selezionate.indexOf( item.id_classe+"" ) !== -1; } ),
                abilita            = {},
                abilita_elem       = {};

            $( "#" + MILITARY_ABILITY_LIST_ID ).html("");

            for( var a in abilita_lista )
            {
                abilita = abilita_lista[a];
                if( parseInt( abilita.costo_abilita ) <= this.pc_ora &&
                    $("#"+MILITARY_ABILITY_BUCKET_ID).find("li[data-id='"+abilita.id_abilita+"']").length === 0 )
                {
                    abilita_elem = $( "<li data-id=\"" + abilita.id_abilita + "\" data-classe=\"" + abilita.id_classe + "\" data-prerequisito=\"" + abilita.prerequisito_abilita + "\" data-costo='" + abilita.costo_abilita + "'>" + abilita.nome_abilita + "</li>" );
                    abilita_elem.attr("data-toggle","popover");
                    abilita_elem.attr("data-placement","top");
                    abilita_elem.attr("data-content",abilita.descrizione_abilita);

                    if( !this.prerequisitoMilitareRaggiunto( abilita ) )
                        abilita_elem.attr("disabled",true);

                    $("#" + MILITARY_ABILITY_LIST_ID).append(abilita_elem);
                }
            }

            this.setPopovers();
            this.setupListSelect();
            this.setupAbilityMarket();
        },

        setClassList: function ()
        {
            var classe       = {};

            for( var cc in this.classInfos.classi_civili )
            {
                classe = this.classInfos.classi_civili[cc];
                if( classe.id_classe )
                    $("#" + CIVILIAN_CLASS_LIST_ID)
                        .append( "<li data-id=\"" + classe.id_classe + "\">" + classe.nome_classe + "</li>" );
            }

            for( var cc in this.classInfos.classi_militari )
            {
                classe = this.classInfos.classi_militari[cc];

                if( classe.id_classe )
                {
                    var disabled = classe.nome_classe.indexOf( MILITARY_ADVA_CLASS_LABEL ) !== -1 ? "disabled='disabled'" : "";
                    $("#" + MILITARY_CLASS_LIST_ID)
                        .append("<li data-id=\"" + classe.id_classe + "\" "+disabled+">" + classe.nome_classe + "</li>");
                }
            }

            this.setupListSelect();
            this.setupClassesMarket();
        },

        mostraNuovaListaClassiMilitari: function ()
        {

        },

        setPopovers: function ()
        {
            var is_mobile = Utils.isDeviceMobile();

            if ( !is_mobile )
            {
                $( '[data-toggle="popover"]' ).popover( {
                    trigger: 'hover'
                } );
            }
            else
            {
                $( '[data-toggle="popover"]' ).popover( {
                    trigger: 'manual',
                    placement: function ( popover_elem, li_elem )
                    {
                        if ( $( li_elem ).parent().attr( "id" ) === CIVILIAN_ABILITY_BUCKET_ID || $( li_elem ).parent().attr( "id" ) === MILITARY_ABILITY_BUCKET_ID )
                            return 'bottom';
                        else
                            return 'top';
                    }
                } );

                $( '.list-select li' ).click( function ( event )
                {
                    $( this ).parent().find( '[data-toggle="popover"]' ).popover( "hide" );
                    $( this ).popover( "show" );
                } );

                $( '.list-select li' ).on( 'inserted.bs.popover', function ()
                {
                    var close = $( "<div class='popover-close-btn'><span class='fa fa-times' aria-hidden='true'></span></div>" );
                    close.click( function ()
                    {
                        $( '[data-toggle="popover"]' ).popover( "hide" );
                    } );

                    $( '.popover-body' ).append( close );
                } );
            };
        },

        selezionabile: function ( elem )
        {
            if( elem.parent().attr("id").toLowerCase().indexOf("classi") !== -1 && elem.attr("disabled") === "disabled")
            {
                Utils.showError("Non puoi acquistare questa classe.");
                return false;
            }
            else if( elem.parent().attr("id").toLowerCase().indexOf("abilita") !== -1 && elem.attr("disabled") === "disabled" )
            {
                Utils.showError("Non puoi acquistare questa abilit&agrave; in quanto non ne hai i requisiti: "+this.nomeRequisito( elem ));
                return false;
            }

            return true;
        },

        elementoSelezionato: function ( elem )
        {
            //MILITARY_BASE_CLASS_LABEL

            if(elem.parent().is( $( "#listaClassiMilitari" )))
            {
                if (elem.parent().find(".selected").size() === 2)
                {
                    elem.parent().find("li").not(".selected").attr("disabled", true);
                    return;
                }

                elem.parent().find("li").attr("disabled", false);

                if (elem.hasClass("selected") &&
                    elem.text().indexOf(MILITARY_BASE_CLASS_LABEL) !== -1
                )
                {
                    elem.parent()
                        .find("li:contains(" + MILITARY_ADVA_CLASS_LABEL + ")")
                        .not("li[data-id='" + (parseInt(elem.attr("data-id")) + 1) + "']")
                        .attr("disabled", true);
                }
                else if (!elem.hasClass("selected"))
                {
                    this.elementoSelezionato( elem.parent().find(".selected") );
                }
            }
        },

        setupListSelect: function ()
        {
            var _this = this;

            $( '.list-select li' ).unbind("click");
            $( '.list-select li' ).click( function ()
            {
                if( _this.selezionabile.call( _this, $( this ) ) )
                {
                    $( this ).toggleClass( "selected" );
                    _this.elementoSelezionato( $( this ) );
                }
            });
        },

        updateRemainingPoints: function ( which, offset )
        {
            var actual_points = parseInt( $( '#punti' + which ).text(), 10 ),
                new_points = offset,//actual_points + offset,
                tot = which === EXP ? PX_TOT : PC_TOT;

            $( '#punti' + which ).text( new_points );
            $( '#punti' + which ).removeClass( "badge-success badge-warning badge-danger" );

            if ( new_points / tot >= .5 )
                $( '#punti' + which ).addClass( "badge-success" );
            else if ( new_points / tot >= .25 && new_points / tot < .5 )
                $( '#punti' + which ).addClass( "badge-warning" );
            else if ( new_points / tot < .25 )
                $( '#punti' + which ).addClass( "badge-danger" );
        },

        calcolaCostoClassiCivili: function ( )
        {
            var costo = 0;

            $("#"+CIVILIAN_CLASS_BUCKET_ID).find("li").each(function ( i, elem )
            {
                costo += COSTI_PROFESSIONI[i];
                $(elem).text( $(elem).text().replace(/\(.*?\)/,"") + " ( " + COSTI_PROFESSIONI[i] + " PX )" );
            });

            return costo;
        },

        spostaNelCestino: function ( list_id, bucket_id )
        {
            var selected = $( '#' + list_id ).find( 'li.selected' ),
                points   = list_id.toLowerCase().indexOf("civili") !== -1 ? EXP : COM,
                costo    = selected.toArray()
                                   .map( function( item ){ return parseInt( $(item).attr("data-costo") ); } )
                                   .reduce( function( pre, curr ){ console.log(pre,curr); return pre + curr; } );
            console.log(costo);
            $( '[data-toggle="popover"]' ).popover( "hide" );
            selected
                .removeClass( "selected" )
                .appendTo( $( '#' + bucket_id ) );


            Utils.sortChildrenByAttribute( $( '#' + list_id ), "li", "data-id" );
            Utils.sortChildrenByAttribute( $( '#' + bucket_id ), "li", "data-id" );

            if( list_id === CIVILIAN_CLASS_LIST_ID )
            {
                var costo = this.calcolaCostoClassiCivili();
                this.updateRemainingPoints( points, this.px_ora -= costo );
            }
        },
		//TODO: controllare che dopo il drop i prerequisiti esistano ancora
        rimuoviDalCestino: function ( list_id, bucket_id )
        {
            var selected = $( '#' + bucket_id ).find( 'li.selected' ),
                points = list_id === CIVILIAN_ABILITY_LIST_ID ? EXP : COM;

            $( '[data-toggle="popover"]' ).popover( "hide" );
            selected
                .removeClass( "selected" )
                .appendTo( $( '#' + list_id ) );

            //this.updateRemainingPoints( points, selected.length * 1 );

            Utils.sortChildrenByAttribute( $( '#' + list_id ), "li", "data-id" );
            Utils.sortChildrenByAttribute( $( '#' + bucket_id ), "li", "data-id" );
        },

        setupClassesMarket: function ()
        {
            $( '.compra-classe-civile-btn' ).unbind("click");
            $( '.compra-classe-civile-btn' ).click( function ()
            {
                this.spostaNelCestino( CIVILIAN_CLASS_LIST_ID, CIVILIAN_CLASS_BUCKET_ID );
                this.aggiornaListaAbilitaCivili();
            }.bind( this ) );

            $( '.butta-classe-civile-btn' ).unbind("click");
            $( '.butta-classe-civile-btn' ).click( function ()
            {
                this.rimuoviDalCestino( CIVILIAN_CLASS_LIST_ID, CIVILIAN_CLASS_BUCKET_ID );
                this.aggiornaListaAbilitaCivili();
            }.bind( this ) );

            $( '.compra-classe-militare-btn' ).unbind("click");
            $( '.compra-classe-militare-btn' ).click( function ()
            {
                this.spostaNelCestino( MILITARY_CLASS_LIST_ID, MILITARY_CLASS_BUCKET_ID );
                this.aggiornaListaAbilitaMilitari();
            }.bind( this ) );

            $( '.butta-classe-militare-btn' ).unbind("click");
            $( '.butta-classe-militare-btn' ).click( function ()
            {
                this.rimuoviDalCestino( MILITARY_CLASS_LIST_ID, MILITARY_CLASS_BUCKET_ID );
                this.aggiornaListaAbilitaMilitari();
            }.bind( this ) );
        },

        setupAbilityMarket: function ()
        {
            $( '.compra-abilita-civile-btn' ).unbind("click");
            $( '.compra-abilita-civile-btn' ).click( function ()
            {
                this.spostaNelCestino( CIVILIAN_ABILITY_LIST_ID, CIVILIAN_ABILITY_BUCKET_ID );
                this.aggiornaListaAbilitaCivili();
            }.bind( this ) );

            $( '.butta-abilita-civile-btn' ).unbind("click");
            $( '.butta-abilita-civile-btn' ).click( function ()
            {
                this.rimuoviDalCestino( CIVILIAN_ABILITY_LIST_ID, CIVILIAN_ABILITY_BUCKET_ID );
                this.aggiornaListaAbilitaCivili();
            }.bind( this ) );

            $( '.compra-abilita-militare-btn' ).unbind("click");
            $( '.compra-abilita-militare-btn' ).click( function ()
            {
                this.spostaNelCestino( MILITARY_ABILITY_LIST_ID, MILITARY_ABILITY_BUCKET_ID );
                this.aggiornaListaAbilitaMilitari();
            }.bind( this ) );

            $( '.butta-abilita-militare-btn' ).unbind("click");
            $( '.butta-abilita-militare-btn' ).click( function ()
            {
                this.rimuoviDalCestino( MILITARY_ABILITY_LIST_ID, MILITARY_ABILITY_BUCKET_ID );
                this.aggiornaListaAbilitaMilitari();
            }.bind( this ) );
        },

        inviaDati: function ()
        {

        }
    };
}();

// eslint-disable-line no-console
$(function () {
    RegistrationManager.init();
});