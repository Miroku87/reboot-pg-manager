/**
 * Created by Miroku on 11/03/2018.
 */
var CraftingSoftwareManager = function ()
{
    var QUESTIONS_PROG_BASE = [
            {
                name : "nome_programma",
                text : "Inserire il nome del nuovo software.",
                prompt : "Nome: ",
                sommabile : false
            },
            {
                name : "x_val",
                text : "\nInserire il parametro X della {num}^ sequenza in vostro possesso.",
                prompt : "X: ",
                sommabile : true,
                validation: function (cmd)
                {
                    if( /^\s*\d\s*$/i.test(cmd) )
                        return true;

                    return false;
                }
            },
            {
                name : "y_val",
                text : "\nInserire il parametro Y della {num}^ sequenza in vostro possesso.",
                prompt : "Y: ",
                sommabile : true,
                validation: function (cmd)
                {
                    if( /^\s*\d\s*$/i.test(cmd) )
                        return true;

                    return false;
                }
            },
            {
                name : "z_val",
                text : "\nInserire il parametro Z della {num}^ sequenza in vostro possesso.",
                prompt : "Z: ",
                sommabile : true,
                validation: function (cmd)
                {
                    if( /^\s*\d\s*$/i.test(cmd) )
                        return true;

                    return false;
                }
            }
        ],
        QUESTIONS_PROG_AVAN = [
            {
                name : "nome_programma",
                text : "Inserire il nome per la nuova combinazione di software.",
                prompt : "Nome: ",
                sommabile : false
            },
            {
                name : "x_val",
                text : "\nInserire il parametro X del {num}° software da combinare.",
                prompt : "X: ",
                sommabile : true,
                validation: function (cmd)
                {
                    if( /^\s*\d\s*$/i.test(cmd) )
                        return true;

                    return false;
                }
            },
            {
                name : "y_val",
                text : "\nInserire il parametro Y del {num}° software da combinare.",
                prompt : "Y: ",
                sommabile : true,
                validation: function (cmd)
                {
                    if( /^\s*\d\s*$/i.test(cmd) )
                        return true;

                    return false;
                }
            },
            {
                name : "z_val",
                text : "\nInserire il parametro Z del {num}° software da combinare.",
                prompt : "Z: ",
                sommabile : true,
                validation: function (cmd)
                {
                    if( /^\s*\d\s*$/i.test(cmd) )
                        return true;

                    return false;
                }
            }
        ],
        GREETINGS = "  _________ _________________          .__  .__ \n"+
            " /   _____//  _____/\\_   ___ \\    ____ |  | |__|\n"+
            " \\_____  \\/   \\  ___/    \\  \\/  _/ ___\\|  | |  |\n"+
            " /        \\    \\_\\  \\     \\____ \\  \\___|  |_|  |\n"+
            "/_______  /\\______  /\\______  /  \\___  >____/__|\n"+
            "        \\/        \\/        \\/       \\/         \n"+
            "Benvenuto nel framework di sviluppo applicativi dell'SGC.\n" +
            "Prego, inserire i parametri in vostro possesso:\n",
        SPINNERS = {
            "line": {
                "interval": 80,
                "frames": [
                    "-",
                    "\\",
                    "|",
                    "/"
                ]
            },
            "simpleDots": {
                "interval": 400,
                "frames": [
                    ".  ",
                    ".. ",
                    "...",
                    "   "
                ]
            }
        };

    return {
        init : function ()
        {
            this.setListeners();
            this.recuperaDatiLocali();
            this.impostaTerminale();
        },

        progress : function (term, percent)
        {
            var width = ( this.terminal.cols() / 1.5 ) - 10;
            var size = Math.round(width * percent / 100);
            var left = '', taken = '', i;

            for (i = size; i--;)
                taken += '=';

            if (taken.length > 0)
                taken = taken.replace(/=$/, '>');

            for (i = width - size; i--;)
                left += ' ';

            term.set_prompt( '[' + taken + left + '] ' + percent + '%' );
        },

        start : function (term, spinner)
        {
            var i = 0;
            function set()
            {
                var text = spinner.frames[i++ % spinner.frames.length];
                term.set_prompt(text);
            };
            this.terminal_prompt = term.get_prompt();
            term.find('.cursor').hide();
            set();
            this.terminal_timer = setInterval(set, spinner.interval);
        },

        stop : function (term, spinner)
        {
            setTimeout(function ()
            {
                clearInterval(this.terminal_timer);
                var frame = spinner.frames[0];
                term.set_prompt(this.terminal_prompt).echo(frame);
                term.find('.cursor').show();
            }.bind(this), 0);
        },

        showFinalMessage : function ()
        {
            this.terminal.echo( this.terminal.get_prompt() );
            this.terminal.echo( "" );
            this.terminal.set_prompt( this.default_prompt );
            this.terminal.focus(true);
            this.terminal.scroll_to_bottom();
        },

        showTechnoBabble : function ( i )
        {
            i = typeof i === "undefined" ? 0 : i;
            var texts = Testi.TECHNO_BUBBLING,
                delay = parseInt(Math.random() * 1000) / 4;

            setTimeout(function ()
                {
                    this.terminal.echo(texts[i].text);
                    this.progress(this.terminal, parseInt( ( i / texts.length ) * 100 ) );
                    this.terminal.scroll_to_bottom();

                    if( typeof texts[i+1] !== "undefined" )
                        this.showTechnoBabble(i+1);
                    else
                    {
                        this.progress(this.terminal, 100);
                        this.showFinalMessage();
                    }
                }.bind(this),
                50 + delay);
        },

        craftinInviato : function (  )
        {
            this.stop(this.terminal,SPINNERS.line);
            this.progress(this.terminal, 0);
            this.showTechnoBabble();
        },

        inviaDatiCrafting : function ( programmi )
        {
            this.start(this.terminal,SPINNERS.line);
            this.terminal.freeze(true);

            //this.craftinInviato();
            //return;

            Utils.requestData(
                Constants.API_POST_CRAFTING_PROGRAMMA,
                "POST",
                { pg: this.pg_info.id_personaggio, programmi: programmi },
                this.craftinInviato.bind(this)
            );
        },

        mostraOpzioni: function ( domanda, opzioni )
        {
            this.terminal.push(function (command)
                {
                    var opz = opzioni.filter(function(el){ return el.opzione === command; });

                    if( opz.length === 0 )
                    {
                        this.terminal.echo('[[b;#f00;]L\'opzione inserita non &egrave; contemplata.]');
                        this.terminal.pop();
                        this.mostraOpzioni(domanda,opzioni);
                    }

                    opz[0].reazione();
                }.bind(this),
                {
                    prompt : domanda + ' '
                });
        },

        rispostaMultipla: function ( domanda, risposte )
        {
            this.terminal.push(function (command)
            {
                var trimmed = command.replace(/^\s+|\s+$/g, "");
    
                for (var r in risposte)
                {
                    if (( new RegExp("^" + risposte[r].command + "$", "i") ).test(trimmed) && typeof risposte[r].callback === "function")
                        risposte[r].callback();
                }
            },
            {
                prompt : domanda + ' '
            });
        },

        sommaStringhe : function ( a, b )
        {
            var somma = ( parseInt( a, 10 ) + parseInt( b, 10 ) ) + "";
            return parseInt( somma.substr( somma.length-1, 1 ), 10 );
        },

        terminaDomande: function ( prog_avanz )
        {
            this.terminal.echo('\nEcco il risultato finale:');
            var somma = {},
                str   = "",
                perdb = {};

            this.answers.pop();
            for ( var a in this.answers )
            {
                if( prog_avanz && this.answers[a].nome_programma )
                {
                    somma["Nome comnbinazione"] = this.answers[a].nome_programma;
                    var copia = JSON.parse( JSON.stringify( this.answers[a] ) );
                    delete copia.nome_programma;
                    somma[(parseInt(a, 10) + 1) + "° software"] = $.map(copia, function (el) { return el; });
                }
                else if ( prog_avanz )
                    somma[(parseInt(a,10)+1)+"° software"] = $.map(this.answers[a],function(el){return el;});
                else if ( !prog_avanz )
                    for( var p in this.answers[a] )
                    {
                        if( !isNaN( parseInt( this.answers[a][p], 10 ) ) && somma[p] )
                            somma[p] = this.sommaStringhe( somma[p], this.answers[a][p] );
                        else
                            somma[p] = this.answers[a][p];
                    }
            }

            for( var s in somma )
                str += '[[b;#fff;]' + s + ']: ' + somma[s] + '\n';

            this.terminal.echo(str);

            perdb = prog_avanz ? this.answers : [somma];

            this.rispostaMultipla(
                prog_avanz ? "Confermi la combinazione di software? (s|n)" : "Confermi il software? (s|n)",
                [
                    {command: "s", callback: this.inviaDatiCrafting.bind(this, perdb)},
                    {command: "n", callback: this.impostaTerminale.bind(this)}
                ]
            );
        },

        mostraDomande: function ( cancella_precedenti, prog_avanz )
        {
            cancella_precedenti = typeof cancella_precedenti === "undefined" ? true : cancella_precedenti;

            if( cancella_precedenti )
                this.answers.pop();

            if( cancella_precedenti && prog_avanz )
                this.num_programmi--;

            this.answers.push({});
            this.terminal.pop();

            if( this.answers.length - 1 >= 2 && ( !prog_avanz || ( prog_avanz && this.num_programmi <= this.max_programmi ) ) )
            {
                this.rispostaMultipla(
                    prog_avanz ? "Combinare un nuovo software? (s|n)" : "Sommare una nuova sequenza? (s|n)",
                    [
                        {command: "s", callback: this.ask_questions.bind( this, 1, prog_avanz )},
                        {command: "n", callback: this.terminaDomande.bind( this, prog_avanz )}
                    ]
                );
            }
            else if ( this.answers.length - 1 < 2 )
                this.ask_questions( 1, prog_avanz );
        },

        aggiungiProgrammi: function ( combinare_programmi )
        {
            this.terminal.pop();
        },

        finish : function ( prog_avanz )
        {
            if( prog_avanz )
                this.num_programmi++;

            this.terminal.echo('\nSono stati inseriti i seguenti valori:');
            var ai = this.answers.length - 1,
                str = "";

            for( var a in this.answers[ai] )
            {
                //non chiedo conferma del nome se non alla fine
                if( a !== "nome_programma" )
                    str += '[[b;#fff;]' + a + ']: ' + this.answers[ai][a] + '\n';
            }

            this.terminal.echo(str);

            this.rispostaMultipla(
                !prog_avanz ? "Confermare sequenza (s|n)" : "Confermare software (s|n)",
                [
                    {command: "s", callback: this.mostraDomande.bind(this, false, prog_avanz)},
                    {command: "n", callback: this.mostraDomande.bind(this, true, prog_avanz)}
                ]
            );
        },

        ask_questions : function ( step, prog_avanz )
        {
            this.terminal.set_command("");

            var question = this.domande[step];
            if (question)
            {
                var ai = this.answers.length - 1;

                if (question.text)
                    this.terminal.echo('[[b;#fff;]' + question.text.replace(/\{num}/g,(ai+1)+"") + ']');

                this.terminal.push(function (command)
                    {
                        if( typeof question.validation === "function" && question.validation(command) === true || typeof question.validation !== "function" )
                        {
                            this.answers[ai][question.name] = command;

                            this.terminal.pop();
                            this.ask_questions(step + 1, prog_avanz);
                        }
                        else
                            this.terminal.echo('[[b;#f00;]Valore inserito errato. Riprovare.]');
                    }.bind(this),
                    {
                        prompt : question.prompt || question.name + ": "
                    }
                );
            }
            else
            {
                this.finish( prog_avanz );
            }
        },

        domandeBase: function ()
        {
            this.domande = QUESTIONS_PROG_BASE.concat();
            this.ask_questions(0,false);
        },

        domandeAvan: function ()
        {
            this.domande = QUESTIONS_PROG_AVAN.concat();
            this.terminal.echo('\nIn base al tuo chip potrai combinare fino a un massimo di '+this.max_programmi+' software gi&agrave; compilati.');
            this.ask_questions(0,true);
        },

        impostaTerminale: function ()
        {
            var utente = this.pg_info.nome_personaggio.toLowerCase().replace(/[^A-zÀ-ú]/g,"-");

            this.domande = QUESTIONS_PROG_BASE.concat();
            this.answers = [{}];
            this.default_prompt = utente+'@SGC> ';
            $('#terminal').height( $(".content-wrapper").height() - 51 );
            //$('#terminal').width( $(".content-wrapper").width() );
            $('.scanlines').height( $('#terminal').height() );
            $('.scanlines').width( $('#terminal').width() );

            if( this.terminal )
                this.terminal.destroy();

            this.terminal = $('#terminal').terminal(
                {
                    exit: function ()
                    {
                        Utils.redirectTo(Constants.PG_PAGE);
                    }
                },
                {
                    prompt    : this.default_prompt,
                    greetings : GREETINGS,
                    exit      : false,
                    keymap: {
                        "CTRL+R": function() { return false; },
                        "TAB" : function() { return false; },
                        "Shift+Enter" : function() { return false; },
                        "Up Arrow/CTRL+P" : function() { return false; },
                        "Down Arrow/CTRL+N" : function() { return false; },
                        "CTRL+R" : function() { return false; },
                        "CTRL+G" : function() { return false; },
                        "CTRL+L" : function() { return false; },
                        "CTRL+Y" : function() { return false; },
                        "Delete/backspace" : function() { return false; },
                        "Left Arrow/CTRL+B" : function() { return false; },
                        "CTRL+TAB" : function() { return false; },
                        "Right Arrow/CTRL+F" : function() { return false; },
                        "CTRL+Left Arrow" : function() { return false; },
                        "CTRL+Right Arrow" : function() { return false; },
                        "CTRL+A/Home" : function() { return false; },
                        "CTRL+E/End" : function() { return false; },
                        "CTRL+K" : function() { return false; },
                        "CTRL+U" : function() { return false; },
                        "CTRL+V/SHIFT+Insert" : function() { return false; },
                        "CTRL+W" : function() { return false; },
                        "CTRL+H" : function() { return false; },
                        "ALT+D" : function() { return false; },
                        "PAGE UP" : function() { return false; },
                        "PAGE DOWN" : function() { return false; },
                        "CTRL+D" : function() { return false; }
                    }
                }
            );

            this.terminal.history().disable();

            if( this.max_programmi > 1 )
            {
                this.rispostaMultipla(
                    "Il chip dell'utente permette la combinazione di pi&ugrave; programmi conosciuti. Cosa vuoi fare?"+
                    "\na) Unire nuove stringhe di codice (Programmazione)"+
                    "\nb) Unire pi&ugrave; programmi conosciuti (Programmazione Avanzata/Totale)"+
                    "\n(a|b)",
                    [
                        {command: "a", callback: this.domandeBase.bind(this)},
                        {command: "b", callback: this.domandeAvan.bind(this)}
                    ]
                );
            }
            else
                this.domandeBase();
        },

        recuperaDatiLocali : function ()
        {
            this.user_info = JSON.parse(window.localStorage.getItem("user"));
            this.pg_info   = JSON.parse(window.localStorage.getItem("logged_pg"));

            if( !this.pg_info )
            {
                Utils.showError("Devi loggarti con un personaggio prima di accedere a questa sezione.", Utils.redirectTo.bind(this,Constants.MAIN_PAGE));
                throw new Error("Devi loggarti con un personaggio prima di accedere a questa sezione.");
            }
            else if( this.pg_info && !Utils.controllaPermessiPg( this.pg_info, ["visualizza_pagina_crafting_programmazione"] ) )
            {
                Utils.showError("Non puoi accedere a questa sezione.", Utils.redirectTo.bind(this,Constants.MAIN_PAGE));
                throw new Error("Non puoi accedere a questa sezione.");
            }

            this.num_programmi = 0;
            this.max_programmi = this.pg_info.max_programmi_netrunner;
        },

        setListeners : function ()
        {
        }
    };
}();

$(function ()
{
    CraftingSoftwareManager.init();
});
