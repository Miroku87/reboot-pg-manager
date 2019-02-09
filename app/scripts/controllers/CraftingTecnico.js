var mobile               = false;
var type                 = "";
var id_target            = "";
var batteria             = 0;
var volume               = 0;
var totaleBatteria       = 0;
var totaleVolume         = 0;
var usoBatteria          = 0;
var usoVolume            = 0;
var dragged_id           = "";
var tipo_selezionato     = null;
var tipo_gia_selezionato = false;

var mappa_tipi_db_radio = {
    "pistola"              : "Pistola",
    "fucile d'assalto"     : "Fucile Assalto",
    "shotgun"              : "Shotgun",
    "mitragliatore"        : "Mitragliatore",
    "fucile di precisione" : "Fucile Precisione"
};

/*gadget
 scudo
 protesi_braccio
 protesi_gamba
 protesi_generico
 esoscheletro
 granata_mischia
 */

var mappa_tipi_radio_db = {
    "Pistola"           : "pistola",
    "Fucile Assalto"    : "fucile d'assalto",
    "Shotgun"           : "shotgun",
    "Mitragliatore"     : "mitragliatore",
    "Fucile Precisione" : "fucile di precisione",
    "Arma Mischia"      : "granata_mischia",
    "Gadget Normale"    : "gadget",
    "Gadget Avanzato"   : "gadget",
    "Scudo"             : "scudo",
    "Protesi Generica"  : "protesi_braccio",
    "Protesi Gamba"     : "protesi_gamba",
    "Protesi Braccio"   : "protesi_generico",
    "Esoscheletro"      : "esoscheletro"

};

function pageResize()
{
    $("#liste_componenti").width($("#liste_componenti").parent().width());
}

function loadComponentsFromDB(callback)
{
    Utils.requestData(
        Constants.API_GET_COMPONENTI_BASE,
        "GET",
        {
            draw    : 1,
            columns : null,
            order   : null,
            start   : 0,
            length  : 999999,
            search  : null,
            tipo    : "tecnico"
        },
        callback
    );
}

function searchBoxKeyUp(ev)
{
    var search_box = ev ? $(ev.currentTarget) : $("#cerca_app"),
        term       = search_box.val().trim();
    
    if (term.length === 0)
    {
        search_box.parents(".tab-pane").find("div[draggable='true']").each(function ()
        {
            $(this).show(0);
        });
    }
    else
        term = term.toLowerCase();
    
    search_box.parents(".tab-pane").find("div[draggable='true']").each(function ()
    {
        var id_comp   = $(this).find(".id_comp").text().toLowerCase(),
            nome_comp = $(this).find(".nome_comp").text().toLowerCase(),
            desc_comp = $(this).find(".descrizione_comp").text().toLowerCase(),
            vol_comp  = $(this).attr("data-volume"),
            ener_comp = $(this).attr("data-batteria"),
            tipi_app  = $(this).attr("data-tipo-app") ? $(this).attr("data-tipo-app").split(",") : [],
            tipo_ok   = search_box.attr("id") !== "cerca_app";

        if (search_box.attr("id") === "cerca_app" && tipo_selezionato === null)
            tipo_ok = tipi_app.length === 0;
        else if (search_box.attr("id") === "cerca_app" && tipo_selezionato !== null && tipi_app.length === 0)
            tipo_ok = true;
        else if (search_box.attr("id") === "cerca_app" && tipo_selezionato !== null && tipi_app.length !== 0)
            tipo_ok = tipi_app.indexOf( tipo_selezionato ) !== -1;
        
        if (
            ( id_comp.indexOf(term) !== -1 ||
            nome_comp.indexOf(term) !== -1 ||
            desc_comp.indexOf(term) !== -1 ||
            vol_comp.indexOf(term) !== -1 ||
            ener_comp.indexOf(term) !== -1 ) &&
            tipo_ok
        )
            $(this).show(0);
        else
            $(this).hide(0);
    });
}

function impostaRicercaComponenti(search_box)
{
    search_box.on('keyup', searchBoxKeyUp);
}

