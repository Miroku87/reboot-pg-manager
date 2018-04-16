function loadCsv(csv, callback)
{
    var file = '../../csv/componenti.csv';
    if (csv != undefined && csv != '')
    {
        file = csv;
    }
    $.get(file, function (res)
    {
        var lines = res.split("\r\n");
        //la linea 0 contiene le testate da mappare sull'oggetto
        var head = lines[0];
        head = head.split(';');
        var data = [];
        for (var i = 1; i < lines.length; i++)
        {
            var linea = lines[i];
            linea = linea.split(';');
            var obj = {};
            for (var x = 0; x < head.length; x++)
            {
                obj[head[x]] = linea[x];
            }
            data.push(obj);
        }
        if (callback)
            callback(data)
    });
}
function loadComponentsFromDB( callback )
{
    Utils.requestData(
        Constants.API_GET_COMPONENTI_BASE,
        "GET",
        {tipo:"tecnico"},
        callback
    );
}
var mobile = false;
var type = "";
var id_target = "";
var batteria = 0;
var volume = 0;
var totaleBatteria = 0;
var totaleVolume = 0;
var usoBatteria = 0;
var usoVolume = 0;

//popolo componenti
$(document).ready(function ()
{
    //loadCsv('', function (data)
    //{
    loadComponentsFromDB(function (data)
    {
        //divido i componenti a seconda del tipo
        data = data.data;
        var batteria = [];
        var struttura = [];
        var applicativo = [];
        var scartati = []
        for (var i = 0; i < data.length; i++)
        {
            data[i].Tipo = data[i].tipo_componente;
            data[i].Codice = data[i].id_componente;
            data[i].Volume = data[i].volume_componente;
            data[i].Energia = data[i].energia_componente;
            data[i].Nome = data[i].nome_componente;

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
        //loggo quelli scartati
        console.log("elementi scartati", scartati);
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
        {
            mobile = true;
        }
        console.log("mobile", mobile);

        //popolo i div
        popoloComponenti(batteria, "bat", "batteria");
        popoloComponenti(struttura, "str", "struttura");
        popoloComponenti(applicativo, "app", "applicativo");

    });
});

function popoloComponenti(array, id, div)
{
    var html = "";
    array.forEach(function (el)
    {
        if (mobile == false)
        {
            html += '   <div id="' + id + '-' + el.Codice + '" class="info-box bg-aqua drag-' + el.Tipo + '" draggable="true" ondragstart="drag(event)" data-batteria="' + el.Energia + '" data-volume="' + el.Volume + '">';
        }
        else
        {
            html += '   <div id="' + id + '-' + el.Codice + '" class="info-box bg-aqua drag-' + el.Tipo + '" onclick="addComponente(' + el.Tipo + ',' + el.Codice + ')" data-selezionabile="1" data-batteria="' + el.Energia + '" data-volume="' + el.Volume + '">';
        }
        html += '        <button type="button" class="btn btn-info btn-xs pull-right delete-el">&times;</button> ';
        html += '        <span class="info-box-icon">';
        if (el.Tipo == "batteria")
        {
            html += '<i class="fa fa-fw fa-battery-full"></i>';
        }
        else if (el.Tipo == "struttura")
        {
            html += '<i class="fa fa-fw fa-server"></i>';
        }
        else if (el.Tipo == "applicativo")
        {
            html += '<i class="fa fa-fw fa-qrcode"></i>';
        }
        html += '        </span>';
        html += '        <div class="info-box-content">';
        html += '            <span class="info-box-text sgc-info2">' + el.Tipo + ' - ' + el.Codice + '</span>';
        html += '            <span class="info-box-number">' + el.Nome + '</span>';
        html += '            <p>';
        if (parseInt(el.Energia) == 0)
        {
            html += '                <span class="description-percentage text-yellow">';
            html += '                <i class="fa fa-caret-left"></i> Energia (' + el.Energia + ')</span>';
        }
        else if (parseInt(el.Energia) > 0)
        {
            html += '                <span class="description-percentage text-green">';
            html += '                <i class="fa fa-caret-up"></i> Energia (' + el.Energia + ')</span>';
        }
        else if (parseInt(el.Energia) < 0)
        {
            html += '                <span class="description-percentage text-red">';
            html += '                <i class="fa fa-caret-down"></i> Energia (' + el.Energia + ')</span>';
        }
        html += '                <br>';
        if (parseInt(el.Volume) == 0)
        {
            html += '                <span class="description-percentage text-yellow">';
            html += '                <i class="fa fa-caret-left"></i> Spazio (' + el.Volume + ')</span>';
        }
        else if (parseInt(el.Volume) > 0)
        {
            html += '                <span class="description-percentage text-green">';
            html += '                <i class="fa fa-caret-up"></i> Spazio (' + el.Volume + ')</span>';
        }
        else if (parseInt(el.Volume) < 0)
        {
            html += '                <span class="description-percentage text-red">';
            html += '                <i class="fa fa-caret-down"></i> Spazio (' + el.Volume + ')</span>';
        }
        html += '            </p>';
        html += '        </div>';
        html += '    </div>  ';
    }.bind(this));
    $('#' + div).append(html);
}


//drag&copy


function addComponente(tipo, codice)
{
    type = tipo.substring(0, 3);
    var id = tipo.substring(0, 3);
    id_target = id + '-' + codice;
    batteria = parseInt($('#' + id_target).data("batteria"));
    volume = parseInt($('#' + id_target).data("volume"));

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
        usoBatteria += (batteria * -1);
    }
    if (volume > 0)
    {
        totaleVolume += volume;
    }
    else if (volume < 0)
    {
        usoVolume += (volume * -1);
    }

    fixProgress();
    /*fixStyle();*/

}


