/**
 * Created by Miroku on 11/10/2018.
 */

var StatisticsManager = StatisticsManager || function ()
{
    return {
        
        disegnaStatisticheClassi: function disegnaStatisticheClassi( data )
        {
            var data            = data.data,
                military_data   = data.filter( function ( el )
                {
                    return el.tipo_classe === "militare";
                } ),
                military_labels = military_data.map( function ( el )
                {
                    return el.nome_classe;
                } ),
                military_colors = military_data.map( function ( el )
                {
                    return Utils.dynamicColor();
                } ),
                military_data   = military_data.map( function ( el )
                {
                    return parseInt( el.QTY, 10 );
                } ),
                civilian_data   = data.filter( function ( el )
                {
                    return el.tipo_classe === "civile";
                } ),
                civilian_labels = civilian_data.map( function ( el )
                {
                    return el.nome_classe;
                } ),
                civilian_colors = civilian_data.map( function ( el )
                {
                    return Utils.dynamicColor();
                } ),
                civilian_data   = civilian_data.map( function ( el )
                {
                    return parseInt( el.QTY, 10 );
                } );
            
            this.military_classes_pie = new Chart( this.military_classes_pie_ctx, {
                type   : 'pie',
                data   : {
                    datasets: [ { data: military_data, backgroundColor: military_colors, borderWidth: 0 } ],
                    labels  : military_labels
                },
                options: { responsive: true }
            } );
            
            this.civilian_classes_pie = new Chart( this.civilian_classes_pie_ctx, {
                type   : 'pie',
                data   : {
                    datasets: [ { data: civilian_data, backgroundColor: civilian_colors, borderWidth: 0 } ],
                    labels  : civilian_labels
                },
                options: { responsive: true }
            } );
        },
        
        recuperaStatisticheClassi: function recuperaStatisticheClassi()
        {
            Utils.requestData(
                Constants.API_GET_STATS_CLASSI,
                "GET",
                {},
                this.disegnaStatisticheClassi.bind( this ),
                "recuperaStatisticheClassi fallito"
            );
        },
        
        disegnaStatisticheAbilita: function disegnaStatisticheAbilita( data )
        {
            var data            = data.data,
                military_data   = data.filter( function ( el )
                {
                    return el.tipo_abilita === "militare";
                } ),
                military_labels = military_data.map( function ( el )
                {
                    return el.nome_abilita;
                } ),
                military_colors = military_data.map( function ( el )
                {
                    return Utils.dynamicColor();
                } ),
                military_data   = military_data.map( function ( el )
                {
                    return { y: parseInt( el.QTY, 10 ), x: el.nome_abilita };
                } ),
                civilian_data   = data.filter( function ( el )
                {
                    return el.tipo_abilita === "civile";
                } ),
                civilian_labels = civilian_data.map( function ( el )
                {
                    return el.nome_abilita;
                } ),
                civilian_colors = civilian_data.map( function ( el )
                {
                    return Utils.dynamicColor();
                } ),
                civilian_data   = civilian_data.map( function ( el )
                {
                    return { y: parseInt( el.QTY, 10 ), x: el.nome_abilita };
                } );
            
            this.military_abilities_bars = new Chart( this.military_abilities_bars_ctx, {
                type   : 'bar',
                data   : {
                    datasets: [ {
                        data           : military_data,
                        label          : "Quantità di PG con l'abilità",
                        backgroundColor: Utils.dynamicColor()
                    } ],
                    labels  : military_labels
                },
                options: {
                    responsive     : true,
                    scaleShowValues: true,
                    scales         : {
                        xAxes: [ {
                            ticks: {
                                autoSkip: false
                            }
                        } ]
                    }
                }
            } );
            
            this.civilian_abilities_bars = new Chart( this.civilian_abilities_bars_ctx, {
                type   : 'bar',
                data   : {
                    datasets: [ {
                        data           : civilian_data,
                        label          : "Quantità di PG con l'abilità",
                        backgroundColor: Utils.dynamicColor()
                    } ],
                    labels  : civilian_labels
                },
                options: {
                    responsive     : true,
                    scaleShowValues: true,
                    scales         : {
                        xAxes: [ {
                            ticks: {
                                autoSkip: false
                            }
                        } ]
                    }
                }
            } );
        },
        
        recuperaStatisticheAbilita: function recuperaStatisticheAbilita()
        {
            Utils.requestData(
                Constants.API_GET_STATS_ABILITA,
                "GET",
                {},
                this.disegnaStatisticheAbilita.bind( this ),
                "recuperaStatisticheAbilita fallito"
            );
        },
        
        disegnaStatisticheAbilitaProfessionaliPerPg: function disegnaStatisticheAbilitaProfessionaliPerPg( d )
        {
            let data = d.data,
                ability_data = data.map( function ( el )
                {
                    return {x: el.QTY+" da "+el.nome_classe, y: el.num_pgs};
                }),
                ability_labels = data.map( function ( el )
                {
                    return el.QTY+" da "+el.nome_classe;
                });
            
            this.civilian_abilities_qty_bars = new Chart( this.civilian_abilities_qty_pg_bars_ctx, {
                type   : 'bar',
                data   : {
                    datasets: [ {
                        data           : ability_data,
                        label          : "Quantità di PG con questo num di abilità",
                        backgroundColor: Utils.dynamicColor()
                    } ],
                    labels  : ability_labels
                },
                options: {
                    responsive     : true,
                    scaleShowValues: true,
                    scales         : {
                        xAxes: [ {
                            ticks     : {
                                autoSkip: false
                            },
                            display   : true,
                            scaleLabel: {
                                display    : true,
                                labelString: 'Qta di abilità per classe'
                            }
                        } ],
                        yAxes: [ {
                            ticks     : {
                                beginAtZero  : true,
                                fixedStepSize: 1,
                                autoSkip     : false
                            },
                            display   : true,
                            scaleLabel: {
                                display    : true,
                                labelString: 'Numero giocatori che possiedono quel numero di abilità'
                            }
                        } ]
                    }
                }
            } );
        },
        
        recuperaStatisticheAbilitaProfessionaliPerPg: function recuperaStatisticheAbilitaProfessionaliPerPg()
        {
            Utils.requestData(
                Constants.API_GET_STATS_ABILITA_PER_PROFESSIONE,
                "GET",
                {},
                this.disegnaStatisticheAbilitaProfessionaliPerPg.bind( this ),
                "recuperaStatisticheAbilitaProfessionaliPerPg fallito"
            );
        },
        
        disegnaStatisticheCrediti: function disegnaStatisticheCrediti( data )
        {
            var data      = data.data,
                labels    = data.map( function ( el )
                {
                    return el.data_transazione_str;
                } ),
                line_data = data.map( function ( el )
                {
                    return { x: el.data_transazione_str, y: el.credito_personaggio };
                } ),
                color     = Utils.dynamicColor();
            
            this.credits_line = new Chart( this.credits_line_ctx, {
                type   : 'line',
                data   : {
                    datasets: [ {
                        data           : line_data,
                        backgroundColor: color,
                        borderColor    : color,
                        label          : "Bit in gioco",
                        type           : 'line',
                        pointRadius    : 5,
                        fill           : false,
                        lineTension    : 0
                    } ],
                    labels  : labels
                },
                options: {
                    responsive     : true,
                    scaleShowValues: true,
                    scales         : {
                        xAxes: [ {
                            ticks: {
                                autoSkip: false
                            }
                        } ]
                    }
                }
            } );
        },
        
        recuperaStatisticheCrediti: function recuperaStatisticheCrediti()
        {
            Utils.requestData(
                Constants.API_GET_STATS_CREDITI,
                "GET",
                {},
                this.disegnaStatisticheCrediti.bind( this ),
                "recuperaStatisticheCrediti fallito"
            );
        },
        
        disegnaStatistichePG: function disegnaStatistichePG( data )
        {
            var data   = data.data,
                pies   = {
                    pf   : [],
                    ps   : [],
                    mente: []
                },
                labels = {
                    pf   : [],
                    ps   : [],
                    mente: []
                };
            
            for ( var d in data )
                for ( var e in data[ d ] )
                {
                    pies[ d ].push( parseInt( data[ d ][ e ], 10 ) );
                    labels[ d ].push( parseInt( e, 10 ) );
                }
            
            this.pf_pie = new Chart( this.pf_pie_ctx, {
                type   : 'bar',
                data   : {
                    datasets: [ {
                        data           : pies.pf,
                        backgroundColor: Utils.dynamicColor(),
                        borderWidth    : 0,
                        label          : "Numero Personaggi"
                    } ],
                    labels  : labels.pf
                },
                options: {
                    responsive: true,
                    scales    : {
                        yAxes: [ {
                            display   : true,
                            scaleLabel: {
                                display    : true,
                                labelString: 'Numero Personaggi'
                            }
                        } ],
                        xAxes: [ {
                            display   : true,
                            scaleLabel: {
                                display    : true,
                                labelString: 'Punti Ferita'
                            }
                        } ]
                    }
                }
            } );
            
            this.ps_pie = new Chart( this.ps_pie_ctx, {
                type   : 'bar',
                data   : {
                    datasets: [ {
                        data           : pies.ps,
                        backgroundColor: Utils.dynamicColor(),
                        borderWidth    : 0,
                        label          : "Numero Personaggi"
                    } ],
                    labels  : labels.ps
                },
                options: {
                    responsive: true,
                    scales    : {
                        yAxes: [ {
                            display   : true,
                            scaleLabel: {
                                display    : true,
                                labelString: 'Numero Personaggi'
                            }
                        } ],
                        xAxes: [ {
                            display   : true,
                            scaleLabel: {
                                display    : true,
                                labelString: 'Punti Shield'
                            }
                        } ]
                    }
                }
            } );
            
            this.mente_pie = new Chart( this.mente_pie_ctx, {
                type   : 'bar',
                data   : {
                    datasets: [ {
                        data           : pies.mente,
                        backgroundColor: Utils.dynamicColor(),
                        label          : "Numero Personaggi",
                        borderWidth    : 0
                    } ],
                    labels  : labels.mente
                },
                options: {
                    responsive: true,
                    scales    : {
                        yAxes: [ {
                            display   : true,
                            scaleLabel: {
                                display    : true,
                                labelString: 'Numero Personaggi'
                            }
                        } ],
                        xAxes: [ {
                            display   : true,
                            scaleLabel: {
                                display    : true,
                                labelString: 'Punti Difesa Mentale'
                            }
                        } ]
                    }
                }
            } );
        },
        
        recuperaStatistichePG: function recuperaStatistichePG()
        {
            Utils.requestData(
                Constants.API_GET_STATS_PG,
                "GET",
                {},
                this.disegnaStatistichePG.bind( this ),
                "recuperaStatistichePG fallito"
            );
        },
        
        disegnaStatistichePunteggi: function disegnaStatistichePunteggi( data )
        {
            // this.pc_tot_pie_ctx              = $( "#pc_tot_pie" )[ 0 ].getContext( "2d" );
            // this.px_tot_pie_ctx              = $( "#px_tot_pie" )[ 0 ].getContext( "2d" );
            // this.pc_spent_pie_ctx            = $( "#pc_spent_pie" )[ 0 ].getContext( "2d" );
            // this.px_spent_pie_ctx            = $( "#px_spent_pie" )[ 0 ].getContext( "2d" );
            // this.pc_free_pie_ctx             = $( "#pc_free_pie" )[ 0 ].getContext( "2d" );
            // this.px_free_pie_ctx             = $( "#px_free_pie" )[ 0 ].getContext( "2d" );
        },
        
        recuperaStatistichePunteggi: function recuperaStatistichePunteggi()
        {
            Utils.requestData(
                Constants.API_GET_STATS_PUNTEGGI,
                "GET",
                {},
                this.disegnaStatistichePunteggi.bind( this ),
                "recuperaStatistichePunteggi fallito"
            );
        },
        
        disegnaStatisticheQtaRavShop: function disegnaStatisticheQtaRavShop( data )
        {
            var data       = data.data,
                bar_labels = data.map( function ( el )
                {
                    return el.data_transazione_str;
                } ),
                bar_data   = data.map( function ( el )
                {
                    return el.num_transazioni;
                } );
            
            this.ravshop_transaction_bar = new Chart( this.ravshop_qty_bar_ctx, {
                type   : 'bar',
                data   : {
                    datasets: [ { data: bar_data, backgroundColor: Utils.dynamicColor(), label: "Numero Acquisti" } ],
                    labels  : bar_labels
                },
                options: { responsive: true }
            } );
        },
        
        recuperaStatisticheQtaRavShop: function recuperaStatisticheQtaRavShop()
        {
            Utils.requestData(
                Constants.API_GET_STATS_RAVSHOP,
                "GET",
                {},
                this.disegnaStatisticheQtaRavShop.bind( this ),
                "recuperaStatisticheQtaRavShop fallito"
            );
        },
        
        disegnaStatisticheAcquistiRavShop: function disegnaStatisticheAcquistiRavShop( data )
        {
            var data       = data.data,
                bar_labels = data.map( function ( el )
                {
                    return el.nome_componente;
                } ),
                bar_data   = data.map( function ( el )
                {
                    return el.num_acquisti;
                } );
            
            this.ravshop_transaction_bar = new Chart( this.ravshop_popularity_bar_ctx, {
                type   : 'bar',
                data   : {
                    datasets: [ { data: bar_data, backgroundColor: Utils.dynamicColor(), label: "Numero Acquisti" } ],
                    labels  : bar_labels
                },
                options: {
                    responsive     : true,
                    scaleShowValues: true,
                    scales         : {
                        xAxes: [ {
                            ticks: {
                                autoSkip: false
                            }
                        } ]
                    }
                }
            } );
        },
        
        recuperaStatisticheAcquistiRavShop: function recuperaStatisticheAcquistiRavShop()
        {
            Utils.requestData(
                Constants.API_GET_STATS_ACQUISTI_RAVSHOP,
                "GET",
                {},
                this.disegnaStatisticheAcquistiRavShop.bind( this ),
                "recuperaStatisticheAcquistiRavShop fallito"
            );
        },
        
        disegnaStatisticheArmiStampate: function disegnaStatisticheArmiStampate( data )
        {
            var data       = data.data,
                bar_labels = data.map( function ( el )
                {
                    return el.dichiarazione;
                } ),
                bar_data   = data.map( function ( el )
                {
                    return el.QTA;
                } );
            
            this.crafted_bar = new Chart( this.crafted_bar_ctx, {
                type   : 'bar',
                data   : {
                    datasets: [ { data: bar_data, backgroundColor: Utils.dynamicColor(), label: "Quantità Craftate" } ],
                    labels  : bar_labels
                },
                options: {
                    responsive     : true,
                    scaleShowValues: true,
                    scales         : {
                        xAxes: [ {
                            ticks     : {
                                autoSkip: false
                            },
                            display   : true,
                            scaleLabel: {
                                display    : true,
                                labelString: 'Tipo di danno'
                            }
                        } ],
                        yAxes: [ {
                            ticks     : {
                                beginAtZero  : true,
                                fixedStepSize: 1,
                                autoSkip     : false
                            },
                            display   : true,
                            scaleLabel: {
                                display    : true,
                                labelString: 'Quantità craftate'
                            }
                        } ]
                    }
                }
            } );
        },
        
        recuperaStatisticheArmiStampate: function recuperaStatisticheArmiStampate()
        {
            Utils.requestData(
                Constants.API_GET_STATS_ARMI,
                "GET",
                {},
                this.disegnaStatisticheArmiStampate.bind( this ),
                "recuperaStatisticheArmiStampate fallito"
            );
        },
        
        loadCharts: function loadCharts()
        {
            this.recuperaStatisticheClassi();
            this.recuperaStatisticheAbilita();
            this.recuperaStatisticheAbilitaProfessionaliPerPg();
            this.recuperaStatisticheCrediti();
            this.recuperaStatistichePG();
            this.recuperaStatistichePunteggi();
            this.recuperaStatisticheQtaRavShop();
            this.recuperaStatisticheAcquistiRavShop();
            this.recuperaStatisticheArmiStampate();
        },
        
        getDOMElements: function getDOMElements()
        {
            this.military_classes_pie_ctx           = $( "#military_classes_pie" )[ 0 ].getContext( "2d" );
            this.military_abilities_bars_ctx        = $( "#military_abilities_bars" )[ 0 ].getContext( "2d" );
            this.civilian_classes_pie_ctx           = $( "#civilian_classes_pie" )[ 0 ].getContext( "2d" );
            this.civilian_abilities_bars_ctx        = $( "#civilian_abilities_bars" )[ 0 ].getContext( "2d" );
            this.civilian_abilities_qty_pg_bars_ctx = $( "#civilian_abilities_qty_pg_bars" )[ 0 ].getContext( "2d" );
            this.credits_line_ctx                   = $( "#credits_line" )[ 0 ].getContext( "2d" );
            this.pf_pie_ctx                         = $( "#pf_pie" )[ 0 ].getContext( "2d" );
            this.ps_pie_ctx                         = $( "#ps_pie" )[ 0 ].getContext( "2d" );
            this.mente_pie_ctx                      = $( "#mente_pie" )[ 0 ].getContext( "2d" );
            // this.pc_tot_pie_ctx              = $( "#pc_tot_pie" )[ 0 ].getContext( "2d" );
            // this.px_tot_pie_ctx              = $( "#px_tot_pie" )[ 0 ].getContext( "2d" );
            // this.pc_spent_pie_ctx            = $( "#pc_spent_pie" )[ 0 ].getContext( "2d" );
            // this.px_spent_pie_ctx            = $( "#px_spent_pie" )[ 0 ].getContext( "2d" );
            // this.pc_free_pie_ctx             = $( "#pc_free_pie" )[ 0 ].getContext( "2d" );
            // this.px_free_pie_ctx             = $( "#px_free_pie" )[ 0 ].getContext( "2d" );
            this.ravshop_qty_bar_ctx        = $( "#ravshop_qty_bar" )[ 0 ].getContext( "2d" );
            this.ravshop_popularity_bar_ctx = $( "#ravshop_popularity_bar" )[ 0 ].getContext( "2d" );
            this.crafted_bar_ctx            = $( "#crafted_bar" )[ 0 ].getContext( "2d" );
        },
        
        init: function init()
        {
            Chart.defaults.global.defaultFontColor = '#18b3b2';
            this.getDOMElements();
            this.loadCharts();
        }
    };
}();

$( document ).ready( StatisticsManager.init.bind( StatisticsManager ) );
