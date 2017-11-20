var RegistrationManager = function ()
{
    var CIVILIAN_LIST_ID   = "listaAbilitaCivili",
        CIVILIAN_BUCKET_ID = "listaAbilitaCiviliAcquistate",
        MILITARY_LIST_ID   = "listaAbilitaMilitari",
        MILITARY_BUCKET_ID = "listaAbilitaMilitariAcquistate",
        EXP                = "Esperienza",
        COM                = "Combattimento",
        PX_TOT             = 100,
        PC_TOT             = 18;

    return {
        init: function ()
        {
            this.setSharedVariables();
            this.setListeners();
            this.setClassList();
        },

        setSharedVariables: function ()
        {
            this.classInfos = JSON.parse( window.localStorage.getItem("classinfos") );
            this.px_ora     = PX_TOT;
            this.pc_ora     = PC_TOT;
        },

        setListeners: function ()
        {
            $("[data-toggle='tooltip']").tooltip();
        },

        prerequisitoCivileRaggiunto: function ( abilita )
        {
            if( parseInt( abilita.prerequisito_abilita ) === -1 )
                return $("#" + CIVILIAN_BUCKET_ID).find("li").length >= 4;

            return abilita.prerequisito_abilita === null || $( "#"+CIVILIAN_BUCKET_ID ).find("li[data-id='"+abilita.prerequisito_abilita+"']").length > 0;
        },

        onClasseCivileSelezionata: function ()
        {
            var id_classe     = $("#classeCivileSelect").val(),
                abilita_lista = this.classInfos.abilita_civili.filter( function( item ){ return item.id_classe && item.id_classe === id_classe; } ),
                abilita       = {},
                abilita_elem  = {};

            $( "#" + CIVILIAN_LIST_ID ).html("");

            for( var a in abilita_lista )
            {
                abilita = abilita_lista[a];
                if( parseInt( abilita.costo_abilita ) <= this.px_ora &&
                    this.prerequisitoCivileRaggiunto( abilita ) &&
                    $("#"+CIVILIAN_BUCKET_ID).find("li[data-id='"+abilita.id_abilita+"']").length === 0 )
                {
                    abilita_elem = $( "<li data-id=\"" + abilita.id_abilita + "\" data-classe=\"" + abilita.id_classe + "\">" + abilita.nome_abilita + "</li>" );
                    abilita_elem.attr("data-toggle","popover");
                    abilita_elem.attr("data-placement","top");
                    abilita_elem.attr("data-content",abilita.descrizione_abilita);

                    $("#" + CIVILIAN_LIST_ID).append(abilita_elem);
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
            //TODO: gestire anche la possibilità di avere abilità di più classi nelle liste
            if( parseInt( abilita.prerequisito_abilita ) === -1 )
                return $("#" + MILITARY_BUCKET_ID).find("li").length === lista.length - 1;
            else if( parseInt( abilita.prerequisito_abilita ) === -2 )
                return $("#" + MILITARY_BUCKET_ID).find("li[data-id='44']").length > 0 && $("#" + MILITARY_BUCKET_ID).find("li[data-id='39']").length > 0;
            else if( parseInt( abilita.prerequisito_abilita ) === -3 && abilita.id_classe === 5 )
            {
                return $("#" + MILITARY_BUCKET_ID).find("li[data-id='44']").length > 0;
            }
            else if( parseInt( abilita.prerequisito_abilita ) === -4 )
                return false;

            return abilita.prerequisito_abilita === null || $( "#"+MILITARY_BUCKET_ID ).find("li[data-id='"+abilita.prerequisito_abilita+"']").length > 0;
        },

        onClasseMilitareSelezionata: function ()
        {
            var id_classe     = $("#classeMilitareSelect").val(),
                abilita_lista = this.classInfos.abilita_militari.filter( function( item ){ return item.id_classe && item.id_classe === id_classe; } ),
                abilita       = {},
                abilita_elem  = {};

            $( "#" + MILITARY_LIST_ID ).html("");

            for( var a in abilita_lista )
            {
                abilita = abilita_lista[a];
                if( this.pc_ora >= 1 &&
                    this.prerequisitoMilitareRaggiunto( abilita, abilita_lista ) &&
                    $("#"+MILITARY_BUCKET_ID).find("li[data-id='"+abilita.id_abilita+"']").length === 0 )
                {
                    abilita_elem = $( "<li data=\"" + abilita.id_abilita + "\">" + abilita.nome_abilita + "</li>" );
                    abilita_elem.attr("data-toggle","popover");
                    abilita_elem.attr("data-placement","top");
                    abilita_elem.attr("data-content",abilita.descrizione_abilita);

                    $("#" + MILITARY_LIST_ID).append(abilita_elem);
                }
            }

            this.setPopovers();
            this.setupListSelect();
            this.setupAbilityMarket();
        },

        setClassList: function ()
        {
            var classe = {};

            for( var cc in this.classInfos.classi_civili )
            {
                classe = this.classInfos.classi_civili[cc];
                if( classe.id_classe )
                    $("#classeCivileSelect")
                        .append( "<option value=\"" + classe.id_classe + "\">" + classe.nome_classe + "</option>" );
            }

            for( var cc in this.classInfos.classi_militari )
            {
                classe = this.classInfos.classi_militari[cc];

                if( classe.id_classe )
                    $("#classeMilitareSelect")
                        .append( "<option value=\"" + classe.id_classe + "\">" + classe.nome_classe + "</option>" );
            }

            $("#classeCivileSelect")
                .change( this.onClasseCivileSelezionata.bind(this) );

            $("#classeMilitareSelect")
                .change( this.onClasseCivileSelezionata.bind(this) );
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
                        if ( $( li_elem ).parent().attr( "id" ) === CIVILIAN_BUCKET_ID || $( li_elem ).parent().attr( "id" ) === MILITARY_BUCKET_ID )
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

        setupListSelect: function ()
        {
            $( '.list-select li' ).click( function ()
            {
                $( this ).toggleClass( "selected" );
            });
        },

        updateRemainingPoints: function ( which, offset )
        {
            var actual_points = parseInt( $( '#punti' + which ).text(), 10 ),
                new_points = actual_points + offset,
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

        buyAbilities: function ( list_id, bucket_id )
        {
            var selected = $( '#' + list_id ).find( 'li.selected' ),
                points = list_id === CIVILIAN_LIST_ID ? EXP : COM;

            $( '[data-toggle="popover"]' ).popover( "hide" );
            selected
                .removeClass( "selected" )
                .appendTo( $( '#' + bucket_id ) );

            this.updateRemainingPoints( points, selected.length * -1 );

            if( list_id === CIVILIAN_LIST_ID )
                this.onClasseCivileSelezionata();
            else
                this.onClasseMilitareSelezionata();

            Utils.sortChildrenByAttribute( $( '#' + list_id ), "li", "data" );
            Utils.sortChildrenByAttribute( $( '#' + bucket_id ), "li", "data" );
        },
		//TODO: controllare che dopo il drop i prerequisiti esistano ancora
        dropAbilities: function ( list_id, bucket_id )
        {
            var selected = $( '#' + bucket_id ).find( 'li.selected' ),
                points = list_id === CIVILIAN_LIST_ID ? EXP : COM;

            $( '[data-toggle="popover"]' ).popover( "hide" );
            selected
                .removeClass( "selected" )
                .appendTo( $( '#' + list_id ) );

            this.updateRemainingPoints( points, selected.length * 1 );

            Utils.sortChildrenByAttribute( $( '#' + list_id ), "li", "data" );
            Utils.sortChildrenByAttribute( $( '#' + bucket_id ), "li", "data" );
        },

        setupAbilityMarket: function () 
        {
            $( '.compra-abilita-civile-btn' ).click( function () 
            {
                this.buyAbilities( CIVILIAN_LIST_ID, CIVILIAN_BUCKET_ID );
            }.bind( this ) );

            $( '.butta-abilita-civile-btn' ).click( function () 
            {
                this.dropAbilities( CIVILIAN_LIST_ID, CIVILIAN_BUCKET_ID );
            }.bind( this ) );

            $( '.compra-abilita-militare-btn' ).click( function () 
            {
                this.buyAbilities( MILITARY_LIST_ID, MILITARY_BUCKET_ID );
            }.bind( this ) );

            $( '.butta-abilita-militare-btn' ).click( function () 
            {
                this.dropAbilities( MILITARY_LIST_ID, MILITARY_BUCKET_ID );
            }.bind( this ) );
        }
    };
}();

// eslint-disable-line no-console
$(function () {
    RegistrationManager.init();
});