//popolo componenti
$(document).ready(function ()
{
    //loadCsv('', function (data)
    //{
    jQuery.event.props.push('dataTransfer');
    loadComponentsFromDB(function (data)
    {
        //divido i componenti a seconda del tipo
        data            = data.data;
        var batteria    = [];
        var struttura   = [];
        var applicativo = [];
        var scartati    = [];
        for (var i = 0; i < data.length; i++)
        {
            data[i].Tipo        = data[i].tipo_componente;
            data[i].Codice      = data[i].id_componente;
            data[i].Volume      = data[i].volume_componente;
            data[i].Energia     = data[i].energia_componente;
            data[i].Nome        = data[i].nome_componente;
            data[i].Descrizione = data[i].descrizione_componente;
            data[i].TipiApp     = data[i].tipo_applicativo_componente;
            data[i].Deve        = data[i].deve === "1";
            
            if (data[i].Tipo.toLowerCase() == "batteria")
            {
                batteria.push(data[i]);
            }
            else if (data[i].Tipo.toLowerCase() == "struttura")
            {
                struttura.push(data[i]);
            }
            else if (data[i].Tipo.toLowerCase() == "applicativo")
            {
                applicativo.push(data[i]);
            }
            else
            {
                scartati.push(data[i]);
            }
        }
        
        mobile = Utils.isDeviceMobile();
        
        //popolo i div
        popoloComponenti(batteria, "bat", "batteria");
        popoloComponenti(struttura, "str", "struttura");
        popoloComponenti(applicativo, "app", "applicativo");
        impostaRicercaComponenti($("#cerca_batteria"));
        impostaRicercaComponenti($("#cerca_struttura"));
        impostaRicercaComponenti($("#cerca_app"));
    });
    
    $("#liste_componenti").width($("#liste_componenti").parent().width());
    $("#liste_componenti").css("max-height", $(".content-wrapper").height() - 41 - 51 - 20);
    $("input[name='radiogroup']").on("change", tipoPrototipoSelezionato);
    
    $(window).resize(pageResize);
});

function popoloComponenti(array, id, div)
{
    array.forEach(function (el)
    {
        var html            = $("<div></div>"),
            content         = $("<div></div>"),
            energia         = $("<span class='description-percentage'></span>"),
            volume          = $("<span class='description-percentage'></span>"),
            icon            = "",
            vol_text_class  = "",
            nrg_text_class  = "",
            vol_caret_class = "",
            nrg_caret_class = "",
            volume_text     = "",
            energia_text    = "";
        
        if (el.Tipo == "batteria")
            icon = 'fa-battery-full';
        else if (el.Tipo == "struttura")
            icon = 'fa-server';
        else if (el.Tipo == "applicativo")
            icon = 'fa-qrcode';
        
        html.attr('id', id + '-' + el.Codice);
        html.attr('data-batteria', el.Energia);
        html.attr('data-volume', el.Volume);
        html.attr( 'data-app-type', el.TipoApp );
        html.attr('data-deve', el.Deve);
        html.addClass('info-box bg-aqua');
        html.addClass('drag-' + el.Tipo);
        
        if ( el.Tipo === "applicativo" && el.tipo_applicativo_componente !== null )
            html.attr( 'data-tipo-app', el.tipo_applicativo_componente );
        
        if (mobile == false)
        {
            html.attr('draggable', true);
            html.on("drag", drag);
        }
        else
        {
            html.attr('data-selezionabile', 1);
            html.click(addComponente.bind(this, el.Tipo, el.Codice));
        }
        html.append('<button type="button" class="btn btn-info btn-xs pull-right delete-el">&times;</button> ');
        html.append('<span class="info-box-icon"><i class="fa fa-fw ' + icon + '"></i></span>');
        
        content.addClass('info-box-content');
        content.append('<span class="info-box-text sgc-info2">' + el.Tipo + ' - <span class="id_comp">' + el.Codice + '</span></span>');
        content.append('<span class="info-box-number nome_comp">' + el.Nome + '</span>');
        content.append('<p class="descrizione_comp">' + el.Descrizione + '</p>');
        
        if (parseInt(el.Energia) == 0)
        {
            nrg_text_class  = "text-yellow";
            nrg_caret_class = "fa-caret-left";
        }
        else if (parseInt(el.Energia) > 0)
        {
            nrg_text_class  = "text-green";
            nrg_caret_class = "fa-caret-up";
        }
        else if (parseInt(el.Energia) < 0)
        {
            nrg_text_class  = "text-red";
            nrg_caret_class = "fa-caret-down";
        }
        
        if (parseInt(el.Volume) == 0)
        {
            vol_text_class  = "text-yellow";
            vol_caret_class = "fa-caret-left";
        }
        else if (parseInt(el.Volume) > 0)
        {
            vol_text_class  = "text-green";
            vol_caret_class = "fa-caret-up";
        }
        else if (parseInt(el.Volume) < 0)
        {
            vol_text_class  = "text-red";
            vol_caret_class = "fa-caret-down";
        }
        
        energia_text = 'Energia (' + el.Energia + ')';
        volume_text  = 'Spazio (' + el.Volume + ')';
        energia.addClass(nrg_text_class).append('<i class="fa ' + nrg_caret_class + '"></i> ' + energia_text);
        volume.addClass(vol_text_class).append('<i class="fa ' + vol_caret_class + '"></i> ' + volume_text);
        content.append($("<p></p>").append(energia).append("<br>").append(volume));
        html.append(content);
        
        $('#' + div + " > .container-componenti").append(html);
    }.bind(this));
}

