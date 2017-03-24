var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-45267314-2']);
_gaq.push(['_trackPageview']);

(function() {
  var sr = document.createElement('script'); sr.type = 'text/javascript'; sr.async = true;
  sr.src = 'https://ssl.google-analytics.com/sr.js';
  var str = document.getElementsByTagName('script')[0]; str.parentNode.insertBefore(sr, str);
})();

function clearStats() {
  if (config.clearStatsInterval < 3600) {
    config.nextTimeToClear = 0;
    return;
  }

  if (!config.nextTimeToClear) {
    var dt = new Date();
    dt.setTime(dt.getTime() + config.clearStatsInterval * 1000);
    dt.setMinutes(0);
    dt.setSeconds(0);
    if (config.clearStatsInterval > 3600) {
      dt.setHours(0);
    }
    config.nextTimeToClear = dt.getTime();
  }
  var now = new Date();
  if (now.getTime() > config.nextTimeToClear) {
    sites.clear();
    var nextTimeToClear = new Date(nextTimeToClear + config.clearStatsInterval * 1000);
    config.nextTimeToClear = nextTimeToClear.getTime();
    return;
  }
}

var config = new Config();
var sites = new Sites(config);
var tracker = new Tracker(config, sites);

/* Listen for requests which come from the user through the popup. */
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "clearStats") {
      sites.clear();
      sendResponse({});
    } else if (request.action == "addIgnoredSite") {
      config.addIgnoredSite(request.site);
      sendResponse({});
    } else {
      console.log("Invalid action given: " + request.action);
    }
  });

chrome.alarms.create("clearStats", {periodInMinutes: 2});
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name == "clearStats") {
    clearStats(config);
  }
});
