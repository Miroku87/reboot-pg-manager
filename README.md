# Reboot Live PG Manager

## Prerequisiti
* [Git](https://git-scm.com/)
* [NodeJS 4+](https://nodejs.org/it/download/current/)
* NPM (Si installa automaticamente assieme a NodeJS)
* [Bower](https://bower.io/#install-bower)
* [Grunt CLI](https://gruntjs.com/getting-started#installing-the-cli)
* [Reboot API](https://github.com/Miroku87/reboot-live-api.git)


## Installazione
Clonare questa repository in una folder di vostra preferenza.
Una volta terminato il trasferimento installare tutti i pacchetti di NodeJS:
```
npm install
```
Dopo che il processo precedente ha terminato installare i pacchetti Bower.
Durante questa fase verranno chieste delle informazioni. Rispondere nel modo seguente

* Versione AdminLTE: 2
* Font per le icone: Font Awesome
* Versione JQuery: 1.9.x

```
bower install
```

## Sviluppo
La directory di lavoro è `app`, ma prima di iniziare a modificare i file al suo interno avviare il watcher con questo comando:
 
```
grunt
```

Questo task compilerà tutti i file HTML e i JavaScript, li inserirà nella cartella `.tmp` e poi avvierà un webserver che permetterà di eseguire il codice compilato.
Dopo che il server sarà avviato verrà aperto automaticamente il browser predefinito con la pagina iniziale del sito.

### Template
Le pagine HTML di questo sito sono tutte generate tramite l'utilizzo del "linguaggio di templating" [Nunjucks](https://mozilla.github.io/nunjucks/). 
Questo per evitare di dover copiare e incollare mille righe di HTML che, in caso di modifica, devono essere riviste in tutti i file generati.
Nunjucks permette di impostare dei template e li renderizza tramite Grunt prima di renderli disponibili al server.
In questo modo le pagine HTML che verranno renderizzate dal browser saranno complete con tutto l'HTML necessario.

Per creare nuove pagine di contenuti creare un file HTML all'interno della cartella `app` e inserire la struttura base seguente:

```
{% extends "./templates/main_template.html" %}
{% set body_classes = body_classes + " <nome-classe-pagina>" %}
{% set section = "<nome-sezione-obbligatorio>" %}
{% set titolo_sezione = "<titolo-sezione>"  %}
{% set descrizione_sezione = "<descrizione-sezione-opzionale>"  %}

{% block styles %}
<link href="..." rel="stylesheet" >
{% endblock %}

{% block mainContent %}
{{ super() }

<!--------------------------
  | Your Page Content Here |
  -------------------------->

{% endblock %}

{% block managers %}
{{ super() }}
<!-- Creare uno script apposito per la gestione di questa pagina -->
<script src="scripts/controllers/PageManager.js"></script>
{% endblock %}
```

I due template principali che contengono i codici comuni a tutte le pagine (CSS, JS e HTML dei menù, header e footer) sono:

* `app/templates/layout_template.html` il padre di tutto
* `app/templates/main_template.html` il template con i menù

### Stili
Per sovrascrivere gli stili creare dei file SCSS separati da quelli già presenti e poi importarli ( **con estensione CSS** ) nelle corrette pagine HTML all'interno del blocco `styles` mostrato qui sopra.

Per sovrascrivere gli stili di tutte le pagine contemporaneamente modificare il file `app/templates/layout_template.html` e inserire il nuovo tag `<link href...>` **prima** dell'import del file `main.css`.
Questo perché in `main.css` vengono fatti altri override degli stili generici di AdminLTE e non possono essere modificati o si rischia di rompere il sito.

### Scripting
Ogni HTML ha un suo codice JavaScript chiamato genericamente Manager. Questi codici vengono inseriti per convenzione dentro `app/scripts/controllers`.

## Compilare
Per poter testare in ambiente di preproduzione e per mettere in produzione il formato bisogna compilarlo tramite i seguenti comandi Grunt:

```
# Per ambiente di preproduzione
grunt preprod

# Per ambiente di produzione
grunt prod
```
