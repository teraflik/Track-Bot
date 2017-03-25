function Tracker(config, sites) {
	this._sites = sites;
	var self = this;
	chrome.tabs.onUpdated.addListener(
		function(tabId, changeInfo, tab) {
			self._updateTimeWithCurrentTab();
		}
	);
	chrome.tabs.onActivated.addListener(
		function(activeInfo) {
			chrome.tabs.get(activeInfo.tabId, function(tab) {
				self._sites.setCurrentFocus(tab.url);
			});
		}
	);
	chrome.windows.onFocusChanged.addListener(
		function(windowId) {
			if (windowId == chrome.windows.WINDOW_ID_NONE) {
				self._sites.setCurrentFocus(null);
				return;
			}
			self._updateTimeWithCurrentTab();
		}
	);
	chrome.idle.onStateChanged.addListener(function(idleState) {
		if (idleState == "active") {
			config.idle = false;
			self._updateTimeWithCurrentTab();
		} else {
			config.idle = true;
			self._sites.setCurrentFocus(null);
		}
	});
	chrome.alarms.create(
		"updateTime",
		{periodInMinutes: config.updateTimePeriodMinutes});
	chrome.alarms.onAlarm.addListener(function(alarm) {
		if (alarm.name == "updateTime") {
			if (!config.idle) {
				self._updateTimeWithCurrentTab();
			}
			chrome.idle.queryState(60, function(idleState) {
				if (idleState == "active") {
					config.idle = false;
				} else {
					config.idle = true;
					self._sites.setCurrentFocus(null);
				}
			});
		}
	});
}

Tracker.prototype._updateTimeWithCurrentTab = function() {
	var self = this;
	chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
		if (tabs.length == 1) {
			var url = tabs[0].url;
			chrome.windows.get(tabs[0].windowId, function(win) {
				if (!win.focused) {
					url = null;
				}
				self._sites.setCurrentFocus(url);
			});
		}
	});
};
