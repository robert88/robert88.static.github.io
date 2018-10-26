import {appId,getRequestHeaderAppKey} from "@/default/js/cloudApi/useSHA1"
import axios from "axios";
import inherit from "inherit";
export const ajax = new Proxy(axios,{
	get:function(target,prop,receiver){
		if(prop=="all" || prop=="spread"){
			return  target[prop];
		}
		return function(url,opts){
			if(typeof url=="object"){
				opts = url
			}

			opts = inherit({ headers: {'X-APICloud-AppId': appId,"X-APICloud-AppKey":getRequestHeaderAppKey}},opts);

			return target[prop](url,opts);
		}
});

export router = {
	"/mcm/api/user/login":function(){}
	"/mcm/api/user/":function(){}
}
