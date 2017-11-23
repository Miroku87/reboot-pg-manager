function Constants(){}

Constants.API_URL           = "http://localhost/reboot-live-api/api.php";
Constants.SITE_URL          = "http://localhost:9000";

Constants.API_POST_REGISTRA = Constants.API_URL + "/usersmanager/registra";
Constants.API_POST_LOGIN    = Constants.API_URL + "/usersmanager/login";
Constants.API_POST_CREAPG   = Constants.API_URL + "/charactersmanager/creapg";

Constants.API_GET_LOGOUT    = Constants.API_URL + "/usersmanager/logout";
Constants.API_GET_INFO      = Constants.API_URL + "/charactersmanager/recuperainfoclassi";
Constants.API_GET_ALL_PGS   = Constants.API_URL + "/charactersmanager/mostratuttipersonaggi";
Constants.API_GET_MY_PGS    = Constants.API_URL + "/charactersmanager/mostramieipersonaggi";

Constants.LOGIN_PAGE        = Constants.SITE_URL + "/";
Constants.MAIN_PAGE         = Constants.SITE_URL + "/main.html";