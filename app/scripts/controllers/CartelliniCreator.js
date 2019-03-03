var CartelliniCreator = function ()
{
    return {
        init : function ()
        {
            this.textarea_titolo = $("#modal_form_cartellino").find('.cartellino').find('.titolo').find('textarea');
            this.icona           = $("#modal_form_cartellino").find('.cartellino').find('.icon-button');
            this.settings        = {
                usa_icona : true
            };
            
            this.setListeners();
        },

        toggleCampoPrezzo : function (e)
        {
            var target = $(e.target);

            if (target.is(":checked"))
                $("#modal_form_cartellino").find(".costo_attuale_ravshop_cartellino").show(500);
            else
                $("#modal_form_cartellino").find(".costo_attuale_ravshop_cartellino").hide(500);
        },

        toggleVisibilitaIcona : function (e)
        {
            var target = $(e.target);

            this.settings.usa_icona = target.is(":checked");
            $("#modal_form_cartellino").find(".cartellino").toggleClass("senza-icona");

            if (this.settings.usa_icona)
            {
                $("#visibilita_icona").text("Rimuovi Icona");
                this.textarea_titolo.unbind('keyup change', this.titoloKeyup.bind(this));
                this.textarea_titolo.css("height", null)
                this.textarea_titolo.val(this.textarea_titolo.val().replace("\n", " "))
            }
            else
            {
                $("#visibilita_icona").text("Inserisci Icona");
                this.textarea_titolo.on('keyup change', this.titoloKeyup.bind(this)).trigger('change');
            }
        },

        iconaSelezionata : function (event)
        {
            this.icona.find("i")[0].className = "fa " + event.iconpickerValue;
        },

        titoloKeyup : function ()
        {
            var font_height = parseInt(this.textarea_titolo.css("font-size"), 10),
                new_height  = 0;

            this.textarea_titolo.height(1);
            new_height = this.textarea_titolo[0].scrollHeight;
            new_height = new_height === 0 ? font_height : new_height;

            this.textarea_titolo.height(new_height);
        },
        
        mostraModalFormCartellino : function ()
        {
            $("#modal_form_cartellino").modal("show");
        },
        
        setListeners : function ()
        {
            $("#btn_creaNuovoCartellino").click(this.mostraModalFormCartellino.bind(this));
            $("#visibilita_icona").click(this.toggleVisibilitaIcona.bind(this));

            this.icona.iconpicker({
                hideOnSelect : true,
                templates    : {
                    search : '<input type="search" class="form-control iconpicker-search" placeholder="Cerca icona" />'
                }
            });
            this.icona.on('iconpickerSelected', this.iconaSelezionata.bind(this));

            if (!this.settings.usa_icona)
                this.textarea_titolo.on('keyup change', this.titoloKeyup.bind(this)).trigger('change');

            $('.icheck input[type="checkbox"]').iCheck("destroy");
            $('.icheck input[type="checkbox"]').iCheck({
                checkboxClass : 'icheckbox_square-blue'
            });
            $('#ravshop').on('ifChanged', this.toggleCampoPrezzo.bind(this));
            $('#visibilita_icona').on('ifChanged', this.toggleVisibilitaIcona.bind(this));

            $('textarea[name="etichette_cartellino"]').tagsinput({
                typeahead: {
                    name: 'states',
                    source: ['Amsterdam', 'Washington', 'Sydney', 'Beijing', 'Cairo']
                },
                cancelConfirmKeysOnEmpty: true,
                freeInput: true
            });
        }
    };
}();

$(function ()
{
    CartelliniCreator.init();
});