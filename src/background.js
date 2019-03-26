// This Chrome Extension allows one to toggle between the GitHub Repo and GitHub Pages
//
// Built by Bramus! - https://www.bram.us/
// Based upon https://christianheilmann.com/2019/03/18/github-toggle-a-bookmarklet-to-toggle-between-repo-and-github-pages/

let selectedTabId = null;
let selectedURL = null;

const toggle = function() {
	chrome.tabs.update(selectedTabId, {
		url: getOtherGitHubURL(),
	});
};

const getOtherGitHubURL = function() {
	const pp = [/\/(.*)\.github.io/, '//github.com$1'];
	const pr = [/github.com\/([^\/]+)\//, '$1.github.io/'];

	const url = selectedURL.toString();

	if (url.indexOf('github.io') !== -1) {
		return url.replace(pp[0], pp[1]);
	} else {
		return url.replace(pr[0], pr[1]);
	}
}

const isGitHubURL = function(str) {
	const allowedDomains = ['github.com', 'github.io'];

	return allowedDomains.reduce(function(accumulator, allowedDomain) {
		return accumulator || (str.substr(-allowedDomain.length) === allowedDomain);
	}, false);
};

const updateButton = function() {
	chrome.tabs.get(selectedTabId, function(tab) {
		selectedTab = tab;
		selectedURL = new URL(selectedTab.url);
		if (isGitHubURL(selectedURL.hostname)) {
			enableButton();
		} else {
			disableButton();
		}
	});
};

const disableButton = function() {
	chrome.browserAction.disable(selectedTabId);
};

const enableButton = function() {
	chrome.browserAction.enable(selectedTabId);
};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
	if (changeInfo.status == "loading" && tabId == selectedTabId) {
		disableButton();
	}
	if (changeInfo.status == "complete" && tabId == selectedTabId) {
		updateButton();
	}
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
	selectedTabId = tabId;
	updateButton();
});

chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
	selectedTabId = tabs[0].id;
    updateButton();
});

chrome.browserAction.onClicked.addListener(toggle);