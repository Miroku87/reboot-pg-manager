
function loadCsv(csv, callback) {
    var file = '../../csv/componenti.csv';
    if (csv != undefined && csv != '') {
        file = csv;
    }
    $.get(file, function (res) {
        var lines = res.split("\r\n");
        //la linea 0 contiene le testate da mappare sull'oggetto
        var head = lines[0];
        head = head.split(';');
        var data = [];
        for (var i = 1; i < lines.length; i++) {
            var linea = lines[i];
            linea = linea.split(';');
            var obj = {};
            for (var x = 0; x < head.length; x++) {
                obj[head[x]] = linea[x];
            }
            data.push(obj);
        }
        if (callback)
            callback(data)
    });
}
var mobile = false;

        //popolo componenti
        $(document).ready(function () {
            var t = $('#mercato').DataTable({
                responsive: true 
            });

            loadCsv('', function (data) {
                //divido i componenti a seconda del tipo
                var batteria = [];
                var struttura = [];
                var applicativo = [];
                var scartati = []
                for (var i = 0; i < data.length; i++) {
                    if (data[i].Tipo == "batteria") {
                        batteria.push(data[i]);
                    } else if (data[i].Tipo == "struttura") {
                        struttura.push(data[i]);
                    } else if (data[i].Tipo == "applicativo") {
                        applicativo.push(data[i]);
                    } else {
                        scartati.push(data[i]);
                    }
                }
                //loggo quelli scartati


                var html = "";
                data.forEach(el => {
                    var html = "";
                    var variazione = 0;
                    if (parseInt(el.Costo_Vecchio) != 0 && el.Costo_Vecchio != undefined) {
                        variazione = ((parseInt(el.Costo) - parseInt(el.Costo_Vecchio)) / parseInt(el.Costo_Vecchio)) * 100;
                    }
                    else {
                        variazione = 100;
                    }
                    var stringE = "";
                    if (parseInt(el.Energia) == 0) {
                        stringE += '                <span class="description-percentage text-yellow">';
                        stringE += '                <i class="fa fa-caret-left"></i> </span> Enerigia (' + el.Energia + ')';
                    } else if (parseInt(el.Energia) > 0) {
                        stringE += '                <span class="description-percentage text-green">';
                        stringE += '                <i class="fa fa-caret-up"></i></span> Enerigia (' + el.Energia + ')';
                    } else if (parseInt(el.Energia) < 0) {
                        stringE += '                <span class="description-percentage text-red">';
                        stringE += '                <i class="fa fa-caret-down"></i></span> Enerigia (' + el.Energia + ')';
                    }
                    stringE += '                <br>';
                    if (parseInt(el.Volume) == 0) {
                        stringE += '                <span class="description-percentage text-yellow">';
                        stringE += '                <i class="fa fa-caret-left"></i></span> Spazio (' + el.Volume + ')';
                    } else if (parseInt(el.Volume) > 0) {
                        stringE += '                <span class="description-percentage text-green">';
                        stringE += '                <i class="fa fa-caret-up"></i></span> Spazio (' + el.Volume + ')';
                    } else if (parseInt(el.Volume) < 0) {
                        stringE += '                <span class="description-percentage text-red">';
                        stringE += '                <i class="fa fa-caret-down"></i></span> Spazio (' + el.Volume + ')';
                    }

                    var stringV = '';
                    if (parseInt(variazione) == 0) {
                        stringV += '                <span class="description-percentage text-yellow">';
                        stringV += '                <i class="fa fa-caret-left"></i> ' + variazione.toFixed(2) + ' %</span> ';
                    } else if (variazione > 0) {
                        stringV += '                <span class="description-percentage text-red">';
                        stringV += '                <i class="fa fa-caret-up"></i> ' + variazione.toFixed(2) + ' %</span> ';
                    } else if (variazione < 0) {
                        stringV += '                <span class="description-percentage text-green">';
                        stringV += '                <i class="fa fa-caret-down"></i> ' + variazione.toFixed(2) + ' %</span> ';
                    }



                    if (el.Tipo != undefined && el.Descrizione != undefined && el.Costo != undefined) {
                        t.row.add([
                            '<span class="sgc-info2">' + el.Tipo + '</span>',
                            '<h4>' + el.Nome + '</h4><span class="desc">' + el.Descrizione + '</span>',
                            stringE,
                            el.Costo,
                            stringV
                        ]).draw(false);

                        $('#mercato').append(html);
                    }

                });
            });
        });