//drag&copy

function addComponente(tipo, codice)
{
    type      = tipo.substring(0, 3);
    var id    = tipo.substring(0, 3);
    id_target = id + '-' + codice;
    batteria  = parseInt($('#' + id_target).data("batteria"));
    volume    = parseInt($('#' + id_target).data("volume"));
    
    var selezionabile = false;
    if (type == "bat")
    {
        var count = $('#box-batteria .drag-batteria').length;
        var newId = id_target + '_' + count;
        $('#box-batteria').append($('#' + id_target).clone().removeAttr("onclick").attr("id", newId));
        //onclick="boxReset('' + id + '','' + el.Codice + '')"
        
    }
    if (type == "str")
    {
        var count = $('#box-struttura .drag-struttura').length;
        var newId = id_target + '_' + count;
        $('#box-struttura').append($('#' + id_target).clone().removeAttr("onclick").attr("id", newId));
        
    }
    if (type == "app")
    {
        var count = $('#box-applicativo .drag-applicativo').length;
        var newId = id_target + '_' + count;
        $('#box-applicativo').append($('#' + id_target).clone().removeAttr("onclick").attr("id", newId));
        
    }
    
    var f = "boxReset('" + id + "','" + newId + "')";
    $('#' + newId + ' .delete-el').attr("onclick", f);
    
    if (batteria > 0)
    {
        totaleBatteria += batteria;
    }
    else if (batteria < 0)
    {
        usoBatteria += ( batteria * -1 );
    }
    if (volume > 0)
    {
        totaleVolume += volume;
    }
    else if (volume < 0)
    {
        usoVolume += ( volume * -1 );
    }
    
    fixProgress();
    /*fixStyle();*/
    
}

function selezionaTipo(tipo)
{
    if (!tipo)
        return false;
    
    $("input[type='radio'][value='" + mappa_tipi[tipo] + "']").prop("checked", true);
    $("input[type='radio']").prop("disabled", true);
}

function deselezionaTipo()
{
    $("input[type='radio']:checked").prop("checked", false);
    $("input[type='radio']").prop("disabled", false);
}

function tipoPrototipoSelezionato(ev)
{
    if (ev)
    {
        tipo_selezionato = mappa_tipi_radio_db[ev.currentTarget.value] || null;
        searchBoxKeyUp();
        
        if (!tipo_gia_selezionato)
        {
            $("button[disabled]").attr("disabled", false);
            $("#componenti_message").html("");
            $("#simulatore").boxWidget('expand');
        }
        
        $("#box-applicativo").children().each(function ()
        {
            boxReset("app", $(this).attr("id"));
        });

        tipo_gia_selezionato = true;
    }
}

function allowDrop(ev)
{
    ev.preventDefault();
}

