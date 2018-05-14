var Constants = {};

Constants.API_URL                        = "http://localhost/reboot-live-api/src/api.php";
Constants.SITE_URL                       = "http://localhost:9000";

Constants.API_POST_REGISTRA              = Constants.API_URL + "/usersmanager/registra";
Constants.API_POST_RECUPERO_PWD          = Constants.API_URL + "/usersmanager/recuperapassword";
Constants.API_POST_LOGIN                 = Constants.API_URL + "/usersmanager/login";
Constants.API_POST_MOD_GIOCATORE         = Constants.API_URL + "/usersmanager/modificautente";
Constants.API_POST_MOD_PWD               = Constants.API_URL + "/usersmanager/modificapassword";
Constants.API_POST_CREAPG                = Constants.API_URL + "/charactersmanager/creapg";
Constants.API_POST_ACQUISTA              = Constants.API_URL + "/charactersmanager/acquista";
Constants.API_POST_EDIT_PG               = Constants.API_URL + "/charactersmanager/modificapg";
Constants.API_POST_EDIT_ETA_PG           = Constants.API_URL + "/charactersmanager/modificaetapg";
Constants.API_POST_EDIT_MOLTI_PG         = Constants.API_URL + "/charactersmanager/modificamoltipg";
Constants.API_POST_MESSAGGIO             = Constants.API_URL + "/messagingmanager/inviamessaggio";
Constants.API_POST_EVENTO                = Constants.API_URL + "/eventsmanager/creaevento";
Constants.API_POST_MOD_EVENTO            = Constants.API_URL + "/eventsmanager/modificaevento";
Constants.API_POST_ISCRIZIONE            = Constants.API_URL + "/eventsmanager/iscrivipg";
Constants.API_POST_DISISCRIZIONE         = Constants.API_URL + "/eventsmanager/disiscrivipg";
Constants.API_POST_PUBBLICA_EVENTO       = Constants.API_URL + "/eventsmanager/pubblicaevento";
Constants.API_POST_RITIRA_EVENTO         = Constants.API_URL + "/eventsmanager/ritiraevento";
Constants.API_POST_DEL_EVENTO            = Constants.API_URL + "/eventsmanager/eliminaevento";
Constants.API_POST_EDIT_ISCRIZIONE       = Constants.API_URL + "/eventsmanager/modificaiscrizionepg";
Constants.API_POST_PUNTI_EVENTO          = Constants.API_URL + "/eventsmanager/impostapuntiassegnatievento";
Constants.API_POST_CREA_RUOLO            = Constants.API_URL + "/grantsmanager/crearuolo";
Constants.API_POST_DEL_RUOLO             = Constants.API_URL + "/grantsmanager/eliminaruolo";
Constants.API_POST_ASSOCIA_PERMESSI      = Constants.API_URL + "/grantsmanager/associapermessi";
Constants.API_POST_CREA_ARTICOLO         = Constants.API_URL + "/newsmanager/creanotizia";
Constants.API_POST_EDIT_ARTICOLO         = Constants.API_URL + "/newsmanager/modificanotizia";
Constants.API_POST_PUBBLICA_ARTICOLO     = Constants.API_URL + "/newsmanager/pubblicanotizia";
Constants.API_POST_RITIRA_ARTICOLO       = Constants.API_URL + "/newsmanager/ritiranotizia";
Constants.API_POST_CRAFTING_PROGRAMMA    = Constants.API_URL + "/craftingmanager/inserisciricettanetrunner";
Constants.API_POST_CRAFTING_TECNICO      = Constants.API_URL + "/craftingmanager/inserisciricettatecnico";
Constants.API_POST_CRAFTING_CHIMICO      = Constants.API_URL + "/craftingmanager/inserisciricettamedico";
Constants.API_EDIT_RICETTA               = Constants.API_URL + "/craftingmanager/modificaricetta";
Constants.API_COMPRA_COMPONENTI          = Constants.API_URL + "/transactionmanager/compracomponenti";

