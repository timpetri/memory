
console.log("Loaded!");

const currentTime = () => {
	return new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}

/**
 * Basic wrapper for tab information.
 */
class Tab {
	constructor(chromeTabObject) {
		this.obj_ = chromeTabObject;
		this.active_ = chromeTabObject.active;
		this.favIconUrl = chromeTabObject.favIconUrl;
		this.id_ = chromeTabObject.id;
		this.openerTabId_ = chromeTabObject.openerTabId || -1;
		this.status_ = chromeTabObject.status;
		this.url_ = chromeTabObject.url;
		this.windowId_ = chromeTabObject.windowId;
	}

	toString() {
		return `id: ${this.id_}, url: window: ${this.windowId_}, opened: ${this.openerTabId_}, ${this.url_}`;
	}
}

/**
 * Accepts a message from `content.js` which is injected on every page. Used to
 * save information on every page load.
 */
const handleMessage = (data , sender, sendResponse) => {
	if (data.msg === "pageLoaded") {
		// console.log("[loaded]", data.url);
	}
}

/**
 * Handles tab creation.
 */
const handleTabCreation = (tab) => {
	var ms = currentTime()
	console.log(`[creation] ${ms} ${tabId}`);
}

/**
 * Handles tab update.
 */
const handleTabUpdate = (tabId , changeInfo, tab) => {
	const ms1 = currentTime();
	chrome.tabs.query({}, (tabs) => {
		const ms2 = currentTime();
		console.log(`[removal] [${ms1},${ms2}]`);
		tabs.forEach((tabData) => {
			const tab = new Tab(tabData);
			console.log(tab.toString());
		});
	});
}

/**
 * Handles a tab being removed.
 * removeInfo : {windowsId, isWindowClosing}
 */
const handleTabRemoval = (tabId , removeInfo) => {
	var ms = currentTime()
	console.log(`[removal] ${ms} || ${tabId}`);
}

/**
 * Handles a tab being activated.
 * @param activeInfo: {tabId, windowId}
 */
const handleTabActivation = (activeInfo) => {
	var ms = currentTime()
	console.log(`[activation] ${ms} ${activeInfo.tabId}`);
}

/**
 * Handles event for a tab being detached.
 */
const handleTabDetachment = (tabId , detachInfo) => {
	var ms = currentTime();
	console.log(`[detachment] ${ms} || ${tabId}`);
}

/**
 * Handles a tab being attached to a window.
 */
const handleTabAttachment = (tabId , attachInfo) => {
	var ms = currentTime();
	console.log(`[attachment] ${ms} || ${tabId}`);
};

window.activeTabs = {}
window.tabInfo = {}
window.activeTabs = {}
window.tabInfoArchive = []


// When loading up, add listeners
window.onload = function() {
	// loadStateFromSession();
};

chrome.runtime.onMessage.addListener(handleMessage);
chrome.tabs.onActivated.addListener(handleTabActivation);
chrome.tabs.onCreated.addListener(handleTabCreation);
chrome.tabs.onRemoved.addListener(handleTabRemoval);
chrome.tabs.onUpdated.addListener(handleTabUpdate);

