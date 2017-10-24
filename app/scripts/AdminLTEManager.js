var AdminLTEManager = function ()
{
    var SERVER = window.location.protocol + "//" + window.location.host + "/",
        SECTION_NAME = window.location.href.replace( SERVER, "" ).split( "/" )[0] + "/",
        PG_LIST_REQUEST = SERVER + "scripts/test.json",//SERVER + SECTION_NAME,
        PLAYER_SECTION = "giocatore/",
        ADMIN_SECTION = "staff/";

    return {

        init: function ()
        {
            this.setListeners();
        },
		
        setListeners: function ()
        {
            this.setupMenuSearch();

            $( 'ul' ).tree();

            $( '#sidebar-form' ).on( 'submit', function ( e )
            {
                e.preventDefault();
            } );

            $( '.sidebar-menu li.active' ).data( 'lte.pushmenu.active', true );
        },

        setupMenuSearch: function ()
        {
            $( '#search-input' ).on( 'keyup', function ()
            {
                console.log( $( '#search-input' ).val() );
                var term = $( '#search-input' ).val().trim();
                if ( term.length === 0 )
                {
                    $( '.sidebar-menu li' ).each( function ()
                    {
                        $( this ).show( 0 );
                        $( this ).removeClass( 'active' );
                        if ( $( this ).data( 'lte.pushmenu.active' ) )
                        {
                            $( this ).addClass( 'active' );
                        }
                    } );
                    return;
                }

                $( '.sidebar-menu li' ).each( function ()
                {
                    if ( $( this ).text().toLowerCase().indexOf( term.toLowerCase() ) === -1 )
                    {
                        $( this ).hide( 0 );
                        $( this ).removeClass( 'pushmenu-search-found', false );

                        if ( $( this ).is( '.treeview' ) )
                        {
                            $( this ).removeClass( 'active' );
                        }
                    } else
                    {
                        $( this ).show( 0 );
                        $( this ).addClass( 'pushmenu-search-found' );

                        if ( $( this ).is( '.treeview' ) )
                        {
                            $( this ).addClass( 'active' );
                        }

                        var parent = $( this ).parents( 'li' ).first();
                        if ( parent.is( '.treeview' ) )
                        {
                            parent.show( 0 );
                        }
                    }

                    if ( $( this ).is( '.header' ) )
                    {
                        $( this ).show();
                    }
                } );

                $( '.sidebar-menu li.pushmenu-search-found.treeview' ).each( function ()
                {
                    $( this ).find( '.pushmenu-search-found' ).show( 0 );
                } );
            } );
        }

    }
}();

$( document ).ready( function ( e )
{
    AdminLTEManager.init();
} );