function allowDrop(ev)
{
    ev.preventDefault();
}

function drag(ev)
{
    type = "";
    id_target = "";
    batteria = 0;
    volume = 0;

    id_target = ev.target.id;
    ev.dataTransfer.setData("text", id_target);
    type = id_target.substring(0, 3);

    batteria = parseInt($('#' + id_target).data("batteria"));
    volume = parseInt($('#' + id_target).data("volume"));
}

function drop(ev)
{
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var tipo = "";


    var corretto = false;
    if (type == "bat" && ev.target.id == "box-batteria")
    {
        corretto = true;
        tipo = "batteria";
    }
    if (type == "str" && ev.target.id == "box-struttura")
    {
        corretto = true;
        tipo = "struttura";
    }
    if (type == "app" && ev.target.id == "box-applicativo")
    {
        corretto = true;
        tipo = "applicativo";
    }
    if (corretto)
    {
        $('.alert-danger').hide();
        var count = $('#box-' + tipo + ' .drag-' + tipo).length;

        ev.target.appendChild(document.getElementById(data).cloneNode(true));

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
            usoBatteria += (batteria * -1);
        }
        if (volume > 0)
        {
            totaleVolume += volume;
        }
        else if (volume < 0)
        {
            usoVolume += (volume * -1);
        }

        fixProgress();
        /*fixStyle();*/
    }
    else
    {
        $('.alert-danger').show();
        type = "";
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
        percBatteria = (usoBatteria / totaleBatteria);
    }
    var widthBatteria = $('#uso-batteria .progress').width();
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
        percVolume = (usoVolume / totaleVolume);
    }
    var widthVolume = $('#uso-volume .progress').width();
    var newWidthVolume = widthVolume * percVolume;
    $('#uso-volume .progress-bar').width(newWidthVolume);
}

/*function fixStyle() {
 if (type == "bat") {
 if (mobile == false) {
 $('#batteria #' + id_target).attr('draggable', 'false');
 } else {
 $('#batteria #' + id_target).data("selezionabile", true);
 }

 $('#batteria #' + id_target).addClass('drag-disabled');
 }
 if (type == "str") {
 if (mobile == false) {
 $('.drag-struttura').attr('draggable', 'false');
 } else {
 $('#struttura #' + id_target).data("selezionabile", true);
 }
 $('#struttura .drag-struttura').addClass('drag-disabled');
 //$('#text-struttura').hide();

 }
 if (type == "app") {
 if (mobile == false) {
 $('#applicativo #' + id_target).attr('draggable', 'false');
 } else {
 $('#applicativo #' + id_target).data("selezionabile", true);
 }
 $('#applicativo #' + id_target).addClass('drag-disabled');
 }

 type = "";
 } */

