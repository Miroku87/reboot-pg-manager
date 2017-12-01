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

        resettaCostoClassiCivili: function ()
        {
            var costo       = 0,
                selected    =  $( "#"+CIVILIAN_CLASS_LIST_ID ).find("li.selected").size(),
                nel_cestino = $( "#"+CIVILIAN_CLASS_BUCKET_ID ).find("li").size();

            $( "#"+CIVILIAN_CLASS_BUCKET_ID ).find("li").each(function ( i, elem )
            {
                costo = COSTI_PROFESSIONI[ i ];
                $(elem).attr("data-costo", costo );
                $(elem).text( $(elem).text().replace(/\(.*?\)/,"") + " ( " + costo + " PX )" );
            });

            $( "#"+CIVILIAN_CLASS_LIST_ID ).find("li.selected").each(function ( i, elem )
            {
                costo = COSTI_PROFESSIONI[ nel_cestino + i ];
                $(elem).attr("data-costo", costo );
                $(elem).text( $(elem).text().replace(/\(.*?\)/,"") + " ( " + costo + " PX )" );
            });

            $( "#"+CIVILIAN_CLASS_LIST_ID ).find("li").not(".selected").each(function ( i, elem )
            {
                costo = COSTI_PROFESSIONI[ nel_cestino + selected ];
                $(elem).attr("data-costo", costo );
                $(elem).text( $(elem).text().replace(/\(.*?\)/,"") + " ( " + costo + " PX )" );
            });
        },

        aggiornaListaClassiMilitari: function ()
        {
            $( "#" + MILITARY_CLASS_BUCKET_ID ).find("li").each(function ( i, elem )
            {
                if( $( elem ).attr("data-prerequisito") !== "null" )
                    $( elem ).appendTo( $( "#" + MILITARY_CLASS_LIST_ID ) );
            });
            Utils.sortChildrenByAttribute( $( '#' + MILITARY_CLASS_LIST_ID ), "li", "data-id" );
        },

        ricalcolaPuntiAttuali: function ()
        {
            var costo_classi_civili    = 0,
                costo_abilita_civili   = 0,
                costo_classi_militari  = 0,
                costo_abilita_militari = 0;

            try
            {
                costo_classi_civili =
                    $("#" + CIVILIAN_CLASS_BUCKET_ID).find("li").toArray()
                                                     .map(function (item)
                                                     {
                                                         return parseInt($(item).attr("data-costo")) || 0;
                                                     })
                                                     .reduce(function (pre, curr)
                                                     {
                                                         return pre + curr;
                                                     }, 0);
            }
            catch (e){}

            try
            {
                costo_abilita_civili =
                    $( "#"+CIVILIAN_ABILITY_BUCKET_ID ).find("li").toArray()
                                                       .map(function (item)
                                                       {
                                                           return parseInt($(item).attr("data-costo")) || 0;
                                                       })
                                                       .reduce(function (pre, curr)
                                                       {
                                                           return pre + curr;
                                                       }, 0);
            }
            catch (e){}

            try
            {
                costo_classi_militari =
                    $( "#"+MILITARY_CLASS_BUCKET_ID ).find("li").toArray()
                                                     .map(function (item)
                                                     {
                                                         return parseInt($(item).attr("data-costo")) || 0;
                                                     })
                                                     .reduce(function (pre, curr)
                                                     {
                                                         return pre + curr;
                                                     }, 0);
            }
            catch (e){}

            try
            {
                costo_abilita_militari =
                    $( "#"+MILITARY_ABILITY_BUCKET_ID ).find("li").toArray()
                                                       .map(function (item)
                                                       {
                                                           return parseInt($(item).attr("data-costo")) || 0;
                                                       })
                                                       .reduce(function (pre, curr)
                                                       {
                                                           return pre + curr;
                                                       }, 0);
            }
            catch (e){}

            this.px_ora = PX_TOT - ( costo_classi_civili + costo_abilita_civili );
            this.pc_ora = PC_TOT - ( costo_classi_militari + costo_abilita_militari );

            this.aggiornaPuntiRimanenti( EXP, this.px_ora );
            this.aggiornaPuntiRimanenti( COM, this.pc_ora );
        },

        calcolaCosto: function ( selected, list_id )
        {
            var costo = 0;

            if( list_id === CIVILIAN_CLASS_LIST_ID )
            {
                var num_cestino  = $("#"+CIVILIAN_CLASS_BUCKET_ID).find("li").size();

                if( selected.first().parent().is( $( "#" + CIVILIAN_CLASS_BUCKET_ID ) ) )
                    num_cestino--;

                selected.each( function( i )
                {
                    costo += COSTI_PROFESSIONI[ num_cestino + i ];
                } );
            }
            else
            {
                costo = selected.toArray()
                                .map(function (item)
                                {
                                    return parseInt($(item).attr("data-costo")) || 0;
                                })
                                .reduce(function (pre, curr)
                                {
                                    return pre + curr;
                                });
            }

            return costo;
        },

        aggiornaPuntiRimanenti: function ( which, offset )
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

        spostaNelCestino: function ( list_id, bucket_id )
        {
            var selected   = $( '#' + list_id ).find( 'li.selected' ),
                points     = list_id.toLowerCase().indexOf("civili") !== -1 ? EXP : COM,
                prop_punti = list_id.toLowerCase().indexOf("civili") !== -1 ? "px_ora" : "pc_ora",
                costo      = this.calcolaCosto( selected, list_id );

            if( costo > this[prop_punti] )
            {
                selected.each( function( i, elem )
                {
                    $(elem).attr("data-costo", null );
                    $(elem).text( $(elem).text().replace(/\(.*?\)/,"")  );
                } );

                Utils.showError("Non hai abbastanza punti per comprare queste abilit&agrave;.");
                return false;
            }

            $( '[data-toggle="popover"]' ).popover( "hide" );
            selected
                .removeClass( "selected" )
                .appendTo( $( '#' + bucket_id ) );

            this.aggiornaPuntiRimanenti( points, this[prop_punti] -= costo );

            Utils.sortChildrenByAttribute( $( '#' + list_id ), "li", "data-id" );
            Utils.sortChildrenByAttribute( $( '#' + bucket_id ), "li", "data-id" );
        },

        rimuoviDalCestino: function ( list_id, bucket_id )
        {
            var selected  = $( '#' + bucket_id ).find( 'li.selected' );

            $( '[data-toggle="popover"]' ).popover( "hide" );
            selected
                .removeClass( "selected" )
                .appendTo( $( '#' + list_id ) );

            Utils.sortChildrenByAttribute( $( '#' + list_id ), "li", "data-id" );
            Utils.sortChildrenByAttribute( $( '#' + bucket_id ), "li", "data-id" );
        },

        nomeRequisito: function ( element )
        {
            var id_prerequisito = parseInt( element.attr("data-prerequisito"));

            if( element.parent().is( $( "#"+CIVILIAN_ABILITY_LIST_ID ) ) )
            {
                if( id_prerequisito === Constants.PREREQUISITO_4_SPORTIVO )
                    return "Almeno 4 abilit&agrave; da Sportivo.";

                return $.map(this.classInfos.abilita.civile).filter( function( item ){ return parseInt( item.id_abilita ) === id_prerequisito; } )[0].nome_abilita;
            }
            else if ( element.parent().is( $( "#"+MILITARY_ABILITY_LIST_ID ) ) )
            {
                var classe = this.classInfos.classi.militare.filter( function( item ){ return item.id_classe && parseInt( item.id_classe ) === parseInt( element.attr("data-classe") ); } )[0].nome_classe;

                if( id_prerequisito === Constants.PREREQUISITO_TUTTE_ABILITA )
                    return "tutte le abilit&agrave; della classe "+classe+".";
                else if( id_prerequisito === Constants.PREREQUISITO_F_TERRA_T_SCELTO )
                    return "servono le abilit&agrave; FUOCO A TERRA e TIRATORE SCELTO.";
                else if( id_prerequisito === Constants.PREREQUISITO_5_SUPPORTO_BASE )
                    return "almeno 5 abilit&agrave; di Supporto Base.";
                else if( id_prerequisito === Constants.PREREQUISITO_3_CONTROLLER )
                    return "almeno 3 abilit&agrave; per CONTROLLER.";

                return $.map(this.classInfos.abilita.militare).filter( function( item ){ return parseInt( item.id_abilita ) === id_prerequisito; } )[0].nome_abilita;
            }
        },

        elementoSelezionato: function ( elem )
        {
            $(  "#" + CIVILIAN_ABILITY_BUCKET_ID + "," +
                "#" + CIVILIAN_ABILITY_LIST_ID + "," +
                "#" + CIVILIAN_CLASS_BUCKET_ID + "," +
                "#" + CIVILIAN_CLASS_LIST_ID + "," +
                "#" + MILITARY_ABILITY_BUCKET_ID + "," +
                "#" + MILITARY_ABILITY_LIST_ID + "," +
                "#" + MILITARY_CLASS_BUCKET_ID + "," +
                "#" + MILITARY_CLASS_LIST_ID
            )
                .not( elem.parent() )
                .find("li")
                .removeClass("selected");

            if( elem.parent().is( $( "#"+MILITARY_CLASS_LIST_ID ) ) )
            {
                if ( $( "#"+MILITARY_CLASS_BUCKET_ID).find("li").size() + elem.parent().find(".selected").size() === 2 )
                {
                    elem.parent().find("li").not(".selected").attr("disabled", true);
                    return;
                }
                else if( $( "#"+MILITARY_CLASS_BUCKET_ID).find("li").size() + elem.parent().find(".selected").size() < 2 )
                {
                    //Metto una pausa di 100ms per evitare problemi con il doppio click
                    setTimeout(function ()
                    {
                        $( "#"+MILITARY_CLASS_LIST_ID ).find("li").not(".selected").not(elem).attr("disabled", true);
                        elem.attr("disabled", false);

                        if (elem.hasClass("selected"))
                        {
                            $( "#"+MILITARY_CLASS_LIST_ID ).find("li[data-prerequisito='" + elem.attr("data-id") + "'], li[data-prerequisito='null']").attr("disabled", false);
                        }
                        else if (!elem.hasClass("selected"))
                        {
                            this.elementoSelezionato( $( "#"+MILITARY_CLASS_LIST_ID ).find(".selected") );
                        }
                    }.bind(this),100);
                }
            }
            else if ( !elem.parent().is( $( "#"+MILITARY_CLASS_LIST_ID ) ) )
                this.setClassList( false, true );

            if( elem.parent().is( $( "#"+CIVILIAN_CLASS_LIST_ID ) ) )
                this.resettaCostoClassiCivili();
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

        buttaAbilitaMilitari: function ()
        {
            this.rimuoviDalCestino( MILITARY_ABILITY_LIST_ID, MILITARY_ABILITY_BUCKET_ID );
            this.aggiornaListaAbilitaMilitari();
            this.ricalcolaPuntiAttuali();
        },

        compraAbilitaMilitari: function ()
        {
            this.spostaNelCestino( MILITARY_ABILITY_LIST_ID, MILITARY_ABILITY_BUCKET_ID );
            this.aggiornaListaAbilitaMilitari();
        },

        buttaAbilitaCivili: function ()
        {
            this.rimuoviDalCestino( CIVILIAN_ABILITY_LIST_ID, CIVILIAN_ABILITY_BUCKET_ID );
            this.aggiornaListaAbilitaCivili();
            this.ricalcolaPuntiAttuali();
        },

        compraAbilitaCivili: function ()
        {
            this.spostaNelCestino( CIVILIAN_ABILITY_LIST_ID, CIVILIAN_ABILITY_BUCKET_ID );
            this.aggiornaListaAbilitaCivili();
        },

        buttaClassiMilitari: function ()
        {
            this.rimuoviDalCestino( MILITARY_CLASS_LIST_ID, MILITARY_CLASS_BUCKET_ID );
            this.aggiornaListaClassiMilitari();
            this.aggiornaListaAbilitaMilitari();
            this.setClassList( false, true );
            this.ricalcolaPuntiAttuali();
        },

        compraClassiMilitari: function ()
        {
            console.log("compraClassiMilitari")
            this.spostaNelCestino( MILITARY_CLASS_LIST_ID, MILITARY_CLASS_BUCKET_ID );
            this.aggiornaListaAbilitaMilitari();
        },

        buttaClassiCivili: function ()
        {
            this.rimuoviDalCestino( CIVILIAN_CLASS_LIST_ID, CIVILIAN_CLASS_BUCKET_ID );
            this.aggiornaListaAbilitaCivili()
            this.resettaCostoClassiCivili();
            this.ricalcolaPuntiAttuali();
        },

        compraClassiCivili: function ()
        {
            this.spostaNelCestino( CIVILIAN_CLASS_LIST_ID, CIVILIAN_CLASS_BUCKET_ID );
            this.aggiornaListaAbilitaCivili();
            this.resettaCostoClassiCivili();
        },

        setupAbilityMarket: function ()
        {
            $( '.compra-abilita-civile-btn' ).unbind("click");
            $( '.compra-abilita-civile-btn' ).click( this.compraAbilitaCivili.bind( this ) );

            $( '.butta-abilita-civile-btn' ).unbind("click");
            $( '.butta-abilita-civile-btn' ).click( this.buttaAbilitaCivili.bind( this ) );

            $( '.compra-abilita-militare-btn' ).unbind("click");
            $( '.compra-abilita-militare-btn' ).click( this.compraAbilitaMilitari.bind( this ) );

            $( '.butta-abilita-militare-btn' ).unbind("click");
            $( '.butta-abilita-militare-btn' ).click( this.buttaAbilitaMilitari.bind( this ) );
        },

        setupClassesMarket: function ()
        {
            $( '.compra-classe-civile-btn' ).unbind("click");
            $( '.compra-classe-civile-btn' ).click( this.compraClassiCivili.bind( this ) );

            $( '.butta-classe-civile-btn' ).unbind("click");
            $( '.butta-classe-civile-btn' ).click( this.buttaClassiCivili.bind( this ) );

            $( '.compra-classe-militare-btn' ).unbind("click");
            $( '.compra-classe-militare-btn' ).click( this.compraClassiMilitari.bind( this ) );

            $( '.butta-classe-militare-btn' ).unbind("click");
            $( '.butta-classe-militare-btn' ).click( this.buttaClassiMilitari.bind( this ) );
        },

        setupListSelect: function ()
        {
            var _this = this;

            $( '.list-select li' ).unbind("click");
            $( '.list-select li' ).click( function ( e )
            {
                if( _this.selezionabile.call( _this, $( e.target ) ) )
                {
                    $( this ).toggleClass( "selected" );
                    _this.elementoSelezionato( $( e.target ) );
                }
            });
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
            var num_abilita_classe = this.classInfos.abilita[ abilita.id_classe ].length;

            if( parseInt( abilita.prerequisito_abilita ) === Constants.PREREQUISITO_TUTTE_ABILITA )
                return $("#" + MILITARY_ABILITY_BUCKET_ID).find("li[data-classe='"+abilita.id_classe+"']").length === num_abilita_classe - 1;
            else if( parseInt( abilita.prerequisito_abilita ) === Constants.PREREQUISITO_F_TERRA_T_SCELTO )
                return $("#" + MILITARY_ABILITY_BUCKET_ID).find("li[data-id='44']").length > 0 && $("#" + MILITARY_ABILITY_BUCKET_ID).find("li[data-id='39']").length > 0;
            else if( parseInt( abilita.prerequisito_abilita ) === Constants.PREREQUISITO_5_SUPPORTO_BASE )
            {
                return $("#" + MILITARY_ABILITY_BUCKET_ID).find("li[data-classe='5']").length >= 5;
            }
            else if( parseInt( abilita.prerequisito_abilita ) === Constants.PREREQUISITO_3_CONTROLLER )
                return $("#" + MILITARY_ABILITY_BUCKET_ID).find("li:contains(CONTROLLER)").length >= 3;

            return abilita.prerequisito_abilita === null || $( "#"+MILITARY_ABILITY_BUCKET_ID ).find("li[data-id='"+abilita.prerequisito_abilita+"']").length > 0;
        },

        prerequisitoCivileRaggiunto: function ( abilita )
        {
            if( parseInt( abilita.prerequisito_abilita ) === Constants.PREREQUISITO_4_SPORTIVO )
                return $("#" + CIVILIAN_ABILITY_BUCKET_ID).find("li[data-classe='"+abilita.id_classe+"']").length >= 4;

            return abilita.prerequisito_abilita === null || $( "#"+CIVILIAN_ABILITY_BUCKET_ID ).find("li[data-id='"+abilita.prerequisito_abilita+"']").length > 0;
        },

        aggiornaListaAbilitaMilitari: function ()
        {
            var classi_selezionate = $( "#" + MILITARY_CLASS_BUCKET_ID ).find("li").toArray().map( function( item ){ return $( item ).attr("data-id"); } ),
                abilita_lista      = classi_selezionate.map( function( id ){ return this.classInfos.abilita[ id ];}.bind(this) )[0],
                abilita            = {},
                abilita_elem       = {};

            $( "#" + MILITARY_ABILITY_LIST_ID ).html("");

            for( var a in abilita_lista )
            {
                abilita = abilita_lista[a];
                if( abilita.id_abilita && $("#"+MILITARY_ABILITY_BUCKET_ID).find("li[data-id='"+abilita.id_abilita+"']").length === 0 )
                {
                    abilita_elem = $( "<li data-id=\"" + abilita.id_abilita + "\" " +
                        "data-classe=\"" + abilita.id_classe + "\" " +
                        "data-prerequisito=\"" + abilita.prerequisito_abilita + "\" " +
                        "data-costo='" + abilita.costo_abilita + "'>" + abilita.nome_abilita + " ( " + abilita.costo_abilita + " PC )</li>" );
                    abilita_elem.attr("data-toggle","popover");
                    abilita_elem.attr("data-placement","top");
                    abilita_elem.attr("data-content",abilita.descrizione_abilita);

                    if( !this.prerequisitoMilitareRaggiunto( abilita ) )
                        abilita_elem.attr("disabled",true);

                    abilita_elem.dblclick( this.elementoDoppioClick.bind( this ) );

                    $("#" + MILITARY_ABILITY_LIST_ID).append(abilita_elem);
                }
            }

            $( "#" + MILITARY_ABILITY_BUCKET_ID).find("li").each(function ( i, elem)
            {
                if( classi_selezionate.indexOf( $( elem).attr("data-classe") ) === -1 )
                    $( elem ).remove();
            });

            this.setPopovers();
            this.setupListSelect();
            this.setupAbilityMarket();
        },

        aggiornaListaAbilitaCivili: function ( )
        {
            var classi_selezionate = $( "#" + CIVILIAN_CLASS_BUCKET_ID ).find("li").toArray().map( function( item ){ return $( item).attr("data-id"); } ),
                abilita_lista      = classi_selezionate.map( function( id ){ return this.classInfos.abilita[ id ]; }.bind(this) )[0],
                abilita            = {},
                abilita_elem       = {};

            $( "#" + CIVILIAN_ABILITY_LIST_ID ).html("");

            for( var a in abilita_lista )
            {
                abilita = abilita_lista[a];

                if( abilita.id_abilita && $("#"+CIVILIAN_ABILITY_BUCKET_ID).find("li[data-id='"+abilita.id_abilita+"']").length === 0 )
                {
                    abilita_elem = $( "<li data-id=\"" + abilita.id_abilita + "\" " +
                        "data-classe=\"" + abilita.id_classe + "\" " +
                        "data-prerequisito=\"" + abilita.prerequisito_abilita + "\" " +
                        "data-costo='" + abilita.costo_abilita + "'>" + abilita.nome_abilita + " ( " + abilita.costo_abilita + " PX )</li>" );
                    abilita_elem.attr("data-toggle","popover");
                    abilita_elem.attr("data-placement","top");
                    abilita_elem.attr("data-content",abilita.descrizione_abilita);

                    if( !this.prerequisitoCivileRaggiunto( abilita ) )
                        abilita_elem.attr("disabled",true);

                    abilita_elem.dblclick( this.elementoDoppioClick.bind( this ) );

                    $("#" + CIVILIAN_ABILITY_LIST_ID).append(abilita_elem);
                }
            }

            $( "#" + CIVILIAN_ABILITY_BUCKET_ID).find("li").each(function ( i, elem)
            {
                if( classi_selezionate.indexOf( $( elem).attr("data-classe") ) === -1 )
                    $( elem ).remove();
            });

            this.setPopovers();
            this.setupListSelect();
            this.setupAbilityMarket();
        },

        elementoDoppioClick: function ( e )
        {
            var clicked = $( e.target );
            clicked.addClass("selected");
            console.log("elementoDoppioClick",clicked,clicked.parent());
            if( clicked.parent().is( $( "#" + CIVILIAN_CLASS_LIST_ID ) ) )
                this.compraClassiCivili.call( this );
            else if( clicked.parent().is( $( "#" + CIVILIAN_ABILITY_LIST_ID ) ) )
                this.compraAbilitaCivili.call( this );
            else if( clicked.parent().is( $( "#" + MILITARY_CLASS_LIST_ID ) ) )
                this.compraClassiMilitari.call( this );
            else if( clicked.parent().is( $( "#" + MILITARY_ABILITY_LIST_ID ) ) )
                this.compraAbilitaMilitari.call( this );
            else if( clicked.parent().is( $( "#" + CIVILIAN_CLASS_BUCKET_ID ) ) )
                this.buttaClassiCivili.call( this );
            else if( clicked.parent().is( $( "#" + CIVILIAN_ABILITY_BUCKET_ID ) ) )
                this.buttaAbilitaCivili.call( this );
            else if( clicked.parent().is( $( "#" + MILITARY_CLASS_BUCKET_ID ) ) )
                this.buttaClassiMilitari.call( this );
            else if( clicked.parent().is( $( "#" + MILITARY_ABILITY_BUCKET_ID ) ) )
                this.buttaAbilitaMilitari.call( this );
        },

        setListeners: function ()
        {
            $("[data-toggle='tooltip']").tooltip();
            $("#inviaDati").click(this.inviaDati.bind(this));
        },

        setCivilianClasses: function ()
        {
            var classe = {},
                elem   = {},
                costo  = 0;

            $("#" + CIVILIAN_CLASS_LIST_ID ).html("");

            for( var cc in this.classInfos.classi.civile )
            {
                classe = this.classInfos.classi.civile[cc];
                if( classe.id_classe && $("#"+CIVILIAN_CLASS_BUCKET_ID).find("li[data-id='"+classe.id_classe+"']").size() === 0)
                {
                    costo = COSTI_PROFESSIONI[ $( "#" + CIVILIAN_CLASS_BUCKET_ID).find("list").size() ];
                    elem  = $("<li data-id=\"" + classe.id_classe + "\" data-costo='" + costo + "'>" + classe.nome_classe + " ( " + costo + " PX )</li>");
                    elem.dblclick( this.elementoDoppioClick.bind( this ) );
                    $("#" + CIVILIAN_CLASS_LIST_ID) .append( elem );
                }
            }
        },

        setMilitaryClasses: function ()
        {
            var classe = {},
                elem   = {},
                costo  = 0;

            $("#" + MILITARY_CLASS_LIST_ID ).html("");

            for( var cc in this.classInfos.classi.militare )
            {
                classe = this.classInfos.classi.militare[cc];

                if( classe.id_classe && $("#"+MILITARY_CLASS_BUCKET_ID).find("li[data-id='"+classe.id_classe+"']").size() === 0 )
                {
                    var disabled = ( classe.prerequisito_classe !== null &&
                                   $("#"+MILITARY_CLASS_BUCKET_ID).find("li[data-id='"+classe.prerequisito_classe+"']").size() === 0 ) ||
                                   $("#"+MILITARY_CLASS_BUCKET_ID).find("li").size() >= 2 ? "disabled" : "";
                    elem = $( "<li data-id=\"" + classe.id_classe + "\" data-costo='1' data-prerequisito='" + classe.prerequisito_classe + "' "+disabled+">" + classe.nome_classe + "</li>" );
                    elem.dblclick( this.elementoDoppioClick.bind( this ) );
                    $("#" + MILITARY_CLASS_LIST_ID ).append( elem );
                }
            }
        },

        setClassList: function ( civilian, military )
        {
            civilian = typeof civilian === "boolean" ? civilian : true;
            military = typeof military === "boolean" ? military : true;

            if( civilian ) this.setCivilianClasses();
            if( military ) this.setMilitaryClasses();
            this.setupListSelect();
            this.setupClassesMarket();
        },

        getClassesInfo: function ()
        {
            this.px_ora     = PX_TOT;
            this.pc_ora     = PC_TOT;

            this.aggiornaPuntiRimanenti( EXP, this.px_ora );
            this.aggiornaPuntiRimanenti( COM, this.pc_ora );

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
                        this.setListeners();
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

            var classi_civili    = $( "#" + CIVILIAN_CLASS_BUCKET_ID).find("li").toArray().reduce( function( pre, curr ){ return pre + "classi_civili[]=" + $(curr).attr("data-id") + "&"; }, ""),
                abilita_civili   = $( "#" + CIVILIAN_ABILITY_BUCKET_ID ).find("li").toArray().reduce( function( pre, curr ){ return pre + "abilita_civili[]=" + $(curr).attr("data-id") + "&"; }, ""),
                classi_militari  = $( "#" + MILITARY_CLASS_BUCKET_ID ).find("li").toArray().reduce( function( pre, curr ){ return pre + "classi_militari[]=" + $(curr).attr("data-id") + "&"; }, ""),
                abilita_militari = $( "#" + MILITARY_ABILITY_BUCKET_ID ).find("li").toArray().reduce( function( pre, curr ){ return pre + "abilita_militari[]=" + $(curr).attr("data-id") + "&"; }, ""),

                data             = "nome=" + encodeURIComponent( $( "#nomePG").val() ) + "&" + classi_civili + abilita_civili + classi_militari + abilita_militari;

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