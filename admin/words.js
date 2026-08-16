/* eslint no-unused-vars: off */
/* eslint no-global-assign: off */
/* global systemDictionary */
"use strict";

systemDictionary = {
	"nfl adapter settings": {
		en: "Adapter settings for nfl",
		de: "Adaptereinstellungen für nfl",
	},
	favorites_header: {
		en: "Favorite teams",
		de: "Lieblingsteams",
	},
	favoriteTeamIds: {
		en: "Favorite teams",
		de: "Lieblingsteams",
	},
	favoriteTeamIds_help: {
		en: "Select one or more NFL teams to mark as favorites. The adapter writes an isFavorite flag on each team's object and on every game where that team plays.",
		de: "Wähle ein oder mehrere NFL-Teams als Favorit aus. Der Adapter setzt eine isFavorite-Markierung am Team-Objekt und an jedem Spiel, in dem das Team antritt.",
	},
	scoreboard_header: {
		en: "Scoreboard",
		de: "Ergebnisanzeige",
	},
	pollIntervalLiveSeconds: {
		en: "Live scoreboard refresh interval (seconds)",
		de: "Live-Aktualisierungsintervall (Sekunden)",
	},
	pollIntervalLiveSeconds_help: {
		en: "How often to refresh the scoreboard while NFL games are in progress (15–300 s). When no game is live the adapter polls every 5 minutes automatically.",
		de: "Wie oft das Scoreboard während laufender Spiele aktualisiert wird (15–300 s). Wenn kein Spiel läuft, fragt der Adapter automatisch alle 5 Minuten ab.",
	},
};
