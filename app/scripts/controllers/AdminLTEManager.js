var AdminLTEManager = function ()
{
    var SECTION_NAME = window.location.href.replace( Constants.SITE_URL+"/", "" ).replace( window.location.search, "" ).replace(/\.\w+#?$/,"").replace(/live_/,""),
        NO_CONTROLLO = ["index","recupera_password","registrazione"];

    return {

        init: function ()
        {
            this.user_info = this.user_info || JSON.parse( window.localStorage.getItem('user') );
            this.pg_info   = JSON.parse( window.localStorage.getItem('logged_pg') );

            this.controllaModalitaEvento();
            this.setListeners();
            this.controllaPermessi(".sidebar-menu", true);
        },

        controllaAccesso: function ()
        {
            if(    SECTION_NAME !== ""
                && NO_CONTROLLO.indexOf( SECTION_NAME ) === -1
                && SECTION_NAME.indexOf( "test" ) === -1 )
                Utils.controllaAccessoPagina( SECTION_NAME );
        },

        controllaModalitaEvento: function ()
        {
            if( this.pg_info && typeof this.user_info.pg_da_loggare !== "undefined" )
            {
                $("body").addClass("event_ongoing");
                $(".visualizza_pagina_main").remove();
                $("#btn_visualizza_pagina_gestione_eventi").remove();
                $("#logo_link").attr( "href", Constants.PG_PAGE );

                if($("#background_video")[0])
                {
                    $("#background_video").attr("autoplay", null);
                    $("#background_video")[0].pause();
                }
            }
            else
            {
                $(".visualizza_pagina_main").removeClass("inizialmente-nascosto").show();
                $("#btn_visualizza_pagina_gestione_eventi").removeClass("inizialmente-nascosto").show();
            }
        },

        mostraNomePersonaggio: function ( nome )
        {
            var id_personaggio = "";

            if( typeof nome === "undefined" && typeof this.pg_info !== "undefined" && this.pg_info )
            {
                nome = this.pg_info.nome_personaggio;
                id_personaggio = this.pg_info.id_personaggio;
            }

            if ( nome )
            {
                $("#nome_personaggio").find("p").text(nome);
                $("#nome_personaggio").find(".fa").removeClass("text-danger").addClass("text-success");
                $("#pg_status").text(" Online");
                $(".nome_personaggio").text( nome );

                if( typeof this.pg_info !== "undefined" && this.pg_info )
                    $("#live_matricola").text("# SGC0215AT54RD" + this.pg_info.id_personaggio);
            }
        },

        mostraElementiNascosti: function ( in_selector, animate, permesso )
        {
            var permesso_generico = permesso.replace(Constants.TIPO_GRANT_PG_ALTRI, "").replace(Constants.TIPO_GRANT_PG_PROPRIO,""),
                animation = animate ? "fadeIn" : null;

            if( typeof permesso === "string" && $("#btn_" + permesso).length > 0 )
            {
                $(in_selector).find("#btn_" + permesso).show(animation);
                $("#btn_" + permesso).removeClass("inizialmente-nascosto");
            }

            if ( typeof permesso === "string" && $("."+permesso).length > 0 )
            {
                $(in_selector).find("." + permesso).show(animation);
                $("." + permesso).removeClass("inizialmente-nascosto");
            }

            if ( typeof permesso === "string" && $("#btn_"+permesso_generico).length > 0 )
            {
                $(in_selector).find("#btn_" + permesso_generico).show(animation);
                $("#btn_" + permesso_generico).removeClass("inizialmente-nascosto");
            }

            if ( typeof permesso === "string" && $("."+permesso_generico).length > 0 )
            {
                $(in_selector).find("." + permesso_generico).show(animation);
                $("." + permesso_generico).removeClass("inizialmente-nascosto");
            }
        },

        controllaPermessi: function ( in_selector, animate )
        {
            in_selector = typeof in_selector === "undefined" ? ".content-wrapper > .content" : in_selector;
            animate     = typeof animate === "undefined" ? false : animate;

            this.user_info = this.user_info || JSON.parse( window.localStorage.getItem('user') );
            this.pg_info   = JSON.parse( window.localStorage.getItem('logged_pg') );

            $(in_selector).find(".inizialmente-nascosto:not(.no-hide)").hide();

            if( this.user_info )
            {
                for( var p in this.user_info.permessi )
                {
                    var permesso = this.user_info.permessi[p];
                    this.mostraElementiNascosti( in_selector, animate, permesso );
                }

                $(".nome_giocatore").each(function( i, el )
                {
                    $(el).text( this.user_info.nome_giocatore );
                }.bind( this ) );
            }

            if (this.pg_info)
            {
                for (var p in this.pg_info.permessi)
                {
                    var permesso = this.pg_info.permessi[p];
                    this.mostraElementiNascosti(in_selector, animate, permesso);
                }
            }

            this.mostraNomePersonaggio();
            this.controllaModalitaEvento();
            this.setupMenuSearch();
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
            $( '#search-input' ).unbind( 'keyup' );
            $( '#search-input' ).on( 'keyup', function ()
            {
                var term = $( '#search-input' ).val().trim();
                if ( term.length === 0 )
                {
                    $( '.sidebar-menu li' ).each( function ()
                    {
                        var elem = $(this);
                        
                        if( !elem.hasClass("inizialmente-nascosto") )
                            elem.show( 0 );

                        elem.removeClass( 'active' );
                        if ( elem.data( 'lte.pushmenu.active' ) )
                            elem.addClass( 'active' );
                    } );
                    return;
                }

                $( '.sidebar-menu li' ).each( function ()
                {
                    var elem = $(this);

                    if( !elem.hasClass("inizialmente-nascosto") )
                    {
                        if (elem.text().toLowerCase().indexOf(term.toLowerCase()) === -1)
                        {
                            elem.hide(0);
                            elem.removeClass('pushmenu-search-found', false);

                            if (elem.is('.treeview'))
                            {
                                elem.removeClass('active');
                            }
                        }
                        else
                        {
                            elem.show(0);
                            elem.addClass('pushmenu-search-found');

                            if (elem.is('.treeview'))
                            {
                                elem.addClass('active');
                            }

                            var parent = elem.parents('li').first();
                            if (parent.is('.treeview'))
                            {
                                parent.show(0);
                            }
                        }

                        if (elem.is('.header'))
                        {
                            elem.show();
                        }
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
            if( this.pg_info && typeof this.user_info.pg_da_loggare !== "undefined" )
                $("#num_mex_fg").remove();
            else
                $("#num_mex_fg").text( data.result.fg );

            if( typeof data.result.ig !== "undefined" )
            {
                $("#num_mex_ig").text( data.result.ig );
                $("#num_mex_ig").removeClass("inizialmente-nascosto");
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

            if( this.pg_info )
                $("#nome_personaggio").parents(".user-panel").click(Utils.redirectTo.bind(this,Constants.PG_PAGE));

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
