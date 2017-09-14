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
                var selected_before = [],
                    selected_now = [],
                    diff;

                $( '#' + CIVILIAN_LIST_ID + ', #' + MILITARY_LIST_ID ).on( "change", function ( event )
                {
                    $( this ).find( '[data-toggle="popover"]' ).popover( "hide" );

                    if ( this.selectedOptions.length > 0 )
                    {
                        selected_now = [].slice.call( this.selectedOptions );
                        selected_now = selected_now.map( function ( item ) { return $( item ).val(); } );
                        diff = selected_now.filter( function ( item ) { return selected_before.indexOf( item ) === -1; } )[0];
                        selected_before = selected_now;

                        if ( diff )
                            $( this ).find( "option[value='" + diff + "']" ).popover( "show" );
                    }
                } );
            };
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
            var selected = $( '#' + list_id ).find( ':selected' ),
                points = list_id === CIVILIAN_LIST_ID ? EXP : COM;
            selected.appendTo( $( '#' + bucket_id ) );
            $( '#' + bucket_id )[0].selectedIndex = -1;

            this.updateRemainingPoints( points, selected.length * -1 );

            Utils.sortChildrenByAttribute( $( '#' + list_id ), "option", "value" );
            Utils.sortChildrenByAttribute( $( '#' + bucket_id ), "option", "value" );
        },

        dropAbilities: function ( list_id, bucket_id )
        {
            var selected = $( '#' + bucket_id ).find( ':selected' ),
                points = list_id === CIVILIAN_LIST_ID ? EXP : COM;
            selected.appendTo( $( '#' + list_id ) );
            $( '#' + list_id )[0].selectedIndex = -1;

            this.updateRemainingPoints( points, selected.length * 1 );

            Utils.sortChildrenByAttribute( $( '#' + list_id ), "option", "value" );
            Utils.sortChildrenByAttribute( $( '#' + bucket_id ), "option", "value" );
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