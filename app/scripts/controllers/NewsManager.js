var NewsManager = function ()
{
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

        mostraArticoliPubblicati : function ()
        {

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