Constants.API_GET_LOGOUT                 = Constants.API_URL + "/usersmanager/logout";
Constants.API_GET_ACESS                  = Constants.API_URL + "/usersmanager/controllaaccesso";
Constants.API_CHECK_PWD                  = Constants.API_URL + "/usersmanager/controllapwd";
Constants.API_GET_PLAYERS                = Constants.API_URL + "/usersmanager/recuperalistagiocatori";
Constants.API_GET_NOTE_GIOCATORE         = Constants.API_URL + "/usersmanager/recuperanoteutente";
Constants.API_GET_PGS_PROPRI             = Constants.API_URL + "/charactersmanager/recuperapropripg";
Constants.API_GET_PG_LOGIN               = Constants.API_URL + "/charactersmanager/loginpg";
Constants.API_GET_INFO                   = Constants.API_URL + "/charactersmanager/recuperainfoclassi";
Constants.API_GET_OPZIONI_ABILITA        = Constants.API_URL + "/charactersmanager/recuperaopzioniabilita";
Constants.API_GET_PGS                    = Constants.API_URL + "/charactersmanager/mostrapersonaggi";
Constants.API_GET_PGS_CON_ID             = Constants.API_URL + "/charactersmanager/mostrapersonaggiconid";
Constants.API_GET_STORICO_PG             = Constants.API_URL + "/charactersmanager/recuperastorico";
Constants.API_GET_NOTE_CARTELLINO_PG     = Constants.API_URL + "/charactersmanager/recuperaNoteCartellino";
Constants.API_GET_MESSAGGI               = Constants.API_URL + "/messagingmanager/recuperamessaggi";
Constants.API_GET_MESSAGGIO_SINGOLO      = Constants.API_URL + "/messagingmanager/recuperamessaggiosingolo";
Constants.API_GET_DESTINATARI_FG         = Constants.API_URL + "/messagingmanager/recuperadestinatarifg";
Constants.API_GET_DESTINATARI_IG         = Constants.API_URL + "/messagingmanager/recuperadestinatariig";
Constants.API_GET_MESSAGGI_NUOVI         = Constants.API_URL + "/messagingmanager/recuperanonletti";
Constants.API_GET_EVENTO                 = Constants.API_URL + "/eventsmanager/recuperaevento";
Constants.API_GET_LISTA_EVENTI           = Constants.API_URL + "/eventsmanager/recuperalistaeventi";
Constants.API_GET_INFO_ISCRITTI_AVANZATE = Constants.API_URL + "/eventsmanager/recuperalistaiscrittiavanzato";
Constants.API_GET_INFO_ISCRITTI_BASE     = Constants.API_URL + "/eventsmanager/recuperalistaiscrittibase";
Constants.API_GET_PARTECIPANTI_EVENTO    = Constants.API_URL + "/eventsmanager/recuperalistapartecipanti";
Constants.API_GET_NOTE_ISCRITTO          = Constants.API_URL + "/eventsmanager/recuperanotepgiscritto";
Constants.API_GET_RUOLI                  = Constants.API_URL + "/grantsmanager/recuperaruoli";
Constants.API_GET_PERMESSI               = Constants.API_URL + "/grantsmanager/recuperalistapermessi";
Constants.API_GET_PERMESSI_DEI_RUOLI     = Constants.API_URL + "/grantsmanager/recuperapermessideiruoli";
Constants.API_GET_ARTICOLI_PUBBLICATI    = Constants.API_URL + "/newsmanager/recuperanotiziepubbliche";
Constants.API_GET_TUTTI_ARTICOLI         = Constants.API_URL + "/newsmanager/recuperanotizie";
Constants.API_GET_RICETTE                = Constants.API_URL + "/craftingmanager/recuperaricette";
Constants.API_GET_RICETTE_CON_ID         = Constants.API_URL + "/craftingmanager/recuperaricetteconid";
Constants.API_GET_COMPONENTI_BASE        = Constants.API_URL + "/craftingmanager/recuperacomponentibase";
Constants.API_GET_COMPONENTI_CON_ID      = Constants.API_URL + "/craftingmanager/recuperacomponenticonid";

Constants.API_DEL_GIOCATORE              = Constants.API_URL + "/usersmanager/eliminagiocatore";
Constants.API_DEL_CLASSE_PG              = Constants.API_URL + "/charactersmanager/rimuoviclassepg";
Constants.API_DEL_ABILITA_PG             = Constants.API_URL + "/charactersmanager/rimuoviabilitapg";
Constants.API_DEL_PERSONAGGIO            = Constants.API_URL + "/charactersmanager/eliminapg";

