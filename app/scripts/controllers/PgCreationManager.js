var RegistrationManager = function ()
{
    var CIVILIAN_LIST_ID = "listaAbilitaCivili",
        CIVILIAN_BUCKET_ID = "listaAbilitaCiviliAcquistate",
        MILITARY_LIST_ID = "listaAbilitaMilitari",
        MILITARY_BUCKET_ID = "listaAbilitaMilitariAcquistate",
        EXP = "Esperienza",
        COM = "Combattimento",
        PX_TOT = 10,
        PC_TOT = 10;

    return {
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

            Utils.sortChildrenByAttribute( $( '#' + list_id ), "li", "data" );
            Utils.sortChildrenByAttribute( $( '#' + bucket_id ), "li", "data" );
        },

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
    RegistrationManager.setPopovers();
    RegistrationManager.setupListSelect();
    RegistrationManager.setupAbilityMarket();
});