function drag(ev)
{
    type      = "";
    id_target = "";
    batteria  = 0;
    volume    = 0;
    
    id_target  = ev.target.id;
    dragged_id = id_target;
    type       = id_target.substring(0, 3);
    
    batteria = parseInt($('#' + id_target).data("batteria"));
    volume   = parseInt($('#' + id_target).data("volume"));
}

function drop(ev)
{
    ev.preventDefault();
    var data   = dragged_id;
    var elem   = $("#" + data);
    var target = $(ev.target);
    var tipo   = "";
    
    dragged_id = "";
    
    var errore = null;
    if (type === "bat" && ev.target.id === "box-batteria")
        tipo = "batteria";
    else if (type === "bat" && ev.target.id !== "box-batteria")
        errore = Constants.DEFAULT_ERROR;
    
    if (type === "str" && ev.target.id === "box-struttura")
        tipo = "struttura";
    else if (type === "str" && ev.target.id !== "box-struttura")
        errore = Constants.DEFAULT_ERROR;
    
    if (type === "app" && ev.target.id === "box-applicativo")
    {
        tipo = "applicativo";

        if ($("#box-applicativo").find("div[draggable='true'][data-deve='true']").size() > 0)
            errore = Constants.DEVE_ERROR;
    }
    else if (type === "app" && ev.target.id !== "box-applicativo")
        errore = Constants.DEFAULT_ERROR;
    
    if (errore)
    {
        Utils.showError(errore);
        return false;
    }
    else
    {
        var count = $('#box-' + tipo + ' .drag-' + tipo).length;
        
        target.append(elem.clone());
        
        var newId = id_target + '_' + count;
        $('#box-' + tipo + ' #' + id_target).attr("id", newId);
        
        var f = "boxReset('" + type + "','" + newId + "')";
        $('#' + newId + ' .delete-el').attr("onclick", f);
        
        if (batteria > 0)
        {
            totaleBatteria += batteria;
        }
        else if (batteria < 0)
        {
            usoBatteria += ( batteria * -1 );
        }
        if (volume > 0)
        {
            totaleVolume += volume;
        }
        else if (volume < 0)
        {
            usoVolume += ( volume * -1 );
        }
        
        fixProgress();
    }
}

function fixProgress()
{
    var htmlBatteria = "<b>" + usoBatteria + "</b>/" + totaleBatteria;
    $('#uso-batteria .progress-number').html(htmlBatteria);
    var percBatteria = 0;
    if (usoBatteria > totaleBatteria)
    {
        percBatteria = 1;
        $('#uso-batteria').addClass("sgc-over");
    }
    else if (usoBatteria == 0 && totaleBatteria == 0)
    {
        $('#uso-batteria').removeClass("sgc-over");
        percBatteria = 0;
    }
    else
    {
        $('#uso-batteria').removeClass("sgc-over");
        percBatteria = ( usoBatteria / totaleBatteria );
    }
    var widthBatteria    = $('#uso-batteria .progress').width();
    var newWidthBatteria = widthBatteria * percBatteria;
    $('#uso-batteria .progress-bar').width(newWidthBatteria);
    
    var htmlVolume = "<b>" + usoVolume + "</b>/" + totaleVolume;
    $('#uso-volume .progress-number').html(htmlVolume);
    var percVolume = 0;
    if (usoVolume > totaleVolume)
    {
        percVolume = 1;
        $('#uso-volume').addClass("sgc-over");
    }
    else if (usoVolume == 0 && totaleVolume == 0)
    {
        $('#uso-volume').removeClass("sgc-over");
        percVolume = 0;
    }
    else
    {
        $('#uso-volume').removeClass("sgc-over");
        percVolume = ( usoVolume / totaleVolume );
    }
    var widthVolume    = $('#uso-volume .progress').width();
    var newWidthVolume = widthVolume * percVolume;
    $('#uso-volume .progress-bar').width(newWidthVolume);
}

