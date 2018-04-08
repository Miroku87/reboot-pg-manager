/**
 * Created by Miroku on 11/03/2018.
 */
var CraftingSoftwareManager = function ()
{
    var QUESTIONS = [
            {
                name : "nome_programma",
                text : "Inserire il nome del nuovo applicativo.",
                prompt : "Nome: "
            },
            {
                name : "x_val",
                text : "\nInserire il parametro X del nuovo applicativo.",
                prompt : "X: ",
                validation: function (cmd)
                {
                    if( /^\s*\d\s*$/i.test(cmd) )
                        return true;

                    return false;
                }
            },
            {
                name : "y_val",
                text : "\nInserire il parametro Y del nuovo applicativo.",
                prompt : "Y: ",
                validation: function (cmd)
                {
                    if( /^\s*\d\s*$/i.test(cmd) )
                        return true;

                    return false;
                }
            },
            {
                name : "z_val",
                text : "\nInserire il parametro Z del nuovo applicativo.",
                prompt : "Z: ",
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
        },
        TECHNO_BABBLE = [
            { delay: 0, text: "File in preparazione per la compilazione dell'applicativo..." },
            { delay: 0, text: "Compilatore inizializzato..." },
            { delay: 100, text: "Connessione con block-chain SGC..." },
            { delay: 0, text: "Parametri di accesso accettati." },
            { delay: 50, text: "Ambiente di sviluppo in fase di caricamento..." },
            { delay: 0, text: "Ambiente di sviluppo caricato." },
            { delay: 100, text: "Analisi sintassi codice..." },
            { delay: 100, text: "Ricerca falle di sicurezza del codice..." },
            { delay: 100, text: "Scarico parametri di compressione..." },
            { delay: 0, text: "[D423#34C@SGC]: //SGC//Struttura//223//CDN//grv-compression.ez3 >> //Local//Storage//Compression//grv-compression.ez3" },
            { delay: 0, text: "[D423#34C@SGC]: //SGC//Struttura//223//CDN//grv-concat.ez3 >> //Local//Storage//Compression//grv-concat.ez3" },
            { delay: 0, text: "[D423#34C@SGC]: //SGC//Struttura//223//CDN//grv-compiling.ez3 >> //Local//Storage//Compression//grv-compiling.ez3" },
            { delay: 0, text: "[D423#34C@SGC]: //SGC//Struttura//223//CDN//grv-application.ez3 >> //Local//Storage//Compression//grv-application.ez3" },
            { delay: 0, text: "[D423#34C@SGC]: //SGC//Struttura//223//CDN//grv-interpreter.ez3 >> //Local//Storage//Compression//grv-interpreter.ez3" },
            { delay: 0, text: "Parametri di compressione scaricati." },
            { delay: 0, text: "Collegamento con sinapsi T.A.R.D.I.S. per potenza di calcolo." },
            { delay: 0, text: "Compressione in corso..." },
            { delay: 300, text: "Analisi variabili iterative per connessioni meccaniche..." },
            { delay: 0, text: "[M361#27F@SGC]: //SGC//Struttura//43//CDN//rpg-movement.kjw" },
            { delay: 0, text: "[M361#27F@SGC]: //SGC//Struttura//43//CDN//rpg-bonus-tracking.kjw" },
            { delay: 0, text: "[M361#27F@SGC]: //SGC//Struttura//43//CDN//rpg-status-modification.kjw" },
            { delay: 0, text: "[M361#27F@SGC]: //SGC//Struttura//43//CDN//rpg-attack-range.kjw" },
            { delay: 0, text: "[M361#27F@SGC]: //SGC//Struttura//43//CDN//rpg-power-cell.kjw" },
            { delay: 0, text: "[M361#27F@SGC]: //SGC//Struttura//43//CDN//rpg-fire-velocity.kjw" },
            { delay: 0, text: "[M361#27F@SGC]: //SGC//Struttura//43//CDN//rpg-firing-power.kjw" },
            { delay: 0, text: "[M361#27F@SGC]: //SGC//Struttura//43//CDN//rpg-hacking-security.kjw" },
            { delay: 300, text: "Analisi variabili iterative per connessioni neurali..." },
            { delay: 0, text: "[N098#41G@SGC]: //SGC//Struttura//421//CDN//chr-neural-security.kjw" },
            { delay: 0, text: "[N098#41G@SGC]: //SGC//Struttura//421//CDN//chr-system-coordination.kjw" },
            { delay: 0, text: "[N098#41G@SGC]: //SGC//Struttura//421//CDN//chr-.kjw" },
            { delay: 300, text: "Analisi variabili iterative per connessioni temporali..." },
            { delay: 0, text: "[T490#56Y@SGC]: //SGC//Struttura//33//CDN//tmp-millscnd.ts" },
            { delay: 0, text: "[T490#56Y@SGC]: //SGC//Struttura//33//CDN//tmp-jump.ts" },
            { delay: 0, text: "[T490#56Y@SGC]: //SGC//Struttura//33//CDN//tmp-attack-cooldown.ts" },
            { delay: 0, text: "[T490#56Y@SGC]: //SGC//Struttura//33//CDN//tmp-defense-bonus.ts" },
            { delay: 0, text: "[T490#56Y@SGC]: //SGC//Struttura//33//CDN//tmp-agility-boost.ts" },
            { delay: 0, text: "[T490#56Y@SGC]: //SGC//Struttura//33//CDN//tmp-time-frame-reduction.ts" },
            { delay: 0, text: "[T490#56Y@SGC]: //SGC//Struttura//33//CDN//tmp-core-blocks.ts" },
            { delay: 300, text: "Ottimizzazione flusso di dati..." },
            { delay: 0, text: "[D967#82H@SGC]: //SGC//Struttura//33//CDN//dt-data-transfer.dts" },
            { delay: 0, text: "[D967#82H@SGC]: //SGC//Struttura//33//CDN//dt-data-typing.dts" },
            { delay: 0, text: "[D967#82H@SGC]: //SGC//Struttura//33//CDN//dt-type-conversion-rate.dts" },
            { delay: 0, text: "[D967#82H@SGC]: //SGC//Struttura//33//CDN//dt-range-length.dts" },
            { delay: 0, text: "[D967#82H@SGC]: //SGC//Struttura//33//CDN//dt-visualization-sys.dts" },
            { delay: 0, text: "Finalizzazione applicazione..." },
            { delay: 1000, text: "[[b;#0f0;]OK]" },
            { delay: 0, text: "Applicativo compilato e inviato ai server SGC." },
            { delay: 0, text: "Il personale si occuper&agrave; di scaricare il software su dispositivo fisico e consegnartelo." },
            { delay: 0, text: "Nel frattempo potrai vedere il tuo progetto nella sezione utente del terminale sotto [[b;#fff;]Ricette]." }
        ];

    return {
        init : function ()
        {
            this.setListeners();
            this.recuperaDatiLocali();
            this.impostaTerminale();
        },

        progress : function (term, percent)
        {
            var width = this.terminal.cols() - 8;
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
                var frame = spinner.frames[i % spinner.frames.length];
                term.set_prompt(this.terminal_prompt).echo(frame);
                term.find('.cursor').show();
            }, 0);
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
            setTimeout(function ()
                {
                    this.terminal.echo(TECHNO_BABBLE[i].text);
                    this.progress(this.terminal, parseInt( ( i / TECHNO_BABBLE.length ) * 100 ) );
                    this.terminal.scroll_to_bottom();

                    if( typeof TECHNO_BABBLE[i+1] !== "undefined" )
                        this.showTechnoBabble(i+1);
                    else
                    {
                        this.progress(this.terminal, 100);
                        this.showFinalMessage();
                    }
                }.bind(this),
                50 + TECHNO_BABBLE[i].delay);
        },

        inviaDatiCrafting : function ( dati )
        {
            //TODO: fai partire finta compilazione
            //this.start( this.terminal, SPINNERS.line );
            this.terminal.cols();
            this.progress(this.terminal, 0);
            this.showTechnoBabble();
        },

        ask_questions : function (step)
        {
            var question = QUESTIONS[step];
            if (question)
            {
                if (question.text)
                    this.terminal.echo('[[b;#fff;]' + question.text + ']');

                this.terminal.push(function (command)
                    {
                        if (question.boolean)
                        {
                            var value;
                            if (command.match(/^S(i)?/i))
                            {
                                value = true;
                            }
                            else if (command.match(/^N(o)?/i))
                            {
                                value = false;
                            }
                            if (typeof value != 'undefined')
                            {
                                this.answers[question.name] = value;
                                this.terminal.pop();
                                this.ask_questions(step + 1);
                            }
                        }
                        else
                        {
                            if( typeof question.validation === "function" && question.validation(command) === true || typeof question.validation !== "function" )
                            {
                                this.answers[question.name] = command;
                                this.terminal.pop();
                                this.ask_questions(step + 1);
                            }
                            else
                                this.terminal.echo('[[b;#f00;]Valore inserito errato. Riprovare.]');
                        }
                    }.bind(this),
                    {
                        prompt : question.prompt || question.name + ": "
                    }
                );
                
                if (typeof this.answers[question.name] != 'undefined')
                {
                    if (typeof this.answers[question.name] == 'boolean')
                    {
                        this.terminal.set_command(this.answers[question.name] ? 's' : 'n');
                    }
                    else
                    {
                        this.terminal.set_command(this.answers[question.name]);
                    }
                }
            }
            else
            {
                this.finish();
            }
        },

        finish : function ()
        {
            this.terminal.echo('\nSono stati inseriti i seguenti valori:');
            var str = Object.keys(this.answers).map(function (key)
                {
                    var value = this.answers[key];
                    return '[[b;#fff;]' + key + ']: ' + value;
                }.bind(this)).join('\n');
            this.terminal.echo(str);
            this.terminal.push(function (command)
                {
                    if (command.match(/^s$/i))
                    {
                        //TODO: se l'utente ha l'abilità prog avanz o prog tot chiedere se vuole aggiungere applicazioni
                        //this.terminal.echo("\nVuoi unire un altro applicativo a quello appena compilato?");
                        //this.terminal.set_prompt("(s|n): "),
                        this.inviaDatiCrafting(this.answers);
                        this.terminal.pop().history().enable();
                    }
                    else if (command.match(/^n$/i))
                    {
                        this.terminal.pop();
                        this.ask_questions(0);
                    }
                }.bind(this),
                {
                    prompt : '\nConfermare (s|n): '
                });
        },

        impostaTerminale: function ()
        {
            var utente = this.pg_info.nome_personaggio.toLowerCase().replace(/[^A-zÀ-ú]/g,"-");

            this.answers = {};
            this.default_prompt = utente+'@SGC> ';
            $('#terminal').height( $(".content-wrapper").height() - 51 );
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
                    exit      : false
                }
            );

            this.terminal.history().disable();
            this.ask_questions(0);
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