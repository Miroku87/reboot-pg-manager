function loadComponentsFromDB(callback)
{
    Utils.requestData(
        Constants.API_GET_COMPONENTI_BASE,
        "GET",
        {
            draw   : 1,
            columns: null,
            order  : null,
            start  : 0,
            length : 999999,
            search : null,
            tipo   : "chimico"
        },
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
    $('.delete-el').hide();
    loadComponentsFromDB(function (data)
    {
        //divido i componenti a seconda del tipo
        data = data.data;
        var sostanza = [];
        var struttura = [];
        var cerotto = [];
        var fiala = [];
        var solido = [];
        var scartati = [];
        for (var i = 0; i < data.length; i++)
        {
            data[i].Tipo = data[i].tipo_componente;
            data[i].Codice = data[i].id_componente;
            data[i].Nome = data[i].nome_componente;
            data[i].Descrizione = data[i].descrizione_componente;
            if (data[i].Tipo.toLowerCase() == "sostanza")
            {
                sostanza.push(data[i]);
            }
            else if (data[i].Tipo.toLowerCase() == "cerotto")
            {
                struttura.push(data[i]);
            }
            else if (data[i].Tipo.toLowerCase() == "fiala")
            {
                struttura.push(data[i]);
            }
            else if (data[i].Tipo.toLowerCase() == "solido")
            {
                struttura.push(data[i]);
            }
            else
            {
                scartati.push(data[i]);
            }
        }
        console.log("elementi sostanza", sostanza);
        console.log("elementi cerotto", cerotto);
        console.log("elementi fiala", fiala);
        console.log("elementi solido", solido);
        console.log("elementi struttura", struttura);
        //
        ////loggo quelli scartati
        //console.log("elementi scartati", scartati);
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
        {
            mobile = true;
        }
        //console.log("mobile", mobile);

        //popolo i div
        popoloComponenti(sostanza, "sos", "sostanza");
        popoloComponenti(struttura, "str", "struttura");
        //popoloComponenti(cerotto, "cer", "cerotto");
        //popoloComponenti(fiala, "fia", "fiala");
        //popoloComponenti(solido, "sod", "solido");

    });
});
function popoloComponenti(array, id, div)
{
    var html = "";
    array.forEach(function (el)
    {
        if (mobile == false)
        {
            html += '   <div id="' + id + '-' + el.Codice + '" class="info-box bg-aqua drag-' + el.Tipo + '" draggable="true" ondragstart="drag(event)">';
        }
        else
        {
            html += '   <div id="' + id + '-' + el.Codice + '" class="info-box bg-aqua drag-' + el.Tipo + '" onclick="addComponente("' + el.Tipo + ',"' + el.Codice + '")" data-selezionabile="1">';
        }
        html += '        <div class="info-box-icon">';
        if (el.Tipo == "sostanza")
        {
            html += '<img src="images/molecule.png" class="img-responsive">';
        }
        else if (el.Tipo == "cerotto")
        {
            html += '<img src="images/plaster.png" class="img-responsive">';
        }
        else if (el.Tipo == "fiala")
        {
            html += '<img src="images/vial.png" class="img-responsive">';
        }
        else if (el.Tipo == "solido")
        {
            html += '<img src="images/salt.png" class="img-responsive">';
        }
        html += '        </div>';
        html += '        <div class="info-box-content">';
        html += '            <span class="info-box-text sgc-info2">' + el.Tipo + ' - ' + el.Codice + '</span>';
        html += '            <span class="info-box-number">' + el.Nome + '</span>';
        html += '            <p>' + el.Descrizione + '</p>';
        html += '        </div>';
        html += '    </div>  ';
    });
    $('#' + div).append(html);
}

//drag&copy
$('.close').click(function ()
{
    $('.alert-danger').hide();
});

function addComponente(tipo, codice)
{
    //TODO:mobile

}

function allowDrop(ev)
{
    ev.preventDefault();
}

function drag(ev)
{
    type = "";
    id_target = "";

    id_target = ev.target.id;
    ev.dataTransfer.setData("text", id_target);
    type = id_target.substring(0, 3);
}

