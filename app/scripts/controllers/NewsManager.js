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

            for( var a in articoli )
            {
                var art = articoli[a],
                    collapse = $("#collapse_template").clone();

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

        inviaNuovoArticolo : function ()
        {
            Utils.requestData(
                Constants.API_POST_CREA_ARTICOLO,
                "POST",
                {
                    tipo     : $("#tipo").val(),
                    titolo   : $("#titolo").val(),
                    autore   : $("#autore").val(),
                    data_ig  : $("#data_ig").val(),
                    pub_man  : $("#pub_manuale").is(":checked") ? 1 : 0,
                    data_pub : $("#data_pubblicazione").val(),
                    ora_pub  : $("#ora_pubblicazione").val(),
                    testo    : CKEDITOR.instances.nuova_notizia.getData()
                },
                "Articolo inserito correttamente. &Egrave; possibile pubblicarlo dalla tabella riassuntiva."
            );
        },

        mostraModalNuovoArticolo : function ()
        {
            $("#modal_nuovo_articolo").find("input[type='text']").val("");
            $("#modal_nuovo_articolo").find("select").val(-1);
            $("#modal_nuovo_articolo").find("input[type='checkbox']").iCheck("Uncheck");
            CKEDITOR.instances.nuova_notizia.setData("");
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

