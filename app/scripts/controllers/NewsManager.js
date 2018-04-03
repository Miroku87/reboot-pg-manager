var NewsManager = function ()
{
    return {

        init : function ()
        {
            this.setListeners();
            this.setTextEditor();
        },

        setTextEditor : function ()
        {
            CKEDITOR.replace('nuova_notizia', {
                width : "100%",
                language : "it",
                toolbar : [
                    {name : 'document', items : ['Source']},
                    {name : 'clipboard', items : ['Cut', 'Copy', 'Paste', 'PasteText', '-', 'Undo', 'Redo'] },
                    { name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat' ] },
                    { name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','BidiLtr','BidiRtl' ] },
                    { name: 'styles', items : [ 'Styles','Format','Font','FontSize' ] },
                    { name: 'colors', items : [ 'TextColor','BGColor' ] }
                ]/*,
                toolbarGroups : [
                    {name : 'document', groups : ['mode', 'document', 'doctools']},
                    {name : 'clipboard', groups : ['clipboard', 'undo']},
                    {"name" : "basicstyles", "groups" : ["basicstyles"]},
                    {"name" : "paragraph", "groups" : ["list", "blocks", "indent", "align"]},
                    {"name" : "document", "groups" : ["mode"]},
                    {"name" : "insert", "groups" : ["insert"]},
                    {"name" : "styles", "groups" : ["styles"]},
                    {"name" : "colors"}
                ],*/
                // Remove the redundant buttons from toolbar groups defined above.
                //removeButtons : 'Link,Unlink,Image,About,Subscript,Superscript,Anchor,Styles,Specialchar'
            });
        },

        mostraModalNuovoArticolo : function ()
        {
            $("#modal_nuovo_articolo").modal({drop:"static"});
        },

        setListeners : function ()
        {
            $("#btn_creaNotizia").click(this.mostraModalNuovoArticolo.bind(this));

            $( 'input[type="checkbox"]' ).iCheck("destroy");
            $( 'input[type="checkbox"]' ).iCheck( {
                checkboxClass : 'icheckbox_square-blue'
            } );
        }
    }
}();

$(function ()
{
    NewsManager.init();
});

