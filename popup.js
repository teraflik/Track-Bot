var config = new Config();
var opSites = new Sites(config);

function secondsToString(seconds) {
	var years = Math.floor(seconds / 31536000);
	var days = Math.floor((seconds % 31536000) / 86400);
	var hours = Math.floor(((seconds % 31536000) % 86400) / 3600);
	var mins = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
	var secs = (((seconds % 31536000) % 86400) % 3600) % 60;
	var str = "";
	if (years) {
		str = str + " " + years + "y";
	}
	if (days) {
		str = str + " " + days + "d";
	}
	if (hours) {
		str = str + " " + hours + "h";
	}
	if (mins) {
		str = str + " " + mins + "m";
	}
	if (secs) {
		str = str + " " + secs.toFixed(0) + "s";
	}
	return str;
}

function addLocalDisplay() {
	var old_tbody = document.getElementById("stats_tbody");
	var tbody = document.createElement("tbody");
	tbody.setAttribute("id", "stats_tbody");
	old_tbody.parentNode.replaceChild(tbody, old_tbody);

	/* Sort sites by time spent */
	var sites = opSites.sites;
	var sortedSites = new Array();
	var totalTime = 0;
	
	for (site in sites) {
		sortedSites.push([site, sites[site]]);
		totalTime += sites[site];
	}
	sortedSites.sort(function(a, b) {
		return b[1] - a[1];
	});

	var max = 15;
	if (document.location.href.indexOf("show=all") != -1) {
		max = sortedSites.length;
	}

	var row = document.createElement("tr");
	var cell = document.createElement("td");
	cell.innerHTML = "<b>Total</b>";
	row.appendChild(cell);
	cell = document.createElement("td");
	cell.appendChild(document.createTextNode(secondsToString(totalTime)));
	row.appendChild(cell);
	cell = document.createElement("td");
	cell.appendChild(document.createTextNode(("100")));
	row.appendChild(cell);
	row = setPercentageBG(row, 0);
	tbody.appendChild(row);

	var maxTime = 0;
	if (sortedSites.length) {
		maxTime = sites[sortedSites[0][0]];
	}
	var relativePct = 0;
	for (var index = 0; ((index < sortedSites.length) && (index < max)); index++) {
		var site = sortedSites[index][0];
		row = document.createElement("tr");
		cell = document.createElement("td");
		var a = document.createElement('a');
		var linkText = document.createTextNode(site);
		a.appendChild(linkText);
		a.classList ? a.classList.add('anchor') : a.className += ' anchorv';
		a.title = "Open link in new tab";
		a.href = site;
		a.target = "_blank";

		cell.appendChild(a);
		row.appendChild(cell);
		cell = document.createElement("td");
		cell.appendChild(document.createTextNode(secondsToString(sites[site])));
		row.appendChild(cell);
		cell = document.createElement("td");
		cell.appendChild(document.createTextNode(
			(sites[site] / totalTime * 100).toFixed(2)));
		relativePct = (sites[site] / maxTime * 100).toFixed(2);
		row = setPercentageBG(row, relativePct);
		row.appendChild(cell);
		tbody.appendChild(row);	
	}
}

function setPercentageBG(row, pct) {
	var color = "rgba(64, 171, 221, 0.5)";
	row.style.backgroundImage = "-webkit-linear-gradient(left, " + color + " " + pct + "%,#ffffff " + pct + "%)";
	row.style.backgroundImage = "    -moz-linear-gradient(left, " + color + " " + pct + "%, #ffffff " + pct + "%)";
	row.style.backgroundImage = "     -ms-linear-gradient(left, " + color + " " + pct + "%,#ffffff " + pct + "%)";
	row.style.backgroundImage = "      -o-linear-gradient(left, " + color + " " + pct + "%,#ffffff " + pct + "%)";
	row.style.backgroundImage = "         linear-gradient(to right, " + color + " " + pct + "%,#ffffff " + pct + "%)";
	return row;
}

function sendStats() {
	chrome.extension.sendRequest({ action: "sendStats" }, function(response) {
		/* Reload the iframe. */
		var iframe = document.getElementById("stats_frame");
		iframe.src = iframe.src;
	});
}

function clearStats() {
	chrome.extension.sendRequest({ action: "clearStats" }, function(response) {
		initialize();
	});
}

function initialize() {
	addLocalDisplay();
}

document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("clear").addEventListener("click",
		function() {
			if (confirm("Are you sure?")) { clearStats(); } });
	var buttons = document.querySelectorAll("button");
	initialize();
});
