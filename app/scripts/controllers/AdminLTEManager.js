var AdminLTEManager = function ()
{
    var SERVER       = window.location.protocol + "//" + window.location.host + "/",
        SECTION_NAME = window.location.href.replace( SERVER, "" ).split( "/").shift().split(".").shift();

    return {

        init: function ()
        {
            if( SECTION_NAME !== "" && SECTION_NAME !== "index" && SECTION_NAME !== "registrazione" && SECTION_NAME.indexOf( "test" ) === -1 )
                Utils.controllaAccessoPagina( SECTION_NAME );

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
            $( '#logoutBtn' ).click( this.logout.bind(this) );

            $( '#logo_link' ).attr("href", Constants.MAIN_PAGE );
        },

        logout: function ()
        {
            $.ajax({
                url: Constants.API_GET_LOGOUT,
                method: "GET",
                data: "",
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
                        window.location.href = Constants.SITE_URL;
                    }
                    else if ( data.status === "error" )
                    {
                        Utils.showError( data.message );
                    }
                },
                error: function ( jqXHR, textStatus, errorThrown )
                {
                    Utils.showError( textStatus+"<br>"+errorThrown );
                }
            });
        },

        setupMenuSearch: function ()
        {
            $( '#search-input' ).on( 'keyup', function ()
            {
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