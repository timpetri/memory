window.onload = function(){
	chrome.runtime.sendMessage({
		"msg": "pageLoaded",
		"time": (new Date()).getTime(),
		"url": window.location.href,
		"title": document.title
		// could add more here 
	})
}