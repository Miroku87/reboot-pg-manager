var CartelliniCreator = function ()
{
    var mappa_tipi_icone = {
        componente_consumabile: "fa-cubes",
        abilita_sp_malattia: "fa-medkit",
        armatura_protesi_potenziamento: "fa-shield",
        arma_equip: "fa-rocket",
        interazione_area: "fa-puzzle-piece"
    };

    return {
        init : function ()
        {
            this.textarea_titolo = $("#modal_form_cartellino").find('.cartellino').find('.titolo').find('textarea');
            this.icona           = $("#modal_form_cartellino").find('.cartellino').find('.icon-button');
            this.tag_input = $('input[name="etichette_cartellino"]');
            this.settings        = {
                usa_icona : true
            };
            
            this.setListeners();
        },

        iconaPerTipo : function ( e )
        {
            var target = $(e.target);
            this.icona.find("i")[0].className = "fa " + mappa_tipi_icone[ target.val() ];
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

        setIconPicker: function ()
        {
            this.icona.iconpicker({
                hideOnSelect : true,
                templates    : {
                    search : '<input type="search" class="form-control iconpicker-search" placeholder="Cerca icona" />'
                }
            });
            this.icona.on('iconpickerSelected', this.iconaSelezionata.bind(this));
        },

        setCheckboxes: function ()
        {
            $('.icheck input[type="checkbox"]').iCheck("destroy");
            $('.icheck input[type="checkbox"]').iCheck({
                checkboxClass : 'icheckbox_square-blue'
            });
            $('#ravshop').on('ifChanged', this.toggleCampoPrezzo.bind(this));
            $('#visibilita_icona').on('ifChanged', this.toggleVisibilitaIcona.bind(this));
        },

        tagItemAggiunto: function ( ev )
        {
            setTimeout(function ()
            {
                $('.bootstrap-tagsinput :input').val('');
            }, 0);
        },

        setTagsInput: function ()
        {
            this.tag_input.tagsinput({
                typeahead: {
                    source: function (query)
                    {
                        return $.get(Constants.API_GET_TAGS);
                    }
                },
                cancelConfirmKeysOnEmpty: true,
                freeInput: true
            });

            this.tag_input.on('itemAdded', this.tagItemAggiunto.bind(this));
        },
        
        setListeners : function ()
        {
            $("#btn_creaNuovoCartellino").click(this.mostraModalFormCartellino.bind(this));
            $("#visibilita_icona").click(this.toggleVisibilitaIcona.bind(this));
            $("select[name='tipo_cartellino']").on("change", this.iconaPerTipo.bind(this)).trigger('change');

            if (!this.settings.usa_icona)
                this.textarea_titolo.on('keyup change', this.titoloKeyup.bind(this)).trigger('change');

            this.setIconPicker();
            this.setCheckboxes();
            this.setTagsInput();
        }
    };
}();

$(function ()
{
    CartelliniCreator.init();
});