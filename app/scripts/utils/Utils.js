﻿var Utils =
    {
        isDeviceMobile: function ()
        {
            // device detection
            if ( /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test( navigator.userAgent )
                || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test( navigator.userAgent.substr( 0, 4 ) ) )
                return true;

            return false;
        },

        getParameterByName : function (name, url)
        {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        },

        sortChildrenByAttribute: function ( parent, childSelector, attribute )
        {
            var items = parent.children( childSelector ).sort( function ( a, b )
            {
                var vA = $( a ).attr( attribute );
                var vB = $( b ).attr( attribute );
                return ( vA < vB ) ? -1 : ( vA > vB ) ? 1 : 0;
            } );

            parent.append( items );
        },

        /**
         *
         * @param {Array} arr
         * @param {string} key
         */
        sortArrayByAttribute: function ( arr, key )
        {
            arr.sort(function ( a, b )
            {
                if( typeof a === "string" || typeof b === "string" )
                    return ( a[key]+"" ).localeCompare( b[key]+"" );

                return a[key] - b[key];
            });
        },

        showError: function(errorText)
        {
            if($("#errorDialog").length > 0)
            {
                $('.modal').modal('hide');
                $("#errorDialog").find('#errorMsg').html(errorText);
                $("#errorDialog").modal({
                    backdrop: 'static'
                });
            }
            else
                throw new Error("No error modal found.");
        },

        showConfirm: function(question,noPasswordError,onConfirm)
        {
            if($("#confirmWithPassword").length > 0)
            {
                $('.modal').modal('hide');
                $("#confirmWithPassword").find("#confirmText").html(question);
                $("#confirmWithPassword").find("input[name='confirmpassword']").unbind("keypress");
                $("#confirmWithPassword").find("#confirmButton").unbind("click");
                $("#confirmWithPassword").find("input[name='confirmpassword']").val("");

                $("#confirmWithPassword").find("#confirmButton").click(function (e)
                {
                    if( $("#confirmWithPassword").find("input[name='confirmpassword']").val() == "" ||
                        /^\s+$/.test($("#confirmWithPassword").find("input[name='confirmpassword']").val()))
                    {
                        Utils.showError(noPasswordError);
                        return; //function will not keep on executing
                    }

                    $.post(CHECK_PASSWORD,
                        {
                            confirmpassword: $("#confirmWithPassword").find("input[name='confirmpassword']").val()
                        }, function (data)
                        {
                            var res = JSON.parse(data);
                            if(res.type == "success")
                            {
                                onConfirm();
                            }
                            else if (res.type == "error")
                            {
                                Utils.showError(res.text);
                            }
                        });
                });

                $("#confirmWithPassword").find("input[name='confirmpassword']").keypress(function(event) {
                    if (event.which == 13) {
                        event.preventDefault();
                        $("#confirmWithPassword").find("#confirmButton").click();
                    }
                });

                $("#confirmWithPassword").modal({
                    backdrop: "static"
                });

                $("#confirmWithPassword").find("input[name='confirmpassword']").focus();
            }
            else
                throw new Error("No confirm modal found.");
        },

        setCookie: function (cname, cvalue, exdays)
        {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires;
        },

        deleteCookie: function (cname)
        {
            document.cookie = cname + "=" + "; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        },

        getCookie: function (cname)
        {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++)
            {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
            }
            return "";
        },

        isLink: function (str)
        {
            var urlPatt = new RegExp(
                "^" +
                    // protocol identifier
                "(?:(?:https?|ftp)://)" +
                    // user:pass authentication
                "(?:\\S+(?::\\S*)?@)?" +
                "(?:" +
                    // IP address exclusion
                    // private & local networks
                "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
                "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
                "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
                    // IP address dotted notation octets
                    // excludes loopback network 0.0.0.0
                    // excludes reserved space >= 224.0.0.0
                    // excludes network & broacast addresses
                    // (first & last IP address of each class)
                "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
                "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
                "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
                "|" +
                    // host name
                "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
                    // domain name
                "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
                    // TLD identifier
                "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
                ")" +
                    // port number
                "(?::\\d{2,5})?" +
                    // resource path
                "(?:/\\S*)?" +
                "$", "i");

            return urlPatt.test(str);
        },

        controllaAccessoPagina: function( section )
        {
            $.ajax(
                Constants.API_GET_ACESS,
                {
                    method: "POST",
                    data: "section=" + section + "&" + window.location.search.substr(1),
                    cache: false,
                    //contentType: false,
                    //processData: false,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function( data )
                    {
                        if ( data.status === "error" )
                        {
                            $("#errorDialog").on("hidden.bs.modal", function ()
                            {
                                window.location.href = Constants.LOGIN_PAGE;
                            });
                            Utils.showError( data.message );
                        }
                    }.bind(this),
                    error: function ( jqXHR, textStatus, errorThrown )
                    {
                        Utils.showError( textStatus+"<br>"+errorThrown );
                    }
                }
            );
        },

        controllaCF: function( cf )
        {
            var pattern = /^[a-zA-Z]{6}[0-9]{2}[a-zA-Z][0-9]{2}[a-zA-Z][0-9]{3}[a-zA-Z]$/;

            return pattern.test( cf );
        },

        controllaMail: function( mail )
        {
            var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            return pattern.test( mail );
        },

        soloSpazi: function( stringa )
        {
            var pattern = /^\s+$/;

            return pattern.test( stringa );
        },

        getJQueryObj: function( obj )
        {
            var jobj = {};

            if( typeof obj === "string" )
                jobj = $( "#" + obj );
            else if ( obj instanceof $ )
                jobj = obj;
            else if ( obj instanceof HTMLElement )
                jobj = $( obj );

            return jobj;
        },

        trasformaInArray: function ( obj )
        {
            return Array.prototype.slice.call( obj );
        }
    };