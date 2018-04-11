var NewsManager = function ()
{
    var COLORE_PAGINE = {
        "Informazioni Commerciali" : "box-info",
        "Contatti nell'Ago" : "box-primary",
        "Contatti tra gli Sbirri" : "box-success",
        "Contatti nella Malavita" : "box-danger",
        "Contatti nella Famiglia" : "box-warning"
    };

    return {

        init : function ()
        {
            this.setListeners();
            this.setTextEditor();
            this.recuperaArticoliPubblicati();
            this.impostaTabellaArticoli();
        },

        pubblicaArticolo : function ( id )
        {
            Utils.requestData(
                Constants.API_POST_PUBBLICA_ARTICOLO,
                "POST",
                {id:id},
                "Articolo pubblicato correttamente.",
                null,
                Utils.reloadPage
            );
        },

        confermaPubblicaArticolo : function ( id, titolo )
        {
            Utils.showConfirm("Sicuro di voler pubblicare l'articolo \"<strong>"+titolo+"</strong>\"?", this.pubblicaArticolo.bind(this, id));
        },

        ritiraArticolo : function ( id )
        {
            Utils.requestData(
                Constants.API_POST_RITIRA_ARTICOLO,
                "POST",
                {id:id},
                "Articolo ritirato correttamente.",
                null,
                Utils.reloadPage
            );
        },

        confermaRitiraArticolo : function ( id, titolo )
        {
            Utils.showConfirm("Sicuro di voler ritirare l'articolo \"<strong>"+titolo+"</strong>\"?", this.ritiraArticolo.bind(this, id));
        },

        mostraAnteprimaArticolo : function ( e )
        {
            var t = $(e.target),
                dati = this.tab_articoli.row( t.parents('tr') ).data();

            $("#modal_anteprima_articolo").find(".modal-body > h1").text( dati.titolo_notizia );
            $("#modal_anteprima_articolo").find(".data-autore").html( dati.data_ig_notizia +"<br>"+dati.autore_notizia );
            $("#modal_anteprima_articolo").find(".testo").html( dati.testo_notizia );

            $("#modal_anteprima_articolo").find("#btn_ritira_articolo").unbind("click");
            $("#modal_anteprima_articolo").find("#btn_ritira_articolo").unbind("click");

            if( dati.pubblica_notizia === "S&igrave;" )
            {
                $("#modal_anteprima_articolo").find("#btn_ritira_articolo").show();
                $("#modal_anteprima_articolo").find("#btn_ritira_articolo").click(this.confermaRitiraArticolo.bind(this,dati.id_notizia,dati.titolo_notizia));
            }
            else
            {
                $("#modal_anteprima_articolo").find("#btn_pubblica_articolo").show();
                $("#modal_anteprima_articolo").find("#btn_pubblica_articolo").click(this.confermaPubblicaArticolo.bind(this,dati.id_notizia,dati.titolo_notizia));
            }

            $("#modal_anteprima_articolo").modal({drop:"static"});
        },

        mostraModificaArticolo : function ( e )
        {
            var t           = $(e.target),
                dati        = this.tab_articoli.row( t.parents('tr') ).data(),
                pub_manuale = dati.data_pubblicazione_notizia === "Manuale",
                data_pub    = pub_manuale ? null : dati.data_pubblicazione_notizia.split(" ").shift(),
                ora_pub     = pub_manuale ? null : dati.data_pubblicazione_notizia.split(" ").pop().replace(/:00$/,"");

            $("#modal_nuovo_articolo").find("#tipo").val( dati.tipo_notizia );
            $("#modal_nuovo_articolo").find("#titolo").val( dati.titolo_notizia );
            $("#modal_nuovo_articolo").find("#autore").val( dati.autore_notizia );
            $("#modal_nuovo_articolo").find("#data_ig").val( dati.data_ig_notizia );
            $("#modal_nuovo_articolo").find("#pub_manuale").iCheck( pub_manuale ? "Check" : "Uncheck" );
            $("#modal_nuovo_articolo").find("#data_pubblicazione").val( data_pub );
            $("#modal_nuovo_articolo").find("#ora_pubblicazione").val( ora_pub );
            CKEDITOR.instances.nuova_notizia.setData( dati.testo_notizia );

            if( pub_manuale )
            {
                $("#modal_nuovo_articolo").find("#data_pubblicazione").hide();
                $("#modal_nuovo_articolo").find("#ora_pubblicazione").hide();
            }

            Utils.resetSubmitBtn();
            $("#modal_nuovo_articolo").find("#btn_invia_articolo").attr("data-id",dati.id_notizia);
            $("#modal_nuovo_articolo").find("#btn_invia_articolo").text("Invia Modifiche");
            $("#modal_nuovo_articolo").modal({drop:"static"});
        },

        renderPulsantiAzioni : function ( data, type )
        {
            var pulsanti = "";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default anteprima-articolo' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Anteprima Articolo'><i class='fa fa-eye'></i></button>";

            pulsanti += "<button type='button' " +
                "class='btn btn-xs btn-default modifica-articolo' " +
                "data-toggle='tooltip' " +
                "data-placement='top' " +
                "title='Modifica Articolo'><i class='fa fa-edit'></i></button>";

            return pulsanti;
        },

        tabArticoliDraw : function ()
        {
            $("[data-toggle='tooltip']").tooltip("destroy");
            $("[data-toggle='tooltip']").tooltip();

            $("td > button.anteprima-articolo").unbind("click");
            $("td > button.anteprima-articolo").click(this.mostraAnteprimaArticolo.bind(this));

            $("td > button.modifica-articolo").unbind("click");
            $("td > button.modifica-articolo").click(this.mostraModificaArticolo.bind(this));
        },

        impostaTabellaArticoli: function()
        {
            var columns       = [];

            columns.push({
                title: "ID",
                data: "id_notizia"
            });
            columns.push({
                title: "Creazione",
                data   : "data_creazione_notizia"
            });
            columns.push({
                title: "Tipo",
                data   : "tipo_notizia"
            });
            columns.push({
                title: "Titolo",
                data   : "titolo_notizia"
            });
            columns.push({
                title: "Autore",
                data   : "autore_notizia"
            });
            columns.push({
                title: "Data In Gioco",
                data: "data_ig_notizia"
            });
            columns.push({
                title: "Data Pubblicazione",
                data: "data_pubblicazione_notizia"
            });
            columns.push({
                title: "Pubblica",
                data: "pubblica_notizia"
            });
            columns.push({
                title: "Azioni",
                render: this.renderPulsantiAzioni.bind(this)
            });

            this.tab_articoli = $("#articoli_creati")
                .on("draw.dt", this.tabArticoliDraw.bind(this))
                .DataTable({
                    processing : true,
                    serverSide : true,
                    dom : "<'row'<'col-sm-6'lB><'col-sm-6'f>>" +
                    "<'row'<'col-sm-12 table-responsive'tr>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                    buttons : ["reload"],
                    language : Constants.DATA_TABLE_LANGUAGE,
                    ajax : function (data, callback)
                    {
                        Utils.requestData(
                            Constants.API_GET_TUTTI_ARTICOLI,
                            "GET",
                            data,
                            callback
                        );
                    }.bind(this),
                    columns : columns,
                    order : [[0, 'desc']]
                });
        },

        mostraTimePicker: function()
        {
            $(this).timepicker('showWidget');
        },

        setTextEditor : function ()
        {
            CKEDITOR.replace('nuova_notizia', {
                width : "100%",
                language : "it",
                toolbar : [
                    { name : 'document',    items : [ 'Source' ] },
                    { name : 'clipboard',   items : [ 'Cut', 'Copy', 'Paste', 'PasteText', '-', 'Undo', 'Redo' ] },
                    { name : 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat' ] },
                    { name : 'paragraph',   items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','BidiLtr','BidiRtl' ] },
                    { name : 'styles',      items : [ 'Styles','Format','Font','FontSize' ] },
                    { name : 'colors',      items : [ 'TextColor','BGColor' ] }
                ],
                removeButtons : 'Link,Unlink,Image,About,Subscript,Superscript,Anchor,Styles,Specialchar'
            });
        },

        mostraArticoliPubblicati : function ( data )
        {
            var articoli = data.result,
                counter  = 0;

            if( articoli.length === 0 )
            {
                $("#no_news").removeClass("inizialmente-nascosto");
                $("#no_news").show();
                return false;
            }


            for( var a in articoli )
            {
                var art = articoli[a],
                    collapse = $("#collapse_template").clone(true);

                collapse.removeClass("inizialmente-nascosto");
                collapse.removeClass("box-primary");
                collapse.addClass(COLORE_PAGINE[art.tipo_notizia]);

                collapse.attr("id",null);
                collapse.find(".panel-collapse").attr("id","collapse_"+(++counter));
                collapse.find(".box-title > a").attr( "href", "#collapse_"+counter );
                collapse.find(".box-title > a").text( "["+ art.tipo_notizia +"] "+art.titolo_notizia );
                collapse.find(".box-body > h1").text( art.titolo_notizia );
                collapse.find(".data-autore").html( art.data_ig_notizia +"<br>"+art.autore_notizia );
                collapse.find(".testo").html( art.testo_notizia );

                $("#accordion").append(collapse);
                collapse.show();
            }
        },

        recuperaArticoliPubblicati : function ()
        {
            Utils.requestData(
                Constants.API_GET_ARTICOLI_PUBBLICATI,
                "GET",
                {},
                this.mostraArticoliPubblicati.bind(this)
            );
        },

        inviaNuovoArticolo : function ( e )
        {
            var t    = $(e.target),
                id   = t.attr("data-id"),
                url  = !id ? Constants.API_POST_CREA_ARTICOLO : Constants.API_POST_EDIT_ARTICOLO,
                data = {
                    tipo     : $("#tipo").val(),
                    titolo   : $("#titolo").val(),
                    autore   : $("#autore").val(),
                    data_ig  : $("#data_ig").val(),
                    pub_man  : $("#pub_manuale").is(":checked") ? 1 : 0,
                    data_pub : $("#data_pubblicazione").val(),
                    ora_pub  : $("#ora_pubblicazione").val(),
                    testo    : CKEDITOR.instances.nuova_notizia.getData()
                },
                mex  = "Articolo inserito correttamente. &Egrave; possibile pubblicarlo dalla tabella riassuntiva.";

            if( id )
            {
                data.id = id;
                mex = "Articolo modificato correttamente.";
            }

            Utils.requestData(
                url,
                "POST",
                data,
                mex,
                null,
                Utils.reloadPage
            );
        },

        mostraModalNuovoArticolo : function ()
        {
            $("#modal_nuovo_articolo").find("input[type='text']").val("");
            $("#modal_nuovo_articolo").find("select").val(-1);
            $("#modal_nuovo_articolo").find("input[type='checkbox']").iCheck("Uncheck");
            CKEDITOR.instances.nuova_notizia.setData("");

            Utils.resetSubmitBtn();

            $("#modal_nuovo_articolo").find("#btn_invia_articolo").attr("data-id",null);
            $("#modal_nuovo_articolo").find("#btn_invia_articolo").text("Invia Dati");
            $("#modal_nuovo_articolo").modal({drop:"static"});
        },

        nascondiCampiDataOraPubblicazione : function ( e )
        {
            $("#data_pubblicazione").parents(".form-group").hide();
            $("#ora_pubblicazione").parents(".form-group").hide();
        },

        mostraCampiDataOraPubblicazione : function ( e )
        {
            $("#data_pubblicazione").parents(".form-group").show();
            $("#ora_pubblicazione").parents(".form-group").show();
        },

        setListeners : function ()
        {
            $("#btn_creaNotizia").click(this.mostraModalNuovoArticolo.bind(this));
            $("#btn_invia_articolo").click(this.inviaNuovoArticolo.bind(this));
            $('[data-provide="timepicker"]').focus(this.mostraTimePicker);

            $( '#pub_manuale' ).iCheck("destroy");
            $( '#pub_manuale' ).iCheck( {
                checkboxClass : 'icheckbox_square-blue'
            } );
            $( '#pub_manuale' ).on('ifChecked', this.nascondiCampiDataOraPubblicazione.bind(this));
            $( '#pub_manuale' ).on('ifUnchecked', this.mostraCampiDataOraPubblicazione.bind(this));
        }
    }
}();

$(function ()
{
    NewsManager.init();
});

