var Constants = {};

Constants.API_URL            = "http://localhost/reboot-live-api/api.php";
Constants.SITE_URL           = "http://localhost:9000";

Constants.API_POST_REGISTRA  = Constants.API_URL + "/usersmanager/registra";
Constants.API_POST_LOGIN     = Constants.API_URL + "/usersmanager/login";
Constants.API_POST_CREAPG    = Constants.API_URL + "/charactersmanager/creapg";
Constants.API_POST_ACQUISTA  = Constants.API_URL + "/charactersmanager/acquista";
Constants.API_POST_EDIT_PG   = Constants.API_URL + "/charactersmanager/modificapg";

Constants.API_GET_LOGOUT     = Constants.API_URL + "/usersmanager/logout";
Constants.API_GET_ACESS      = Constants.API_URL + "/usersmanager/controllaaccesso";
Constants.API_GET_PG_LOGIN   = Constants.API_URL + "/charactersmanager/loginpg";
Constants.API_GET_INFO       = Constants.API_URL + "/charactersmanager/recuperainfoclassi";
Constants.API_GET_PGS        = Constants.API_URL + "/charactersmanager/mostrapersonaggi";
Constants.API_GET_STORICO_PG = Constants.API_URL + "/charactersmanager/recuperastorico";

Constants.LOGIN_PAGE         = Constants.SITE_URL + "/";
Constants.MAIN_PAGE          = Constants.SITE_URL + "/main.html";
Constants.PG_PAGE            = Constants.SITE_URL + "/scheda_pg.html";

Constants.PX_TOT             = 100;
Constants.PC_TOT             = 18;

Constants.COSTI_PROFESSIONI             = [0,20,40,60,80,100,120];

Constants.PREREQUISITO_TUTTE_ABILITA    = -1;
Constants.PREREQUISITO_F_TERRA_T_SCELTO = -2; //id abilita 134 e 129
Constants.PREREQUISITO_5_SUPPORTO_BASE  = -3;
Constants.PREREQUISITO_3_CONTROLLER     = -4;
Constants.PREREQUISITO_4_SPORTIVO       = -5;

Constants.ID_ABILITA_F_TERRA            = 134;
Constants.ID_ABILITA_T_SCELTO           = 129;
Constants.ID_ABILITA_IDOLO              = 12;

Constants.ID_CLASSE_SPORTIVO            = 1;
Constants.ID_CLASSE_SUPPORTO_BASE       = 12;