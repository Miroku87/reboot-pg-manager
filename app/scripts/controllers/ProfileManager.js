/**
 * Created by Miroku on 11/03/2018.
 */
var ProfileManager = function ()
{
    return {
        init: function ()
        {
            this.setListeners();
            this.recuperaNote();
        },

        controllaPasswords: function ()
        {
            var errors     = "",
                password1  = $("#nuova_pass1").val(),
                password2  = $("#nuova_pass2").val();

            if ( password1 === "" || Utils.soloSpazi(password1) )
                errors += "Il primo campo Password non pu&ograve; essere vuoto.<br>";

            if ( password2 === "" || Utils.soloSpazi(password2) )
                errors += "Il secondo campo Password non pu&ograve; essere vuoto.<br>";

            if( password1 !== "" && !Utils.soloSpazi(password1) &&
                password2 !== "" && !Utils.soloSpazi(password2) &&
                password1 !== password2
            )
                errors += "Le password inserite non combaciano.<br>";

            return errors;
        },

        inviaNuovaPwd: function()
        {
            var errors = this.controllaPasswords();

            if( errors )
            {
                Utils.showError(errors, Utils.reloadPage);
                return;
            }

            Utils.requestData(
                Constants.API_POST_MOD_PWD,
                "POST",
                { "vecchia": $("#vecchia_pass").val(), "pass1": $("#nuova_pass1").val(), "pass2": $("#nuova_pass2").val() },
                "Password modificata correttamente.",
                null,
                AdminLTEManager.logout,
                Utils.reloadPage
            );
        },

        inviaNote: function()
        {
            //Nessun controllo perche' un utente potrebbe voler cancellare le proprie note
            Utils.requestData(
                Constants.API_POST_MOD_GIOCATORE,
                "POST",
                { "modifiche": {"note_giocatore": $("#testo_note_giocatore").val() } },
                "Note modificate correttamente.",
                null,
                Utils.reloadPage,
                Utils.reloadPage
            );
        },

        stampaNote: function( data )
        {
            $("#testo_note_giocatore").val( data.result.note_giocatore );
        },

        recuperaNote: function()
        {
            //Nessun controllo perche' un utente potrebbe voler cancellare le proprie note
            Utils.requestData(
                Constants.API_GET_NOTE_GIOCATORE,
                "POST",
                "",
                this.stampaNote.bind(this)
            );
        },

        setListeners: function()
        {
            $("#invia_nuova_password").click(this.inviaNuovaPwd.bind(this));
            $("#invia_note_giocatore").click(this.inviaNote.bind(this));
        }
    };
}();

$(function () {
    ProfileManager.init();
});