function drop(ev)
{
    ev.preventDefault();
    var target = ev.target;
    var id_des = "";
    if (ev.target.id.substring(0, 2) == "h1")
    {
        id_des = target.parentNode.id;
        target = ev.target.parentNode;
    }
    else
    {
        id_des = target.id;
    }

    var data = ev.dataTransfer.getData("text");
    var tipo = "";

    var corretto = false;
    if (type == "sos" && $('#' + id_des).hasClass('allow-sostanza'))
    {
        corretto = true;
        tipo = "sostanza";
    }
    else if (type == "str" && $('#' + id_des).hasClass('allow-sostanza') == false)
    {
        corretto = true;
        tipo = "struttura";
    }
    else if (type == "cer" && $('#' + id_des).hasClass('allow-sostanza') == false)
    {
        corretto = true;
        tipo = "cerotto";
    }
    else if (type == "fia" && $('#' + id_des).hasClass('allow-sostanza') == false)
    {
        corretto = true;
        tipo = "fiala";
    }
    else if (type == "sod" && $('#' + id_des).hasClass('allow-sostanza') == false)
    {
        corretto = true;
        tipo = "solido";
    }

    if (corretto)
    {
        $('.alert-danger').hide();
        $('#' + id_des + '> h1').remove();
        target.appendChild(document.getElementById(data).cloneNode(true));
        $('#' + id_des + ' .delete-el').show();
        $('#' + id_des).removeAttr('ondragover');
        $('#' + id_des).removeAttr('ondrop');
        $('#' + id_des).removeAttr('draggable');

    }
    else
    {
        $('.alert-danger').show();
        type = "";
    }
}

function resetBox(id)
{
    var html = '';
    if (id == 'principio')
    {
        html += ' <button type="button" class="btn btn-info btn-xs pull-right delete-el" onclick="resetBox(\'principio\')">&times;</button> <h1 id="h1-principio" ondrop="drop(event)" ondragover="allowDrop(event)">Principio Attivo</h1>';
    }
    else if (id == 'sostanza1')
    {
        html += ' <button type="button" class="btn btn-info btn-xs pull-right delete-el" onclick="resetBox(\'sostanza1\')">&times;</button> <h1 id="h1-sostanza1" ondrop="drop(event)" ondragover="allowDrop(event)">Sostanza #01</h1>';
    }
    else if (id == 'sostanza2')
    {
        html += ' <button type="button" class="btn btn-info btn-xs pull-right delete-el" onclick="resetBox(\'sostanza2\')">&times;</button> <h1 id="h1-sostanza2" ondrop="drop(event)" ondragover="allowDrop(event)">Sostanza #02</h1>';
    }
    else if (id == 'sostanza3')
    {
        html += ' <button type="button" class="btn btn-info btn-xs pull-right delete-el" onclick="resetBox(\'sostanza3\')">&times;</button> <h1 id="h1-sostanza3" ondrop="drop(event)" ondragover="allowDrop(event)">Sostanza #03</h1>';
    }
    else if (id == 'biostruttura')
    {
        html += '<button type="button" class="btn btn-info btn-xs pull-right delete-el"  onclick="resetBox(\'biostruttura\')">&times;</button>';
    }
    $('#' + id).html(html);
    $('#' + id).attr('ondragover', 'allowDrop(event)');
    $('#' + id).attr('ondrop', 'drop(event)');
    $('#' + id + ' .delete-el').hide();
}

$('#btn_inviaCraftingChimico').click(function ()
{
    var data = {
        pgid            : JSON.parse(window.localStorage.getItem("logged_pg")).id_personaggio,
        nome            : $("#nome_composto").val() || null,
        struttura       : $("#biostruttura > div").first().attr("id"),
        principio_attivo: $("#principio > div").first().attr("id"),
        satellite_1     : $("#sostanza1 > div").first().attr("id"),
        satellite_2     : $("#sostanza2 > div").first().attr("id"),
        satellite_3     : $("#sostanza3 > div").first().attr("id")
    };

    if( !data.nome || Utils.soloSpazi(data.nome) )
    {
        Utils.showError("Inserire un nome per l'oggetto da craftare.");
        return false;
    }

    if( !data.struttura || !data.principio_attivo || !data.satellite_1 || !data.satellite_2 || !data.satellite_3 )
    {
        Utils.showError("&Egrave; necessario miscelare 4 sostanze indicando la Biostruttura.");
        return false;
    }
    else
    {
        data.struttura       = data.struttura.replace(/^\S*?-(.*)$/,"$1");
        data.principio_attivo= data.principio_attivo.replace(/^\S*?-(.*)$/,"$1");
        data.satellite_1     = data.satellite_1.replace(/^\S*?-(.*)$/,"$1");
        data.satellite_2     = data.satellite_2.replace(/^\S*?-(.*)$/,"$1");
        data.satellite_3     = data.satellite_3.replace(/^\S*?-(.*)$/,"$1");
    }

    Utils.requestData(
        Constants.API_POST_CRAFTING_CHIMICO,
        "POST",
        data,
        "Sostanza registrata con successo.",
        null,
        Utils.reloadPage
    );
});