function boxReset(tipo, id_padre)
{
    if (tipo == "bat")
    {
        var batteria = 0;
        var volume = 0;
        if (mobile == false)
        {
            $('#batteria #' + id_padre).attr('draggable', 'true');
        }

        batteria = parseInt($('#box-batteria #' + id_padre).data("batteria"));
        volume = parseInt($('#box-batteria #' + id_padre).data("volume"));
        if (batteria > 0)
        {
            totaleBatteria -= batteria;
        }
        else if (batteria < 0)
        {
            usoBatteria -= (batteria * -1);
        }
        if (volume > 0)
        {
            totaleVolume -= volume;
        }
        else if (volume < 0)
        {
            usoVolume -= (volume * -1);
        }
        fixProgress();
        $('#box-batteria #' + id_padre).remove();
    }

    if (tipo == "str")
    {
        var batteria = 0;
        var volume = 0;
        if (mobile == false)
        {
            $('.drag-struttura').attr('draggable', 'true');
        }


        batteria = parseInt($('#box-struttura #' + id_padre).data("batteria"));
        volume = parseInt($('#box-struttura #' + id_padre).data("volume"));
        if (batteria > 0)
        {
            totaleBatteria -= batteria;
        }
        else if (batteria < 0)
        {
            usoBatteria -= (batteria * -1);
        }
        if (volume > 0)
        {
            totaleVolume -= volume;
        }
        else if (volume < 0)
        {
            usoVolume -= (volume * -1);
        }
        fixProgress();
        $('#box-struttura #' + id_padre).remove();
    }
    if (tipo == "app")
    {
        var batteria = 0;
        var volume = 0;
        if (mobile == false)
        {
            $('#applicativo #' + id_padre).attr('draggable', 'true');
        }

        batteria = parseInt($('#box-applicativo #' + id_padre).data("batteria"));
        volume = parseInt($('#box-applicativo #' + id_padre).data("volume"));
        if (batteria > 0)
        {
            totaleBatteria -= batteria;
        }
        else if (batteria < 0)
        {
            usoBatteria -= (batteria * -1);
        }
        if (volume > 0)
        {
            totaleVolume -= volume;
        }
        else if (volume < 0)
        {
            usoVolume -= (volume * -1);
        }
        fixProgress();
        $('#box-applicativo #' + id_padre).remove();
        /*$('.drag-applicativo').attr('draggable', 'true');
         $('#applicativo .drag-applicativo').removeClass('drag-disabled');
         $('#text-applicativo').show();
         $('#delete-applicativo').hide();
         $('#box-applicativo').html("");*/
    }
}

function mappaIds( el )
{
    return el.id.replace(/^\S*\-(\S+)_\S*$/,"$1");
}

$('.close').click(function ()
{
    $('.alert-danger').hide();
});

$('#btn_inviaCraftingTecnico').click(function ()
{
    var data = {
        pgid : JSON.parse(window.localStorage.getItem("pg_loggato")).id_personaggio,
        nome : $("#nome_prototipo").val() || null,
        tipo : $("input:radio[name='radiogroup']:checked").val() || null,
        batt_ids : $("#box-batteria > div").toArray().map(mappaIds),
        stru_ids : $("#box-struttura > div").toArray().map(mappaIds),
        appl_ids : $("#box-applicativo > div").toArray().map(mappaIds)
    };

    if( data.batt_ids.length === 0 || data.stru_ids.length === 0 || data.appl_ids.length === 0  )
    {
        Utils.showError("&Egrave; necessario selezionare almeno un componente per ogni elemento dell'oggetto da craftare.");
        return false;
    }

    if( !data.nome || Utils.soloSpazi(data.nome) )
    {
        Utils.showError("Inserire un nome per l'oggetto da craftare.");
        return false;
    }

    if( !data.tipo )
    {
        Utils.showError("&Egrave; necessario selezionare il tipo di oggetto che si vuole craftare.");
        return false;
    }

    if( usoBatteria > totaleBatteria )
    {
        Utils.showError("La batteria selezionata non pu&ograve; sopportare il carico di energia degli altri componenti.");
        return false;
    }

    if( usoVolume > totaleVolume )
    {
        Utils.showError("Il volume totale dell'oggetto non basta a contenere tutti i componenti.");
        return false;
    }

    Utils.requestData(
        Constants.API_POST_CRAFTING_TECNICO,
        "POST",
        data,
        "Ricetta registrata con successo."
    );
});