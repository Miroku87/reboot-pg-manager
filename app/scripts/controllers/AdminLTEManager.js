var AdminLTEManager = function ()
{
    var SERVER       = window.location.protocol + "//" + window.location.host + "/",
        SECTION_NAME = window.location.href.replace( SERVER, "" ).replace( window.location.search, "" ).split( "/").shift().split(".").shift(),
        NO_CONTROLLO = ["index","recupera_password","registrazione"];

    return {

        init: function ()
        {
            this.setListeners();
            this.controllaPermessi();
        },

        controllaAccesso: function ()
        {
            if(    SECTION_NAME !== ""
                && NO_CONTROLLO.indexOf( SECTION_NAME ) === -1
                && SECTION_NAME.indexOf( "test" ) === -1 )
                Utils.controllaAccessoPagina( SECTION_NAME );
        },

        controllaPermessi: function ()
        {
            this.user_info = this.user_info || JSON.parse( window.localStorage.getItem('user') );
            this.pg_info = this.pg_info || JSON.parse( window.localStorage.getItem('logged_pg') );

            if( this.user_info )
            {
                for( var p in this.user_info.permessi )
                {
                    var permesso          = this.user_info.permessi[p],
                        permesso_generico = permesso.replace(Constants.TIPO_GRANT_PG_ALTRI, "").replace(Constants.TIPO_GRANT_PG_PROPRIO,"");

                    if( typeof permesso === "string" && $("#btn_" + permesso).length > 0 )
                    {
                        $("#btn_" + permesso).show();
                        $("#btn_" + permesso).removeClass("inizialmente-nascosto");
                    }

                    if ( typeof permesso === "string" && $("."+permesso).length > 0 )
                    {
                        $("." + permesso).show();
                        $("." + permesso).removeClass("inizialmente-nascosto");
                    }

                    if ( typeof permesso === "string" && $("#btn_"+permesso_generico).length > 0 )
                    {
                        $("#btn_" + permesso_generico).show();
                        $("#btn_" + permesso_generico).removeClass("inizialmente-nascosto");
                    }

                    if ( typeof permesso === "string" && $("."+permesso_generico).length > 0 )
                    {
                        $("." + permesso_generico).show();
                        $("." + permesso_generico).removeClass("inizialmente-nascosto");
                    }
                }

                $(".nome_giocatore").each(function( i, el )
                {
                    $(el).text( this.user_info.nome_giocatore );
                }.bind( this ) );
            }

            if( this.pg_info )
            {
                if (this.pg_info.crafting_chimico)
                    $("#btn_crafting_chimico").show();
                if (this.pg_info.crafting_programmazione)
                    $("#btn_crafting_programmazione").show();
                if (this.pg_info.crafting_ingegneria)
                    $("#btn_crafting_ingegneria").show();

                $("#nome_personaggio").find("p").text( this.pg_info.nome_personaggio );
            }
        },

        logout: function ()
        {
            Utils.requestData(
                Constants.API_GET_LOGOUT,
                "GET",
                "",
                function( data )
                {
                    Utils.clearLocalStorage();
                    window.location.href = Constants.SITE_URL;
                }.bind(this)
            );
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
        },

        aggiornaBadgeMessaggi: function ( data )
        {
            $("#num_mex_fg").text( data.result.fg );

            if( typeof data.result.ig !== "undefined" )
            {
                $("#num_mex_ig").text( data.result.ig );
                $("#num_mex_ig").show();
            }
        },

        controllaMessaggi: function ()
        {
            Utils.requestData(
                Constants.API_GET_MESSAGGI_NUOVI,
                "GET",
                {},
                this.aggiornaBadgeMessaggi.bind(this)
            );
        },

        setListeners: function ()
        {
            this.setupMenuSearch();

            if( jQuery().tree ) $( 'ul.tree' ).tree();
            if( jQuery().tooltip ) $( '[data-toggle="tooltip"]' ).tooltip();

            $( '#sidebar-form' ).on( 'submit', function ( e )
            {
                e.preventDefault();
            } );

            $( '.sidebar-menu li.active' ).data( 'lte.pushmenu.active', true );
            $( '#logoutBtn' ).click( this.logout.bind(this) );
            $( '#btn_visualizza_pagina_profilo' ).click( Utils.redirectTo.bind(this,Constants.PROFILO_PAGE) );
            $( '#logo_link' ).attr("href", Constants.MAIN_PAGE );
            Utils.setSubmitBtn();

            if (    SECTION_NAME !== ""
                && NO_CONTROLLO.indexOf( SECTION_NAME ) === -1
                && SECTION_NAME.indexOf( "test" ) === -1 )
            {
                this.controllaMessaggi();
                setInterval(this.controllaMessaggi.bind(this), Constants.INTERVALLO_CONTROLLO_MEX);
            }
        }

    }
}();

AdminLTEManager.controllaAccesso();

$( document ).ready( function ( e )
{
    AdminLTEManager.init();
} );