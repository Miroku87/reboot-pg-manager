/**
 * Created by Miroku on 11/03/2018.
 */
var EventCreateManager = function ()
{
    return {
        init: function ()
        {
            this.setListeners();
            this.analizzaAzione();
        },

        initAutocomplete : function ()
        {    // Create the autocomplete object, restricting the search to geographical
            // location types.
            var autocomplete = new google.maps.places.Autocomplete(
                (document.getElementById('luogo'))
            );

            // When the user selects an address from the dropdown, populate the address
            // fields in the form.
            //autocomplete.addListener('place_changed', fillInAddress);
        },

        analizzaAzione: function()
        {
            var azione = window.localStorage.getItem("azione_evento");

            if( azione === "modifica" )
                Utils.requestData(); //TODO
        },

        setListeners: function()
        {
            $('[data-provide="timepicker"]').focus(function ()
            {
                $(this).timepicker('showWidget');
            });
        }
    };
}();

$(function () {
    EventCreateManager.init();
});