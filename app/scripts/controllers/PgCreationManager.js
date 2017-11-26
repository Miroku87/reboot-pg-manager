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

        setClassList: function ()
        {
            var classe = {},
                elem   = {},
                costo  = 0;

            for( var cc in this.classInfos.classi_civili )
            {
                classe = this.classInfos.classi_civili[cc];
                if( classe.id_classe )
                {
                    costo = COSTI_PROFESSIONI[ $( "#" + CIVILIAN_CLASS_BUCKET_ID).find("list").size() ];
                    elem  = $("<li data-id=\"" + classe.id_classe + "\" data-costo='" + costo + "'>" + classe.nome_classe + " ( " + costo + " PX )</li>");
                    elem.dblclick( this.elementoDoppioClick.bind( this ) );
                    $("#" + CIVILIAN_CLASS_LIST_ID) .append( elem );
                }
            }

            for( var cc in this.classInfos.classi_militari )
            {
                classe = this.classInfos.classi_militari[cc];

                if( classe.id_classe )
                {
                    var disabled = parseInt( cc ) % 2 !== 0 ? "disabled='disabled'" : "";
                    elem = $( "<li data-id=\"" + classe.id_classe + "\" data-costo='1' "+disabled+">" + classe.nome_classe + "</li>" );
                    elem.dblclick( this.elementoDoppioClick.bind( this ) );
                    $("#" + MILITARY_CLASS_LIST_ID).append( elem );
                }
            }

            this.setupListSelect();
            this.setupClassesMarket();
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

        aggiornaListaAbilitaCivili: function ( )
        {
            var classi_selezionate = $( "#" + CIVILIAN_CLASS_BUCKET_ID ).find("li").toArray().map( function( item ){ return $( item).attr("data-id"); } ),
                abilita_lista      = this.classInfos.abilita_civili.filter( function( item ){ return item.id_classe && classi_selezionate.indexOf( item.id_classe+"" ) !== -1; } ),
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

        resettaDisponibilitaClassiMilitari: function ()
        {
            if( $( "#"+MILITARY_CLASS_BUCKET_ID).find("li").size() === 0 )
            {
                $("#listaClassiMilitari").find("li:nth-child(odd)").attr("disabled", null);
                $("#listaClassiMilitari").find("li:nth-child(even)").attr("disabled", true);
            }
            else if( $( "#"+MILITARY_CLASS_BUCKET_ID).find("li").size() === 1 )
            {
                var elem = $( "#"+MILITARY_CLASS_BUCKET_ID).find("li");
                $("#listaClassiMilitari").find("li:nth-child(odd)").attr("disabled", true);
                $("#listaClassiMilitari").find("li:nth-child(even)").attr("disabled", null);
                $( "#"+MILITARY_CLASS_LIST_ID).find("li[data-id='"+( parseInt( elem.attr("data-id") ) + 1 )+"']").attr("disabled",null);
            }
            else if( $( "#"+MILITARY_CLASS_BUCKET_ID).find("li").size() === 2 )
            {
                var elem = $( "#"+MILITARY_CLASS_BUCKET_ID).find("li");
                $("#listaClassiMilitari").find("li").attr("disabled", true);
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
            else if ( !elem.parent().is( $( "#"+MILITARY_CLASS_LIST_ID ) ) )
                this.resettaDisponibilitaClassiMilitari();

            if( elem.parent().is( $( "#"+CIVILIAN_CLASS_LIST_ID ) ) )
                this.resettaCostoClassiCivili();
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

            this.updateRemainingPoints( points, this[prop_punti] -= costo );

            Utils.sortChildrenByAttribute( $( '#' + list_id ), "li", "data-id" );
            Utils.sortChildrenByAttribute( $( '#' + bucket_id ), "li", "data-id" );
        },

        rimuoviDalCestino: function ( list_id, bucket_id )
        {
            var selected  = $( '#' + bucket_id ).find( 'li.selected' ),
                points     = list_id.toLowerCase().indexOf("civili") !== -1 ? EXP : COM,
                prop_punti = list_id.toLowerCase().indexOf("civili") !== -1 ? "px_ora" : "pc_ora",
                costo      = this.calcolaCosto( selected, list_id );

            $( '[data-toggle="popover"]' ).popover( "hide" );
            selected
                .removeClass( "selected" )
                .appendTo( $( '#' + list_id ) );

            this.updateRemainingPoints( points, this[prop_punti] += costo );

            Utils.sortChildrenByAttribute( $( '#' + list_id ), "li", "data-id" );
            Utils.sortChildrenByAttribute( $( '#' + bucket_id ), "li", "data-id" );
        },

        elementoDoppioClick: function ( e )
        {
            var clicked = $( e.target );
            clicked.addClass("selected");

            if( clicked.parent().is( $( "#" + CIVILIAN_CLASS_LIST_ID ) ) )
            {
                this.spostaNelCestino( CIVILIAN_CLASS_LIST_ID, CIVILIAN_CLASS_BUCKET_ID );
                this.aggiornaListaAbilitaCivili();
                this.resettaCostoClassiCivili();
            }
            else if( clicked.parent().is( $( "#" + CIVILIAN_ABILITY_LIST_ID ) ) )
            {
                this.spostaNelCestino( CIVILIAN_ABILITY_LIST_ID, CIVILIAN_ABILITY_BUCKET_ID );
                this.aggiornaListaAbilitaCivili();
                this.resettaCostoClassiCivili();
            }
            else if( clicked.parent().is( $( "#" + MILITARY_CLASS_LIST_ID ) ) )
            {
                this.spostaNelCestino( MILITARY_CLASS_LIST_ID, MILITARY_CLASS_BUCKET_ID );
                this.aggiornaListaAbilitaMilitari();
                this.resettaDisponibilitaClassiMilitari();
            }
            else if( clicked.parent().is( $( "#" + MILITARY_ABILITY_LIST_ID ) ) )
            {
                this.spostaNelCestino( MILITARY_ABILITY_LIST_ID, MILITARY_ABILITY_BUCKET_ID );
                this.aggiornaListaAbilitaMilitari();
            }
            else if( clicked.parent().is( $( "#" + CIVILIAN_CLASS_BUCKET_ID ) ) )
            {
                this.rimuoviDalCestino( CIVILIAN_CLASS_LIST_ID, CIVILIAN_CLASS_BUCKET_ID );
                this.aggiornaListaAbilitaCivili();
                this.resettaCostoClassiCivili();
            }
            else if( clicked.parent().is( $( "#" + CIVILIAN_ABILITY_BUCKET_ID ) ) )
            {
                this.rimuoviDalCestino( CIVILIAN_ABILITY_LIST_ID, CIVILIAN_ABILITY_BUCKET_ID );
                this.aggiornaListaAbilitaCivili();
                this.resettaCostoClassiCivili();
            }
            else if( clicked.parent().is( $( "#" + MILITARY_CLASS_BUCKET_ID ) ) )
            {
                this.rimuoviDalCestino( MILITARY_CLASS_LIST_ID, MILITARY_CLASS_BUCKET_ID );
                this.aggiornaListaAbilitaMilitari();
                this.resettaDisponibilitaClassiMilitari();
            }
            else if( clicked.parent().is( $( "#" + MILITARY_ABILITY_BUCKET_ID ) ) )
            {
                this.rimuoviDalCestino( MILITARY_ABILITY_LIST_ID, MILITARY_ABILITY_BUCKET_ID );
                this.aggiornaListaAbilitaMilitari();
            }
        },

        setupClassesMarket: function ()
        {
            $( '.compra-classe-civile-btn' ).unbind("click");
            $( '.compra-classe-civile-btn' ).click( function ()
            {
                this.spostaNelCestino( CIVILIAN_CLASS_LIST_ID, CIVILIAN_CLASS_BUCKET_ID );
                this.aggiornaListaAbilitaCivili();
                this.resettaCostoClassiCivili();
            }.bind( this ) );

            $( '.butta-classe-civile-btn' ).unbind("click");
            $( '.butta-classe-civile-btn' ).click( function ()
            {
                this.rimuoviDalCestino( CIVILIAN_CLASS_LIST_ID, CIVILIAN_CLASS_BUCKET_ID );
                this.aggiornaListaAbilitaCivili()
                this.resettaCostoClassiCivili();
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
                this.resettaDisponibilitaClassiMilitari();
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
                    error: function ( err )
                    {
                        Utils.showError( err );
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