var PgListManager = function ()
{
    return {
        init: function ()
        {
            this.getClassesInfo();
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

        getClassesSelect: function ( lista, tipo )
        {
            if( !lista )
                return "";

            var lista    = lista.filter( function( item ){ return item.id_classe && item.tipo_classe === tipo; }),
                classes  = this.infos.classi[ tipo ],
                selects  = "",
                options  = "",
                selected = false;

            for( var l in lista )
            {
                if( lista[l].id_classe )
                {
                    for (var c in classes)
                    {
                        if (classes[c].id_classe)
                        {
                            selected = classes[c].id_classe === lista[l].id_classe ? "selected" : "";
                            options += "<option value='" + classes[c].id_classe + "' " + selected + ">" + classes[c].nome_classe + "</option>";
                        }
                    }

                    options += "<option value='delete_" + classes[c].id_classe + "'>[Elimina]</option>";;
                    selects += "<select>" + options + "</select><br>";
                    options = "";
                }
            }

            classes = options = "";
            selected = false;

			return selects;
        },

        getClassesName: function ( lista, tipo )
        {
            if( !lista )
                return "";

            var classes = lista.filter( function( item ){ return item.id_classe && item.tipo_classe === tipo; });
            classes = classes.map( function( item ){ return item.nome_classe; });

            return classes.join(", ");
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
					method: "POST",
                    xhrFields: {
                        withCredentials: true
                    }
				},
                url: Constants.API_GET_PGS,
                rowCount: [10, 50, 100],
                formatters: {
                    "pgnameFormatter": function ( column, row )
                    {
						return "<div class='data-showed'><a href='"+Constants.PG_PAGE+"?i="+row.id_personaggio+"'>" + row.nome_personaggio + "</a><span class=\"fa fa-pencil\"></span></div>\
						<div class='data-edit hidden'><input type='text' value='" + row.nome_personaggio + "' /><span class=\"fa fa-check\"></span></div>";
					},
                    "civilClassFormatter": function ( column, row )
                    {
						return "<div class='data-showed'>" + this.getClassesName( row.classi, "civile" ) + "<span class=\"fa fa-pencil\"></span></div>\
						<div class='data-edit hidden'>" + this.getClassesSelect( row.classi, "civile" ) + "<span class=\"fa fa-check\"></span></div>";
					}.bind( this ),
                    "militaryClassesFormatter": function ( column, row )
                    {
						return "<div class='data-showed'>" + this.getClassesName( row.classi, "militare" ) + "<span class=\"fa fa-pencil\"></span></div>\
						<div class='data-edit hidden'>" + this.getClassesSelect( row.classi, "militare" ) + "<span class=\"fa fa-check\"></span></div>";
					}.bind( this ),
                    "pxFormatter": function ( column, row )
                    {
						return "<div class='data-showed'>" + row.px_personaggio + "<span class=\"fa fa-pencil\"></span></div>\
						<div class='data-edit hidden'><input type='number' min='1' value='" + row.px_personaggio + "' /><span class=\"fa fa-check\"></span></div>";
					},
                    "pcFormatter": function ( column, row )
                    {
						return "<div class='data-showed'>" + row.pc_personaggio + "<span class=\"fa fa-pencil\"></span></div>\
						<div class='data-edit hidden'><input type='number' min='1' value='" + row.pc_personaggio + "' /><span class=\"fa fa-check\"></span></div>";
					},
                    "commandsFormatter": function ( column, row )
                    {
                        var buttons = "<button type=\"button\" class=\"btn btn-xs btn-default command-signup\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Iscrivi Personaggio al prossimo evento\" data-row-id=\"" + row.encPgId + "\"><span class=\"fa fa-rocket\"></span></button> ";
                        buttons += "<button type=\"button\" class=\"btn btn-xs btn-default command-abilities\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Gestisci Abilit&agrave;\" data-row-id=\"" + row.encPgId + "\"><span class=\"fa fa-bomb\"></span></button> ";

                       // if ( SECTION_NAME === ADMIN_SECTION )
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
        },

        getClassesInfo: function ()
        {
            $.ajax({
                url: Constants.API_GET_INFO,
                method: "GET",
                xhrFields: {
                    withCredentials: true
                },
                success: function( data )
                {
                    if ( data.status === "ok" )
                    {
                        this.infos = data.info;
                        this.setBootgrid();
                    }
                    else if ( data.status === "error" )
                    {
                        Utils.showError( data.message );
                    }
                }.bind(this),
                error: function ( jqXHR, textStatus, errorThrown )
                {
                    Utils.showError( textStatus+"<br>"+errorThrown );
                }
            });
        },
    };
}();

$(function () {
    PgListManager.init();
});