var RegistrationManager = function ()
{
    var SERVER = window.location.protocol + "//" + window.location.host + "/",
        SECTION_NAME = window.location.href.replace( SERVER, "" ).split( "/" )[0] + "/",
		PG_LIST_REQUEST = SERVER + "scripts/test.json",//SERVER + SECTION_NAME,
        PLAYER_SECTION = "giocatore/",
        ADMIN_SECTION = "staff/";

    return {
        init: function ()
        {
            $( document ).ready( function ( e )
            {
                this.setBootgrid();
            }.bind( this ) );
        },

        setGridListeners: function ()
        {
            $( "[data-toggle='tooltip']" ).tooltip();
			
            $( "[type='number']" ).on( "inputchange", function( e )
			{
				var value = this.value;
				
				if ( this.max && this.min )
				{
					if ( parseInt( value, 10 ) > this.max )
						value = this.max;
					else if ( parseInt( value, 10 ) < this.min )
						value = this.min;
				}

				this.value = value;
			});
			
            $( ".data-showed").find(".fa-pencil" ).click( function( e )
			{
				$(this).parent().addClass( "hidden" );
				$(this).parent().next().removeClass( "hidden" );
			});
			
            $( ".data-edit").find(".fa-check" ).click( function( e )
			{
				$(this).parent().addClass( "hidden" );
				$(this).parent().prev().removeClass( "hidden" );
			});
		},

        getCivilClassesSelect: function ()
        {
			return "<select></select>";
        },

        getMilitaryClassesSelect: function ()
        {
            return "<select></select>";
        },

        setBootgrid: function ()
        {
            $( "#pg-grid" ).bootgrid( {
                labels: {
                    all: "Tutti",
                    infos: "Informazioni",
                    loading: "Carico...",
                    noResults: "Nessun Risultato",
                    refresh: "Aggiorna",
                    search: "Cerca"
                },
                ajax: true,
				ajaxSettings: {
					method: "GET"
				},
                url: PG_LIST_REQUEST,
                rowCount: [10, 50, 100],
                formatters: {
                    "pgnameFormatter": function ( column, row )
                    {
						return "<div class='data-showed'>" + row.pgname + "<span class=\"fa fa-pencil\"></span></div>\
						<div class='data-edit hidden'><input type='text' value='" + row.pgname + "' /><span class=\"fa fa-check\"></span></div>";
					},
                    "civilClassFormatter": function ( column, row )
                    {
						return "<div class='data-showed'>" + row.civilClass + "<span class=\"fa fa-pencil\"></span></div>\
						<div class='data-edit hidden'>" + this.getCivilClassesSelect( row.civilClass ) + "<span class=\"fa fa-check\"></span></div>";
					}.bind( this ),
                    "militaryClassesFormatter": function ( column, row )
                    {
						return "<div class='data-showed'>" + row.militaryClasses + "<span class=\"fa fa-pencil\"></span></div>\
						<div class='data-edit hidden'>" + this.getMilitaryClassesSelect( row.militaryClasses ) + "<span class=\"fa fa-check\"></span></div>";
					}.bind( this ),
                    "pxFormatter": function ( column, row )
                    {
						return "<div class='data-showed'>" + row.px + "<span class=\"fa fa-pencil\"></span></div>\
						<div class='data-edit hidden'><input type='number' min='1' value='" + row.px + "' /><span class=\"fa fa-check\"></span></div>";
					},
                    "pcFormatter": function ( column, row )
                    {
						return "<div class='data-showed'>" + row.pc + "<span class=\"fa fa-pencil\"></span></div>\
						<div class='data-edit hidden'><input type='number' min='1' value='" + row.pc + "' /><span class=\"fa fa-check\"></span></div>";
					},
                    "commandsFormatter": function ( column, row )
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
                this.setGridListeners();
            }.bind( this ) );
        }
    };
}();

RegistrationManager.init();