var RegistrationManager = function ()
{
    var SERVER = window.location.protocol + "//" + window.location.host + "/",
        SECTION_NAME = window.location.href.replace( SERVER, "" ).split( "/" )[0] + "/",
        PLAYER_SECTION = "giocatore/",
        ADMIN_SECTION = "staff/";

    return {
        init: function ()
        {
            $( document ).ready( function ( e )
            {
                this.setListeners();
            } );
        },

        setBootgrid: function ()
        {
            $( "#recap-grid" ).bootgrid( {
                labels: {
                    all: "Tutti",
                    infos: "Informazioni",
                    loading: "Carico...",
                    noResults: "Nessun Risultato",
                    refresh: "Aggiorna",
                    search: "Cerca"
                },
                ajax: true,
                rowCount: [10, 50, 100],
                url: SERVER + SECTION_NAME,
                formatters: {
                    "commands": function ( column, row )
                    {
                        var buttons = "<button type=\"button\" class=\"btn btn-xs btn-default command-signup\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Iscrivi Personaggio al prossimo evento\" data-row-id=\"" + row.encPgId + "\"><span class=\"fa fa-rocket\"></span></button> ";
                        buttons += "<button type=\"button\" class=\"btn btn-xs btn-default command-abilities\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Gestisci Abilit&agrave;\" data-row-id=\"" + row.encPgId + "\"><span class=\"fa fa-bomb\"></span></button> ";

                        if ( SECTION_NAME === ADMIN_SECTION )
                        {
                            buttons += "<button type=\"button\" class=\"btn btn-xs btn-default command-add-points\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Assegna PX e PC standard\" data-row-id=\"" + row.encPgId + "\">PX</button> ";
                            buttons += "<button type=\"button\" class=\"btn btn-xs btn-default command-edit\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Modifica Dati Personaggio\" data-row-id=\"" + row.encPgId + "\"><span class=\"fa fa-pencil\"></span></button> ";
                            buttons += "<button type=\"button\" class=\"btn btn-xs btn-default command-confirm hidden\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Conferma Modifiche\" data-row-id=\"" + row.encPgId + "\"><span class=\"fa fa-check\"></span></button> ";
                        }

                        return buttons;
                    }
                }
            } ).on( "loaded.rs.jquery.bootgrid", function ( e )
            {
                $( "[data-toggle='tooltip']" ).tooltip();
                _self.addEventListeners();
                if ( !gridLoaded )
                {
                    _self.checkSorting();
                    gridLoaded = true;
                }
            } );
        }
    };
}();