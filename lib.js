
        /***
         *
         * 通过url设置表单数据
         */
        function insertInput(key,value,$form){
                var i;
                if( $.type( value ) =="array"){
                    for(var i=0;i<value.length;i++){
                        insertInput(key,value[i], $form)
                    }
                }else if($.type( value ) =="object"){
                    for(var i in value){
                        insertInput(key+"."+i,value[i], $form)
                    }
                }else{
                     $form.append("<input type='hidden' name='"+key+"' value='"+(value||"")+"'>")
                }
        }
    /**
   * 根据json创建一个form表单
    */
    function submitByForm(id,params,action) {

        var $form = $("#"+id);
        if(!$form.length|| $form.data("lock")){
            $("body").append("<form id='"+id+"' method='post' action='"+action+"' style='display: none' ></form>")
        }
        $form = $("#"+id).html("");
        if(!action|| $form.data("lock")){
            return
        }
        $form.attr("action",action);

        for(var key in params){
            insertInput(key,params[key], $form)
        }
        $form.data("lock",true)
        $form[0].submit()
        $form.data("lock",false)
    }
        
            /*
    * 可以识别中文、去掉两边空格、数组
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

/*
*瀑布流算法
*/

 ;(function(){
            function refollow() {
                var $li = [];
                $(".news-wonderful-inf .newtext").each(function (idx) {
                    if($(this).find(".video").length==0){
                        $(this).addClass("noPic")
                    }else{
                        $(this).removeClass("noPic")
                    }
                    var time = $(this).find(".text>span").html().replace(/\s+/g,"");
                    var date = new Date(time);
                    var dataTime = 0;
                    if(date instanceof Date){
                        dataTime = date.getTime();
                    }
                    $li.push({time:dataTime,dom:this.outerHTML});
                });
                // 从近到远
                $li.sort(function (a,b) {return a.time>b.time?-1:1});

                var $ul = $(".news-wonderful-inf .con>ul").each(function () {
                    $(this).html("");
                });
                var curCol = 0 ;
                /*按顺序插入到页面里面*/
                function appendByCurCol(val){
                    $ul.eq(curCol).append(val.dom);
                    curCol++;
                    if(curCol>2){
                        curCol=0;
                    }
                }
                $.each($li,function (idx,val) {

                    if($(window).width()>750){
                        if($ul.eq(curCol).find("li").length==0){
                            appendByCurCol(val)
                        }else{
                            var minTop=Infinity;
                            var minIndex = 0
                            for(var i=0;i<3;i++){
                                var len =  $ul.eq(i).find("li").length;
                                var $lastLi = $ul.eq(i).find("li").eq(len-1);
                                var top = $lastLi.offset().top;
                                if(minTop>top){
                                    minTop = top;
                                    minIndex = i;
                                }
                            }
                            $ul.eq(minIndex).append(val.dom);
                        }
                    }else{
                        $ul.eq(curCol).append(val.dom);
                    }
                })
            }
            refollow();
            var ismobile;
            var perStatus;
            if($(this).width()<=750){
                ismobile = true;
            }else{
                ismobile = false
            }
            perStatus = ismobile;
            $(window).on("resize",function () {
                if($(this).width()<=750){
                    ismobile = true;
                }else{
                    ismobile = false
                }
                if(perStatus!=ismobile){
                    refollow();
                    perStatus = ismobile;
                }
            })
        })()

/*将文字按句子分段*/
  var textCon = $('.ict-article .con .left .text').text();

    // 去除空格
    textCon = $.trim( textCon.replace(/\s+/g, " ") );

    // 根据句子分段
    function chunk(str, size) {
        if(!size||size<1){
            return [];
        }
        var ret=[];
        var orgArr = str.split(/([,;!，。；！])/);
        var arr = [];
        for(var i=0;i<orgArr.length;i++){
            if(orgArr[i]!=null){
                //合并标点符号
                if(/^([,;!，。；！])$/.test(orgArr[i])){
                    arr[arr.length-1] += orgArr[i];
                }else{
                    //区分英文标点还是数字小数点
                    var enOrgArr = orgArr[i].split(/(\.\D)/);
                    var enArr = [];
                    for(var j=0;j<enOrgArr.length;j++){
                        if(enOrgArr[j]){
                            if(/(\.\D)/.test(enOrgArr[j])){
                                enArr[enArr.length-1] += ".";
                                enOrgArr[j+1] = enOrgArr[j].replace(".","")+enOrgArr[j+1];
                            }else{
                                enArr.push(enOrgArr[j]);
                            }
                        }
                    }
                    arr = arr.concat(enArr);
                }
            }


        }
        var tempArr=[];
        var len = 0;

        for(var i=0;i<arr.length;i++){

            if(len>size+1){
                ret.push(tempArr.join(""));
                tempArr = [];
                len = 0;
            }
            //加上标点
            tempArr.push(arr[i]);
            len += arr[i].length;
        }
        //最后的代码
        if(tempArr.length){
            ret.push(tempArr.join(""));
        }

        return ret;
    }

    var partStr = chunk(textCon,80);
