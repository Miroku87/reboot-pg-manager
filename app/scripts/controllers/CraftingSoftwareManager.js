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

        ask_questions : function (step)
        {
            var question = this.domande[step];
            if (question)
            {
                var ai = this.answers.length - 1;

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
                                this.answers[ai][question.name] = value;
                                this.terminal.pop();
                                this.ask_questions(step + 1);
                            }
                        }
                        else
                        {
                            if( typeof question.validation === "function" && question.validation(command) === true || typeof question.validation !== "function" )
                            {
                                this.answers[ai][question.name] = command;
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
                
                if (typeof this.answers[ai][question.name] != 'undefined')
                {
                    if (typeof this.answers[ai][question.name] == 'boolean')
                    {
                        this.terminal.set_command(this.answers[ai][question.name] ? 's' : 'n');
                    }
                    else
                    {
                        this.terminal.set_command(this.answers[ai][question.name]);
                    }
                }
            }
            else
            {
                this.finish();
            }
        },

        chiediConferma: function ( domanda, seSi, seNo )
        {
            this.terminal.push(function (command)
                {
                    if ( command.match(/^s$/i) && typeof seSi === "function" )
                        seSi();
                    else if ( command.match(/^n$/i) && typeof seNo === "function" )
                        seNo();
                }.bind(this),
                {
                    prompt : domanda + ' '
                });
        },

        terminaDomande: function ()
        {
            this.inviaDatiCrafting(this.answers);
        },

        mostraDomande: function ( cancella_precedenti )
        {
            cancella_precedenti = typeof cancella_precedenti === "undefined" ? true : cancella_precedenti;

            if( cancella_precedenti )
                this.answers.pop();

            this.answers.push({});
            this.terminal.pop();
            this.ask_questions(0);
        },

        aggiungiProgrammi: function ()
        {
            this.terminal.pop();
            if( this.max_programmi > 1 && ++this.num_programmi < this.max_programmi )
            {
                this.domande = this.domande.filter(function(el){ return el.name !== "nome_programma"; });
                this.chiediConferma(
                    "In base ai dati sulle tue capacit&agrave puoi aggiungere un nuovo programma al precedente.\nProcedere? (s|n)",
                    this.mostraDomande.bind(this, false),
                    this.terminaDomande.bind(this)
                );
            }
            else
                this.terminaDomande( );
        },

        finish : function ()
        {
            this.terminal.echo('\nSono stati inseriti i seguenti valori:');
            var ai = this.answers.length - 1,
                str = Object.keys(this.answers[ai]).map(function (key)
                {
                    var value = this.answers[ai][key];
                    return '[[b;#fff;]' + key + ']: ' + value;
                }.bind(this)).join('\n');
            this.terminal.echo(str);

            this.chiediConferma(
                "Confermare programma (s|n)",
                this.aggiungiProgrammi.bind(this),
                this.mostraDomande.bind(this, true)
            );
        },

        impostaTerminale: function ()
        {
            var utente = this.pg_info.nome_personaggio.toLowerCase().replace(/[^A-zÀ-ú]/g,"-");

            this.domande = QUESTIONS.concat();
            this.answers = [{}];
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