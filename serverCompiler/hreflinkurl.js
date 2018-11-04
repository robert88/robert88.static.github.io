
    /**
     * url params可以识别中文、去掉两边空格、数组
     * */
    function getUrlSearch(url){
        var searchObj = {};
        if(~url.indexOf("?")){
            var search = url.split("#")[0].split("?")[1];
            if(search){
                search.replace(/([^&=]+)=([^&]*)/g,function(m,m1,m2){
                    if(searchObj[m1]){
                        searchObj[m1] = $.type(searchObj[m1])=="array"?searchObj[m1]:[searchObj[m1]]
                        searchObj[m1].push($.trim(decodeURIComponent($.trim(m2)) ))
                    }else{
                        searchObj[m1] =$.trim( decodeURIComponent($.trim(m2)))
                    }
                })
            }
        }
        return  searchObj
    }
    /**
     * 功能：跟踪代码传递
     */
    $('a').each(function() {
        var href = $(this).attr('href');
        var notFillUrl = $(this).data("come-from-no-fill");
        var selfFirst =  $(this).data("self-first");    //为falseurl params优先时候：，为true时候href优先
        if(notFillUrl){
            return;
        }
        //url params优先
        if ( href != 'javascript:;' && href != 'javascript:void(0)' && href != undefined && href != '#flash_player' && href) {
            var params = getUrlSearch(window.location.href);
            var hrefParams = getUrlSearch(href);
            for(var key in params){
                if(selfFirst){
                    if(!hrefParams[key]){
                        hrefParams[key] = params[key];
                    }
                }else{
                    hrefParams[key] = params[key];
                }
            }
            var serialStr = $.param(hrefParams,true);

            var url = href.split("#")[0].split("?")[0];
            var hash = href.split("#")[1]||""

            $(this).attr('href',url + (serialStr?("?"+serialStr):"") + (hash?("#"+hash):""));

        };
    })