function boxReset(tipo, id_padre)
{
    if (!tipo || tipo == "bat")
    {
        var batteria = 0;
        var volume   = 0;
        if (mobile == false)
        {
            $('#batteria #' + id_padre).attr('draggable', 'true');
        }
        
        batteria = parseInt($('#box-batteria #' + id_padre).data("batteria"));
        volume   = parseInt($('#box-batteria #' + id_padre).data("volume"));
        if (batteria > 0)
        {
            totaleBatteria -= batteria;
        }
        else if (batteria < 0)
        {
            usoBatteria -= ( batteria * -1 );
        }
        if (volume > 0)
        {
            totaleVolume -= volume;
        }
        else if (volume < 0)
        {
            usoVolume -= ( volume * -1 );
        }
        fixProgress();
        $('#box-batteria #' + id_padre).remove();
    }
    
    if (!tipo || tipo == "str")
    {
        var batteria = 0;
        var volume   = 0;
        if (mobile == false)
        {
            $('.drag-struttura').attr('draggable', 'true');
        }
        
        batteria = parseInt($('#box-struttura #' + id_padre).data("batteria"));
        volume   = parseInt($('#box-struttura #' + id_padre).data("volume"));
        if (batteria > 0)
        {
            totaleBatteria -= batteria;
        }
        else if (batteria < 0)
        {
            usoBatteria -= ( batteria * -1 );
        }
        if (volume > 0)
        {
            totaleVolume -= volume;
        }
        else if (volume < 0)
        {
            usoVolume -= ( volume * -1 );
        }
        fixProgress();
        $('#box-struttura #' + id_padre).remove();
    }
    if (!tipo || tipo == "app")
    {
        var batteria = 0;
        var volume   = 0;
        if (mobile == false)
        {
            $('#applicativo #' + id_padre).attr('draggable', 'true');
        }
        
        batteria = parseInt($('#box-applicativo #' + id_padre).data("batteria"));
        volume   = parseInt($('#box-applicativo #' + id_padre).data("volume"));
        if (batteria > 0)
        {
            totaleBatteria -= batteria;
        }
        else if (batteria < 0)
        {
            usoBatteria -= ( batteria * -1 );
        }
        if (volume > 0)
        {
            totaleVolume -= volume;
        }
        else if (volume < 0)
        {
            usoVolume -= ( volume * -1 );
        }
        fixProgress();
        
        $('#box-applicativo #' + id_padre).remove();
    }
}

function mappaIds(el)
{
    return el.id.replace(/^\S*\-(\S+)_\S*$/, "$1");
}

$('#btn_inviaCraftingTecnico').click(function ()
{
    var data = {
        pgid     : JSON.parse(window.localStorage.getItem("logged_pg")).id_personaggio,
        nome     : $("#nome_prototipo").val() || null,
        tipo     : $("input:radio[name='radiogroup']:checked").val() || null,
        batt_ids : $("#box-batteria > div").toArray().map(mappaIds),
        stru_ids : $("#box-struttura > div").toArray().map(mappaIds),
        appl_ids : $("#box-applicativo > div").toArray().map(mappaIds)
    };
    
    if (data.batt_ids.length === 0 || data.stru_ids.length === 0 || data.appl_ids.length === 0)
    {
        Utils.showError("&Egrave; necessario selezionare almeno un componente per ogni elemento dell'oggetto da craftare.");
        return false;
    }
    
    if (!data.nome || Utils.soloSpazi(data.nome))
    {
        Utils.showError("Inserire un nome per l'oggetto da craftare.");
        return false;
    }
    
    if (!data.tipo)
    {
        Utils.showError("&Egrave; necessario selezionare il tipo di oggetto che si vuole craftare.");
        return false;
    }
    
    if (usoBatteria > totaleBatteria)
    {
        Utils.showError("La batteria selezionata non pu&ograve; sopportare il carico di energia degli altri componenti.");
        return false;
    }
    
    if (usoVolume > totaleVolume)
    {
        Utils.showError("Il volume totale dell'oggetto non basta a contenere tutti i componenti.");
        return false;
    }
    
    Utils.requestData(
        Constants.API_POST_CRAFTING_TECNICO,
        "POST",
        data,
        "Ricetta registrata con successo.",
        null,
        Utils.reloadPage
    );
});