Constants.LOGIN_PAGE                     = Constants.SITE_URL + "/";
Constants.MAIN_PAGE                      = Constants.SITE_URL + "/main.html";
Constants.PG_PAGE                        = Constants.SITE_URL + "/scheda_pg.html";
Constants.ABILITY_SHOP_PAGE              = Constants.SITE_URL + "/negozio_abilita.html";
Constants.STAMPA_CARTELLINI_PAGE         = Constants.SITE_URL + "/stampa_cartellini.html";
Constants.STAMPA_ISCRITTI_PAGE           = Constants.SITE_URL + "/stampa_tabella_iscritti.html";
Constants.STAMPA_RICETTE                 = Constants.SITE_URL + "/stampa_ricetta.html";
Constants.CREAPG_PAGE                    = Constants.SITE_URL + "/crea_pg.html";
Constants.EVENTI_PAGE                    = Constants.SITE_URL + "/eventi.html";
Constants.CREA_EVENTO_PAGE               = Constants.SITE_URL + "/crea_evento.html";
Constants.MESSAGGI_PAGE                  = Constants.SITE_URL + "/messaggi.html";
Constants.PROFILO_PAGE                   = Constants.SITE_URL + "/profilo.html";

Constants.PX_TOT                         = 100;
Constants.PC_TOT                         = 4;
Constants.ANNO_PRIMO_LIVE                = 271;
Constants.ANNO_INIZIO_OLOCAUSTO          = 239;
Constants.ANNO_FINE_OLOCAUSTO            = 244;
Constants.SCONTO_MERCATO                 = 5;
Constants.QTA_PER_SCONTO_MERCATO         = 6;
Constants.CARTELLINI_PER_PAG             = 6;

Constants.COSTI_PROFESSIONI              = [0,20,40,60,80,100,120];

Constants.PREREQUISITO_TUTTE_ABILITA     = -1;
Constants.PREREQUISITO_F_TERRA_T_SCELTO  = -2;
Constants.PREREQUISITO_5_SUPPORTO_BASE   = -3;
Constants.PREREQUISITO_3_GUASTATOR_BASE  = -4;
Constants.PREREQUISITO_4_SPORTIVO        = -5;
Constants.PREREQUISITO_3_ASSALTATA_BASE  = -6;
Constants.PREREQUISITO_3_GUASTATO_AVAN   = -7;
Constants.PREREQUISITO_3_ASSALTATA_AVAN  = -8;

Constants.ID_ABILITA_F_TERRA             = 135;
Constants.ID_ABILITA_T_SCELTO            = 130;
Constants.ID_ABILITA_IDOLO               = 12;
Constants.ID_ABILITA_ARMA_SEL            = 140;

Constants.ID_CLASSE_SPORTIVO             = 1;
Constants.ID_CLASSE_SUPPORTO_BASE        = 12;
Constants.ID_CLASSE_ASSALTATORE_BASE     = 10;
Constants.ID_CLASSE_ASSALTATORE_AVANZATO = 11;
Constants.ID_CLASSE_GUASTATORE_BASE      = 14;
Constants.ID_CLASSE_GUASTATORE_AVANZATO  = 15;

Constants.TIPO_GRANT_PG_PROPRIO          = "_proprio";
Constants.TIPO_GRANT_PG_ALTRI            = "_altri";
Constants.RUOLO_ADMIN                    = "admin";
Constants.INTERVALLO_CONTROLLO_MEX       = 60000;
Constants.ID_RICETTA_PAG                 = 4;

Constants.DATA_TABLE_LANGUAGE            = {
                                            "decimal":        "",
                                            "emptyTable":     "Nessun dato disponibile",
                                            "info":           "Da _START_ a _END_ di _TOTAL_ risultati visualizzati",
                                            "infoEmpty":      "Da 0 a 0 di 0 visualizzati",
                                            "infoFiltered":   "(filtrati da un massimo di _MAX_ risultati)",
                                            "infoPostFix":    "",
                                            "thousands":      ".",
                                            "lengthMenu":     "_MENU_",
                                            "loadingRecords": "Carico...",
                                            "processing":     "Elaboro...",
                                            "search":         "Cerca:",
                                            "zeroRecords":    "Nessuna corrispondenza trovata",
                                            "paginate": {
                                                "first":      "Primo",
                                                "last":       "Ultimo",
                                                "next":       "Prossimo",
                                                "previous":   "Precedente"
                                            },
                                            "aria": {
                                                "sortAscending":  ": clicca per ordinare la colonna in ordine crescente",
                                                "sortDescending": ": clicca per ordinare la colonna in ordine decrescente"
                                            }
                                        };
