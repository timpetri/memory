// Copyright stuff
// Event page
// Monitors for events through Google Chrome Events API and saves all information to 
// chrome.storage.local.

console.clear()
console.log("Cleared and loaded!")


function currentTime() {
	return new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}

chrome.runtime.onMessage.addListener(handleMessage)
chrome.tabs.onCreated.addListener(handleTabCreation)
chrome.tabs.onUpdated.addListener(handleTabUpdate)
chrome.tabs.onRemoved.addListener(handleTabRemoval)

chrome.tabs.onActivated.addListener(handleTabActivation)

function handleMessage(data, sender, sendResponse) {

	if (data.msg === "pageLoaded") {
		console.log("Loaded " + data.url )
	}
}

// WHenever a tab is created
// Two cases: new tab that's active (click new tab button, chrome://new-tab)
// and new tab that's not active (click open new link in tab (or use omnibox rarely))
function handleTabCreation(tab) {
	var ms = new Date().now()
	console.log("[%s][%d] Tab creation noted.", ms, tab.id)

	// get information on from which tab when this tab was created
	var oldTabId = window.activeTabs[tab.windowId]

	// new tab that's active (click new tab button, chrome://new-tab)
	if (tab.active) {
		// brand new tab
		window.events[ms] = {
			"event": "new_tab",
			"time": ms, 
			"from": oldTabId,
			"to": tab.id}

		// new active tab
		window.activeTabs[tab.windowId] = tab.id

	} else {
		// link opened in new tab in background
		window.events[ms] = {
			"event": "new_tab_link",
			"time": ms, 
			"from": oldTabId,
			"to": tab.id}
	}

	// to be complemented by following tab updates
	window.tabInfo[tab.id] = {
		"id": tab.id,
		"time": ms,
		"url": "TO_BE_SET"}

}

// WHenever a tab updates
function handleTabUpdate(tabId, changeInfo, tab) {
	var ms = currentTime()
	console.log("[%s][%d] Tab update noted.", ms, tabId)
	
	if ("url" in changeInfo) {

		if (window.tabInfo[tabId].url === "TO_BE_SET") {
			// continuation of new tab
			window.tabInfo[tabId].url = changeInfo.url

		} else if (window.tabInfo[tabId] === changeInfo.url) {
			// TODO: reloaded page
		} else {
			// link was clicked inside tab
			window.events[ms] = {
				"event": "open_link_in_tab",
				"time": ms, 
				"from": tabId,
				"to": tabId }
			// throw old link information into archive
			window.tabInfoArchive.push(window.tabInfo[tabId]) // TODO: make sure this happens first
				// to be complemented by tabupdates
			window.tabInfo[tabId] = {
				"id": newTabId,
				"time": ms, // this got updated
				"url": changeInfo.url } // this as well
			}
	} else {
		// ignore updates related to favicon and 
		// title for now (they don't come in order)
	}
}

// WHenever a tab is removed
// removeInfo : {windowsId, isWindowClosing}
function handleTabRemoval(tabId, removeInfo) {
	var ms = currentTime()
	console.log("[%s][%d] Tab removal noted.", ms, tabId)

	// add event for removal
	// push old info into archive
	// update active state
	window.events[ms] = {
			"event": "close_tab",
			"time": ms, 
			"from": tabId,
			"to": -1}

	window.tabInfoArchive.push(window.tabInfo[tabId])
	delete window.tabInfo[tabId]

	if (removeInfo.isWindowClosing) {
		delete window.activeTabs[removeInfo.windowId]
	} else {
		chrome.tabs.query({active: true, windowId: removeInfo.windowId},
			function(resultTabs) {
				window.activeTabs[removeInfo.windowId] = resultTabs[0].id
			});
	}
}

// Active tab changes (url may not be set, listen on updated..)
// activeInfo: {tabId, windowId} 
function handleTabActivation(activeInfo) {
	var ms = currentTime()
	console.log("[%s][%d] Tab activation noted.", ms, activeInfo.tabId)
	console.log(activeInfo)

	window.activeTabs[activeInfo.windowId] = activeInfo.tabId
}

function handleTabDetachment(tabId, detachInfo) {
	var ms = currentTime()
	console.log("[%s][%d] Tab detachment noted.", ms, tabId)

	chrome.tabs.query({active: true, windowId: detachInfo.oldWindowId},
		function(resultTabs) {
			if (resultTabs.length === 1) 
				delete window.activeTabs[detachInfo.oldWindowId]
			else 
				window.activeTabs[detachInfo.oldWindowId] = resultTabs[0].id
		}
	);
}

function handleTabAttachment(tabId, attachInfo) {
	var ms = currentTime()
	console.log("[%s][%d] Tab attachment noted.", ms, tabId)

	window.activeTabs[detachInfo.newWindowId] = tabId

}

function loadStateFromSession() {
	console.log("loading in state")
	chrome.tabs.query({active: true},
		function(resultTabs) {
			console.log(resultTabs)
			for (tab in resultTabs) {
				window.activeTabs[tab.windowId] = tab.id
				console.log(tab.windowId)
			}
		}
	);
}


	// chrome.tabs.query({}, function(result) {
	// 	for (tab in result) {
	// 		var tabId = tab.id
	// 		var windowId = tab.windowId
	// 		if !(windowId in window.state) {
	// 			window.state[windowId] = new Set()
	// 		}
	// 		window.state[windowId].add(tabId)
	// 		if (tab.active) {
	// 			window.activeTabs[windowId] = tabId
	// 		}
	// 	} 
	// })
window.activeTabs = {}
window.tabInfo = {}
window.activeTabs = {}
window.tabInfoArchive = []



// When loading up, add listeners
window.onload = function() {
	loadStateFromSession();
};


loadStateFromSession();


