/*
	ioBroker.vis nfl Widget-Set

	version: "0.0.1"

	Copyright 2024 Daniel Drießen daniel.driessen@ddproductions.de
*/
"use strict";

/* global $, vis, systemDictionary */

// add translations for edit mode
$.extend(true, systemDictionary, {
	// Add your translations here, e.g.:
	// "size": {
	// 	"en": "Size",
	// 	"de": "Größe",
	// 	"ru": "Размер",
	// 	"pt": "Tamanho",
	// 	"nl": "Grootte",
	// 	"fr": "Taille",
	// 	"it": "Dimensione",
	// 	"es": "Talla",
	// 	"pl": "Rozmiar",
	//  "uk": "Розмір"
	// 	"zh-cn": "尺寸"
	// }
});

// this code can be placed directly in nfl.html
vis.binds["nfl"] = {
	version: "0.0.1",
	showVersion: function () {
		if (vis.binds["nfl"].version) {
			console.log("Version nfl: " + vis.binds["nfl"].version);
			vis.binds["nfl"].version = null;
		}
	},
	createWidget: function (widgetID, view, data, style) {
		var $div = $("#" + widgetID);
		// if nothing found => wait
		if (!$div.length) {
			return setTimeout(function () {
				vis.binds["nfl"].createWidget(widgetID, view, data, style);
			}, 100);
		}

		var text = "";
		text += "OID: " + data.oid + "</div><br>";
		text += 'OID value: <span class="nfl-value">' + vis.states[data.oid + ".val"] + "</span><br>";
		text += 'Color: <span style="color: ' + data.myColor + '">' + data.myColor + "</span><br>";
		text += "extraAttr: " + data.extraAttr + "<br>";
		text += "Browser instance: " + vis.instance + "<br>";
		text += 'htmlText: <textarea readonly style="width:100%">' + (data.htmlText || "") + "</textarea><br>";

		$("#" + widgetID).html(text);

		// subscribe on updates of value
		function onChange(e, newVal, oldVal) {
			$div.find(".template-value").html(newVal);
		}
		if (data.oid) {
			vis.states.bind(data.oid + ".val", onChange);
			//remember bound state that vis can release if didnt needed
			$div.data("bound", [data.oid + ".val"]);
			//remember onchange handler to release bound states
			$div.data("bindHandler", onChange);
		}
	},
};

vis.binds["nfl"].showVersion();
