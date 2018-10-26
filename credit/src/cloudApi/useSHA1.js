import SHA1 from "sha1"
//http request  X-APICloud-AppId
export const appId = "A6095986776527";
export const appKey = "DE903121-3DAD-A405-3257-697D57912273";
// http request X-APICloud-AppKey
export function getRequestHeaderAppKey(){
	var now = Date.now();
// var appKey = SHA1（应用ID + 'UZ' + 应用KEY +'UZ' + 当前时间毫秒数）+ '.' +当前时间毫秒数
	return SHA1(`${appId}UZ${appKey}UZ${now}).${now}`;

}

