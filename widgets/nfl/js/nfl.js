/*
	ioBroker.vis nfl Widget-Set — Stadium Luxe
	version: "0.0.1"
	Copyright 2024-2026 Daniel Drießen daniel.driessen@ddproductions.de
*/
/* global $, vis */
"use strict";

$.extend(true, systemDictionary, {
	nfl_instance: { en: "Adapter instance", de: "Adapter-Instanz" },
	nfl_mode: { en: "Games to show", de: "Angezeigte Spiele" },
	nfl_scheduleMode: { en: "Schedule list", de: "Spielplan-Liste" },
	nfl_favoriteOnly: { en: "Favorite team only", de: "Nur Lieblingsteam" },
	nfl_maxGames: { en: "Max. games shown", de: "Max. angezeigte Spiele" },
	nfl_layout: { en: "Layout", de: "Layout" },
	nfl_density: { en: "Density", de: "Dichte" },
	nfl_showLogos: { en: "Show team logos", de: "Teamlogos anzeigen" },
	nfl_showHeader: { en: "Show header", de: "Kopfzeile anzeigen" },
	nfl_showVenue: { en: "Show venue", de: "Stadion anzeigen" },
	nfl_showBroadcasts: { en: "Show TV / broadcasts", de: "TV / Broadcasts anzeigen" },
	nfl_showNextFooter: { en: "Show next-game footer", de: "Nächstes-Spiel-Fußzeile" },
	nfl_showStatsRow: { en: "Show detail / venue row", de: "Detail- / Stadion-Zeile" },
	nfl_bgColor: { en: "Background color", de: "Hintergrundfarbe" },
	nfl_textColor: { en: "Text color", de: "Textfarbe" },
	nfl_accentColor: { en: "Accent / score color", de: "Akzent- / Ergebnisfarbe" },
	nfl_liveColor: { en: "LIVE badge color", de: "LIVE-Badge-Farbe" },
	nfl_upcomingColor: { en: "UPCOMING badge color", de: "UPCOMING-Badge-Farbe" },
	nfl_group_data: { en: "Data source", de: "Datenquelle" },
	nfl_group_filter: { en: "Filters", de: "Filter" },
	nfl_group_layout: { en: "Layout", de: "Layout" },
	nfl_group_display: { en: "Display", de: "Anzeige" },
	nfl_group_style: { en: "Appearance", de: "Erscheinungsbild" },
});

vis.binds["nfl"] = {
	version: "0.0.1-stadium-luxe",
	_timers: {},

	destroy: function (wid) {
		if (vis.binds["nfl"]._timers[wid]) {
			clearInterval(vis.binds["nfl"]._timers[wid]);
			delete vis.binds["nfl"]._timers[wid];
		}
	},

	_bool: function (v, def) {
		if (v === undefined || v === null || v === "") return !!def;
		return !(v === false || v === "false" || v === 0 || v === "0");
	},

	_logoUrl: function (abbrev, sz) {
		if (!abbrev) return "";
		return (
			"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/scoreboard/" +
			abbrev.toLowerCase() +
			".png&w=" +
			(sz || 36) +
			"&h=" +
			(sz || 36) +
			"&scale=crop"
		);
	},

	_fmtDate: function (iso) {
		if (!iso) return "";
		var d = new Date(iso);
		if (isNaN(d.getTime())) return iso;
		var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var h = d.getHours(),
			m = d.getMinutes();
		var ampm = h >= 12 ? "PM" : "AM";
		h = h % 12 || 12;
		return days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate() + "  " + h + ":" + (m < 10 ? "0" + m : m) + " " + ampm;
	},

	_fmtDateShort: function (iso) {
		if (!iso) return { day: "", time: "" };
		var d = new Date(iso);
		if (isNaN(d.getTime())) return { day: iso, time: "" };
		var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var h = d.getHours(),
			m = d.getMinutes();
		var ampm = h >= 12 ? "PM" : "AM";
		h = h % 12 || 12;
		return {
			day: days[d.getDay()] + " " + months[d.getMonth()] + " " + d.getDate(),
			time: h + ":" + (m < 10 ? "0" + m : m) + " " + ampm,
		};
	},

	_statusText: function (game) {
		var st = game.status || {};
		if (st.state === "in") {
			var p = st.period;
			var label = p <= 4 ? "Q" + p : p === 5 ? "OT" : p + "OT";
			return [label, st.displayClock].filter(Boolean).join("  ");
		}
		if (st.state === "post") {
			return st.detail || "Final";
		}
		return "";
	},

	_statusBadgeClass: function (game) {
		var st = game.status || {};
		var detail = String(st.detail || "").toLowerCase();
		if (st.state === "in") {
			if (detail.indexOf("half") >= 0) return "nfl-badge-ht";
			if ((st.period || 0) >= 5 || detail.indexOf("ot") >= 0) return "nfl-badge-ot";
			return "nfl-badge-live";
		}
		if (st.state === "post") return "nfl-badge-final";
		return "nfl-badge-upcoming";
	},

	_parseGames: function (states, instance) {
		var prefix = instance + ".nfl-games.current.";
		var games = {};

		for (var key in states) {
			if (!Object.prototype.hasOwnProperty.call(states, key)) continue;
			if (key.indexOf(prefix) !== 0) continue;

			var rest = key.substring(prefix.length);
			var firstDot = rest.indexOf(".");
			if (firstDot < 0) continue;

			var eventId = rest.substring(0, firstDot);
			if (!/^\d+$/.test(eventId)) continue;

			if (!games[eventId]) {
				games[eventId] = { id: eventId, status: {}, home: {}, away: {}, venue: {} };
			}

			var subKey = rest.substring(firstDot + 1);
			var val = states[key] ? states[key].val : null;
			var parts = subKey.split(".");

			if (parts.length === 1) {
				games[eventId][parts[0]] = val;
			} else if (parts.length === 2) {
				if (!games[eventId][parts[0]]) games[eventId][parts[0]] = {};
				games[eventId][parts[0]][parts[1]] = val;
			} else if (parts.length === 3) {
				if (!games[eventId][parts[0]]) games[eventId][parts[0]] = {};
				if (!games[eventId][parts[0]][parts[1]]) games[eventId][parts[0]][parts[1]] = {};
				games[eventId][parts[0]][parts[1]][parts[2]] = val;
			}
		}

		return Object.values(games).sort(function (a, b) {
			return (a.date || "") < (b.date || "") ? -1 : 1;
		});
	},

	_loadStates: function (instance, callback) {
		var INFO_STATES = [
			instance + ".nfl-games.info.lastUpdate",
			instance + ".nfl-games.info.liveGameCount",
			instance + ".nfl-games.info.eventCount",
			instance + ".nfl-games.info.seasonYear",
			instance + ".nfl-games.info.week",
			instance + ".nfl-games.info.currentEventIds",
			instance + ".nfl-games.info.eventIds",
		];

		vis.conn.getStates(INFO_STATES, function (err, infoStates) {
			if (err || !infoStates) {
				callback({});
				return;
			}

			var eventIdsRaw =
				infoStates[instance + ".nfl-games.info.currentEventIds"] ||
				infoStates[instance + ".nfl-games.info.eventIds"];
			var eventIds = [];
			try {
				eventIds = JSON.parse((eventIdsRaw && eventIdsRaw.val) || "[]");
			} catch (e) {
				eventIds = [];
			}

			if (!eventIds.length) {
				callback(infoStates || {});
				return;
			}

			var GAME_FIELDS = [
				"name", "shortName", "date", "broadcasts",
				"status.state", "status.period", "status.displayClock", "status.detail", "status.completed",
				"home.teamId", "home.abbreviation", "home.displayName", "home.score", "home.winner", "home.isFavorite",
				"away.teamId", "away.abbreviation", "away.displayName", "away.score", "away.winner", "away.isFavorite",
				"venue.fullName",
			];

			var gameStateIds = [];
			for (var i = 0; i < eventIds.length; i++) {
				for (var j = 0; j < GAME_FIELDS.length; j++) {
					gameStateIds.push(instance + ".nfl-games.current." + eventIds[i] + "." + GAME_FIELDS[j]);
				}
			}

			vis.conn.getStates(gameStateIds, function (err2, gameStates) {
				var combined = {};
				var k;
				for (k in infoStates) if (Object.prototype.hasOwnProperty.call(infoStates, k)) combined[k] = infoStates[k];
				if (gameStates) {
					for (k in gameStates) if (Object.prototype.hasOwnProperty.call(gameStates, k)) combined[k] = gameStates[k];
				}
				callback(combined);
			});
		});
	},

	_shellStyle: function (bg, fg, accent) {
		return (
			"--nfl-deep:" + bg + ";--nfl-text:" + fg + ";--nfl-gold:" + accent +
			";background:radial-gradient(120% 80% at 50% -10%, rgba(108,46,255,.18), transparent 55%)," +
			"radial-gradient(90% 60% at 100% 100%, rgba(255,138,0,.08), transparent 50%)," + bg +
			";color:" + fg
		);
	},

	_metaLine: function (game, showVenue, showBroadcasts) {
		var bits = [];
		if (showVenue && game.venue && game.venue.fullName) bits.push(game.venue.fullName);
		else if (showVenue && typeof game.venue === "string" && game.venue) bits.push(game.venue);
		if (showBroadcasts && game.broadcasts) bits.push(String(game.broadcasts));
		if (game.status && game.status.state === "in" && game.status.detail) bits.push(String(game.status.detail));
		return bits.join(" · ");
	},

	createScoreboard: function (wid, view, data, style) {
		var $div = $("#" + wid);
		if (!$div.length) {
			return setTimeout(function () {
				vis.binds["nfl"].createScoreboard(wid, view, data, style);
			}, 100);
		}

		var self = vis.binds["nfl"];
		var instance = (data.instance || "nfl.0").trim();
		var mode = data.mode || "all";
		var favOnly = self._bool(data.favoriteOnly, false);
		var maxGames = Math.max(1, parseInt(data.maxGames, 10) || 16);
		var layout = data.layout || "list";
		var density = data.density || "comfortable";
		var showLogos = self._bool(data.showLogos, true);
		var showHeader = self._bool(data.showHeader, true);
		var showVenue = self._bool(data.showVenue, true);
		var showBroadcasts = self._bool(data.showBroadcasts, false);
		var bg = data.bgColor || "#0D1B2A";
		var fg = data.textColor || "#F5F7FA";
		var accent = data.accentColor || "#FFD166";

		var render = function () {
			self._loadStates(instance, function (states) {
				var games = self._parseGames(states, instance);
				if (mode === "live") games = games.filter(function (g) { return g.status.state === "in"; });
				else if (mode === "upcoming") games = games.filter(function (g) { return g.status.state === "pre"; });
				if (favOnly) games = games.filter(function (g) { return g.home.isFavorite || g.away.isFavorite; });
				if (games.length > maxGames) games = games.slice(0, maxGames);

				var liveCount = games.filter(function (g) { return g.status.state === "in"; }).length;
				var weekNum = (states[instance + ".nfl-games.info.week"] || {}).val || "";
				var seasonYr = (states[instance + ".nfl-games.info.seasonYear"] || {}).val || "";
				var densClass = density === "compact" ? " nfl-compact" : "";
				var h = '<div class="nfl-sb' + densClass + '" style="' + self._shellStyle(bg, fg, accent) + '">';

				if (showHeader) {
					h += '<div class="nfl-sb-hdr">';
					h += '<span class="nfl-sb-title" style="color:' + accent + '">NFL';
					if (weekNum) h += '&nbsp;&nbsp;<span class="nfl-dim">Week&nbsp;' + weekNum + "</span>";
					if (seasonYr) h += '&nbsp;<span class="nfl-dim">' + seasonYr + "</span>";
					h += "</span>";
					if (liveCount > 0) {
						h += '<span class="nfl-badge nfl-badge-live"><span class="nfl-dot-anim"></span>' + liveCount + "&nbsp;LIVE</span>";
					}
					h += "</div>";
				}

				if (!games.length) {
					h += '<div class="nfl-empty">No games to show</div>';
				} else if (layout === "ticker") {
					h += '<div class="nfl-ticker-track">';
					for (var t = 0; t < games.length; t++) h += self._tickerRow(games[t], showLogos, accent);
					h += "</div>";
				} else {
					h += '<div class="nfl-sb-list">';
					for (var i = 0; i < games.length; i++) h += self._gameRow(games[i], showLogos, showVenue, showBroadcasts, accent);
					h += "</div>";
				}
				h += "</div>";
				$div.html(h);
			});
		};

		render();
		if (self._timers[wid]) clearInterval(self._timers[wid]);
		self._timers[wid] = setInterval(render, 31000);
	},

	_tickerRow: function (game, showLogos, accent) {
		var self = vis.binds["nfl"];
		var aw = game.away || {};
		var hm = game.home || {};
		var live = game.status.state === "in";
		var final = game.status.state === "post";
		var h = '<div class="nfl-ticker-item">';
		if (showLogos && aw.abbreviation) {
			h += '<img class="nfl-logo" style="width:26px;height:26px" src="' + self._logoUrl(aw.abbreviation, 26) +
				'" alt="" onerror="this.style.display=\'none\'">';
		}
		h += '<span class="nfl-abbr">' + (aw.abbreviation || "—") + "</span>";
		h += '<div class="nfl-ticker-scores" style="color:' + accent + '">';
		if (live || final) {
			h += (aw.score !== undefined && aw.score !== "" ? aw.score : "0") + " – " +
				(hm.score !== undefined && hm.score !== "" ? hm.score : "0");
		} else {
			h += '<span class="nfl-vs">vs</span>';
		}
		h += "</div>";
		h += '<span class="nfl-abbr">' + (hm.abbreviation || "—") + "</span>";
		if (showLogos && hm.abbreviation) {
			h += '<img class="nfl-logo" style="width:26px;height:26px" src="' + self._logoUrl(hm.abbreviation, 26) +
				'" alt="" onerror="this.style.display=\'none\'">';
		}
		if (live) h += '<span class="nfl-ticker-clock"><span class="nfl-dot-red"></span>&nbsp;' + self._statusText(game) + "</span>";
		else if (final) h += '<span class="nfl-badge nfl-badge-final" style="margin-left:auto">FINAL</span>';
		else h += '<span class="nfl-badge nfl-badge-upcoming" style="margin-left:auto">UPCOMING</span>';
		h += "</div>";
		return h;
	},

	_gameRow: function (game, showLogos, showVenue, showBroadcasts, accent) {
		var self = vis.binds["nfl"];
		var state = game.status.state;
		var live = state === "in";
		var final = state === "post";
		var pre = state === "pre";
		var h = '<div class="nfl-row' + (live ? " nfl-row-live" : "") + '">';
		h += '<div class="nfl-row-status">';
		if (live) {
			h += '<span class="nfl-live-line"><span class="nfl-dot-red"></span>' + self._statusText(game) + "</span>";
			h += '<span class="nfl-badge ' + self._statusBadgeClass(game) + '">LIVE</span>';
		} else if (final) {
			h += "<span>FINAL</span><span class=\"nfl-badge nfl-badge-final\">FINAL</span>";
		} else if (pre && game.date) {
			h += "<span>" + self._fmtDate(game.date) + "</span>";
			h += '<span class="nfl-badge nfl-badge-upcoming">UPCOMING</span>';
		}
		h += "</div><div class=\"nfl-row-teams\">";

		var aw = game.away || {};
		h += '<div class="nfl-team">';
		if (showLogos && aw.abbreviation) {
			h += '<img class="nfl-logo" src="' + self._logoUrl(aw.abbreviation, 34) + '" alt="' + aw.abbreviation +
				'" onerror="this.style.display=\'none\'">';
		}
		h += '<span class="nfl-abbr"' + (aw.isFavorite ? ' style="color:' + accent + '"' : "") + ">" +
			(aw.abbreviation || "—") + "</span></div>";

		h += '<div class="nfl-score-blk">';
		if (live || final) {
			var as = aw.score !== undefined && aw.score !== "" ? aw.score : "0";
			var hs = (game.home || {}).score !== undefined && (game.home || {}).score !== "" ? (game.home || {}).score : "0";
			h += '<span class="nfl-score' + (aw.winner ? " nfl-win" : "") + '" style="color:' + accent + '">' + as + "</span>";
			h += '<span class="nfl-sep">–</span>';
			h += '<span class="nfl-score' + ((game.home || {}).winner ? " nfl-win" : "") + '" style="color:' + accent + '">' + hs + "</span>";
		} else {
			h += '<span class="nfl-vs">vs</span>';
		}
		h += "</div>";

		var hm = game.home || {};
		h += '<div class="nfl-team nfl-team-r">';
		h += '<span class="nfl-abbr"' + (hm.isFavorite ? ' style="color:' + accent + '"' : "") + ">" +
			(hm.abbreviation || "—") + "</span>";
		if (showLogos && hm.abbreviation) {
			h += '<img class="nfl-logo" src="' + self._logoUrl(hm.abbreviation, 34) + '" alt="' + hm.abbreviation +
				'" onerror="this.style.display=\'none\'">';
		}
		h += "</div></div>";

		var meta = self._metaLine(game, showVenue, showBroadcasts);
		if (meta) h += '<div class="nfl-row-meta">' + meta + "</div>";
		h += "</div>";
		return h;
	},

	createFavoriteTeam: function (wid, view, data, style) {
		var $div = $("#" + wid);
		if (!$div.length) {
			return setTimeout(function () {
				vis.binds["nfl"].createFavoriteTeam(wid, view, data, style);
			}, 100);
		}

		var self = vis.binds["nfl"];
		var instance = (data.instance || "nfl.0").trim();
		var layout = data.layout || "hero";
		var showLogos = self._bool(data.showLogos, true);
		var showNextFooter = self._bool(data.showNextFooter, true);
		var showStatsRow = self._bool(data.showStatsRow, true);
		var showVenue = self._bool(data.showVenue, true);
		var showBroadcasts = self._bool(data.showBroadcasts, true);
		var bg = data.bgColor || "#0D1B2A";
		var fg = data.textColor || "#F5F7FA";
		var accent = data.accentColor || "#FFD166";

		var render = function () {
			self._loadStates(instance, function (states) {
				var games = self._parseGames(states, instance);
				var liveG = null, nextG = null, lastG = null;
				for (var i = 0; i < games.length; i++) {
					var g = games[i];
					if (!(g.home.isFavorite || g.away.isFavorite)) continue;
					var s = g.status.state;
					if (s === "in" && !liveG) liveG = g;
					if (s === "pre" && !nextG) nextG = g;
					if (s === "post") lastG = g;
				}
				var game = liveG || nextG || lastG;

				var finish = function (nextDto) {
					if (!game) {
						$div.html(
							'<div class="nfl-ft" style="' + self._shellStyle(bg, fg, accent) + '">' +
							'<div class="nfl-ft-hdr"><span class="nfl-sb-title" style="color:' + accent +
							'">Favorite Team</span></div>' +
							'<div class="nfl-empty">No favorite team configured.<br><small>Set favorites in adapter admin.</small></div></div>'
						);
						return;
					}
					if (layout === "strip") {
						$div.html(self._renderFavoriteStrip(game, showLogos, bg, fg, accent));
						return;
					}
					$div.html(self._renderFavoriteHero(game, {
						compact: layout === "compact",
						showLogos: showLogos,
						showNextFooter: showNextFooter,
						showStatsRow: showStatsRow,
						showVenue: showVenue,
						showBroadcasts: showBroadcasts,
						nextDto: nextDto,
						bg: bg, fg: fg, accent: accent,
					}));
				};

				if (showNextFooter && (liveG || lastG)) {
					vis.conn.getStates(
						[instance + ".views.schedule.favoritesUpcoming", instance + ".views.favorites.next"],
						function (err, st) {
							var nextDto = null;
							try {
								var favNext = st && st[instance + ".views.favorites.next"] && st[instance + ".views.favorites.next"].val;
								if (favNext) nextDto = typeof favNext === "string" ? JSON.parse(favNext) : favNext;
							} catch (e1) { nextDto = null; }
							if (!nextDto) {
								try {
									var list = JSON.parse((st && st[instance + ".views.schedule.favoritesUpcoming"] &&
										st[instance + ".views.schedule.favoritesUpcoming"].val) || "[]");
									if (Array.isArray(list) && list.length) nextDto = list[0];
								} catch (e2) { nextDto = null; }
							}
							finish(nextDto);
						}
					);
				} else {
					finish(null);
				}
			});
		};

		render();
		if (self._timers[wid]) clearInterval(self._timers[wid]);
		self._timers[wid] = setInterval(render, 31000);
	},

	_renderFavoriteStrip: function (game, showLogos, bg, fg, accent) {
		var self = vis.binds["nfl"];
		var isHome = !!game.home.isFavorite;
		var my = isHome ? game.home : game.away;
		var opp = isHome ? game.away : game.home;
		var live = game.status.state === "in";
		var final = game.status.state === "post";
		var h = '<div class="nfl-strip" style="' + self._shellStyle(bg, fg, accent) + '">';
		h += '<span class="nfl-strip-heart">♥</span><div class="nfl-strip-mid">';
		if (showLogos && my.abbreviation) {
			h += '<img class="nfl-logo" style="width:28px;height:28px" src="' + self._logoUrl(my.abbreviation, 28) +
				'" alt="" onerror="this.style.display=\'none\'">';
		}
		h += '<span class="nfl-abbr">' + (my.abbreviation || "") + "</span>";
		if (live || final) {
			h += '<span class="nfl-strip-score" style="color:' + accent + '">' + (my.score || "0") + " – " + (opp.score || "0") + "</span>";
		} else {
			h += '<span class="nfl-vs">vs ' + (opp.abbreviation || "") + "</span>";
		}
		if (showLogos && opp.abbreviation) {
			h += '<img class="nfl-logo" style="width:28px;height:28px" src="' + self._logoUrl(opp.abbreviation, 28) +
				'" alt="" onerror="this.style.display=\'none\'">';
		}
		h += "</div>";
		if (live) h += '<span class="nfl-strip-meta"><span class="nfl-dot-red"></span>&nbsp;' + self._statusText(game) + "</span>";
		else if (final) h += '<span class="nfl-badge nfl-badge-final">FINAL</span>';
		else h += '<span class="nfl-badge nfl-badge-upcoming">NEXT</span>';
		h += "</div>";
		return h;
	},

	_renderFavoriteHero: function (game, opts) {
		var self = vis.binds["nfl"];
		var aw = game.away || {};
		var hm = game.home || {};
		var live = game.status.state === "in";
		var final = game.status.state === "post";
		var isHomeFav = !!hm.isFavorite;
		var my = isHomeFav ? hm : aw;
		var compactClass = opts.compact ? " nfl-ft-compact" : "";
		var h = '<div class="nfl-ft' + compactClass + '" style="' + self._shellStyle(opts.bg, opts.fg, opts.accent) + '">';
		h += '<div class="nfl-ft-hdr">';
		h += '<span class="nfl-sb-title" style="color:' + opts.accent + '">' + (my.displayName || "Favorite Team") + "</span>";
		if (live) h += '<span class="nfl-badge nfl-badge-live"><span class="nfl-dot-anim"></span>LIVE</span>';
		else if (final) h += '<span class="nfl-badge nfl-badge-final">FINAL</span>';
		else h += '<span class="nfl-badge nfl-badge-upcoming">UPCOMING</span>';
		h += '</div><div class="nfl-ft-body">';
		if (live) h += '<div class="nfl-ft-clock">' + self._statusText(game) + "</div>";

		h += '<div class="nfl-ft-match"><div class="nfl-ft-side">';
		if (opts.showLogos && aw.abbreviation) {
			h += '<img class="nfl-ft-logo" src="' + self._logoUrl(aw.abbreviation, opts.compact ? 48 : 72) +
				'" alt="" onerror="this.style.display=\'none\'">';
		}
		h += '<div class="nfl-ft-abbr"' + (aw.isFavorite ? ' style="color:' + opts.accent + '"' : "") + ">" +
			(aw.abbreviation || "") + "</div></div>";

		h += '<div class="nfl-ft-score-center">';
		if (live || final) {
			h += '<div class="nfl-ft-scores">';
			h += '<div class="nfl-ft-big" style="color:' + opts.accent + '">' + (aw.score || "0") + "</div>";
			h += '<div class="nfl-ft-dash">–</div>';
			h += '<div class="nfl-ft-big" style="color:' + opts.accent + '">' + (hm.score || "0") + "</div></div>";
		} else {
			h += '<div class="nfl-ft-clock" style="color:' + opts.accent + '">' + self._fmtDate(game.date) + "</div>";
			h += '<div class="nfl-vs">vs</div>';
		}
		h += "</div>";

		h += '<div class="nfl-ft-side">';
		if (opts.showLogos && hm.abbreviation) {
			h += '<img class="nfl-ft-logo" src="' + self._logoUrl(hm.abbreviation, opts.compact ? 48 : 72) +
				'" alt="" onerror="this.style.display=\'none\'">';
		}
		h += '<div class="nfl-ft-abbr"' + (hm.isFavorite ? ' style="color:' + opts.accent + '"' : "") + ">" +
			(hm.abbreviation || "") + "</div></div></div>";

		if (live) {
			h += '<div class="nfl-ft-poss' + (isHomeFav ? " nfl-ft-poss-home" : " nfl-ft-poss-away") + '"><span></span></div>';
		}

		if (opts.showStatsRow && !opts.compact) {
			var venue = (game.venue && game.venue.fullName) || "";
			var detail = (game.status && game.status.detail) || "";
			var broadcasts = game.broadcasts || "";
			if (venue || detail || broadcasts || game.date) {
				h += '<div class="nfl-ft-stats">';
				h += '<div class="nfl-ft-stat"><div class="nfl-ft-stat-label">Status</div><div class="nfl-ft-stat-val">' +
					(live ? self._statusText(game) : final ? "Final" : self._fmtDateShort(game.date).time || "—") +
					"</div></div>";
				h += '<div class="nfl-ft-stat"><div class="nfl-ft-stat-label">' + (opts.showVenue ? "Venue" : "Detail") +
					'</div><div class="nfl-ft-stat-val">' + (opts.showVenue && venue ? venue : detail || "—") + "</div></div>";
				h += '<div class="nfl-ft-stat"><div class="nfl-ft-stat-label">TV</div><div class="nfl-ft-stat-val">' +
					(opts.showBroadcasts && broadcasts ? broadcasts : "—") + "</div></div></div>";
			}
		}

		if (opts.showNextFooter && opts.nextDto && (live || final)) {
			var nd = opts.nextDto;
			var oppAbbr = "";
			if (nd.home && nd.away) {
				var favIsHome = !!(nd.home && nd.home.isFavorite);
				oppAbbr = favIsHome ? (nd.away.abbr || "") : (nd.home.abbr || "");
			}
			var when = self._fmtDate(nd.date);
			var venueName = typeof nd.venue === "string" ? nd.venue : "";
			h += '<div class="nfl-ft-footer"><div class="nfl-ft-footer-label">Next</div>';
			if (opts.showLogos && oppAbbr) {
				h += '<img class="nfl-ft-footer-opp" src="' + self._logoUrl(oppAbbr, 22) +
					'" alt="" onerror="this.style.display=\'none\'">';
			}
			h += '<div class="nfl-ft-footer-body">' + when + (oppAbbr ? " · " + oppAbbr : "") +
				(venueName ? " · " + venueName : "") + "</div></div>";
		}

		h += "</div></div>";
		return h;
	},

	_viewDtoToGame: function (dto) {
		if (!dto) return null;
		var home = dto.home || {};
		var away = dto.away || {};
		return {
			id: dto.id, name: dto.name, shortName: dto.shortName, date: dto.date,
			week: dto.week, seasonYear: dto.seasonYear, broadcasts: dto.broadcasts || "",
			venue: typeof dto.venue === "string" ? { fullName: dto.venue } : dto.venue || {},
			status: {
				state: dto.status || "pre", displayClock: dto.clock || "", period: dto.period || 0,
				detail: dto.detail || "", completed: !!dto.completed,
			},
			home: {
				teamId: home.id || "", abbreviation: home.abbr || "", displayName: home.name || "",
				score: home.score || "", winner: !!home.winner, isFavorite: !!home.isFavorite,
			},
			away: {
				teamId: away.id || "", abbreviation: away.abbr || "", displayName: away.name || "",
				score: away.score || "", winner: !!away.winner, isFavorite: !!away.isFavorite,
			},
		};
	},

	createSchedule: function (wid, view, data, style) {
		var $div = $("#" + wid);
		if (!$div.length) {
			return setTimeout(function () {
				vis.binds["nfl"].createSchedule(wid, view, data, style);
			}, 100);
		}

		var self = vis.binds["nfl"];
		var instance = (data.instance || "nfl.0").trim();
		var mode = data.scheduleMode || "upcoming";
		var maxGames = Math.max(1, parseInt(data.maxGames, 10) || 12);
		var showLogos = self._bool(data.showLogos, true);
		var showHeader = self._bool(data.showHeader, true);
		var showVenue = self._bool(data.showVenue, true);
		var density = data.density || "comfortable";
		var bg = data.bgColor || "#0D1B2A";
		var fg = data.textColor || "#F5F7FA";
		var accent = data.accentColor || "#FFD166";
		var stateId = mode === "favorites"
			? instance + ".views.schedule.favoritesUpcoming"
			: instance + ".views.schedule.upcoming";

		var render = function () {
			vis.conn.getStates([stateId], function (err, states) {
				var list = [];
				try {
					var raw = states && states[stateId] && states[stateId].val;
					list = JSON.parse(raw || "[]");
					if (!Array.isArray(list)) list = [];
				} catch (e) { list = []; }
				if (list.length > maxGames) list = list.slice(0, maxGames);

				var densClass = density === "compact" ? " nfl-compact" : "";
				var h = '<div class="nfl-sch' + densClass + '" style="' + self._shellStyle(bg, fg, accent) + '">';
				if (showHeader) {
					h += '<div class="nfl-sb-hdr"><span class="nfl-sb-title" style="color:' + accent + '">' +
						(mode === "favorites" ? "Upcoming Favorites" : "NFL Schedule") + "</span>";
					h += '<span class="nfl-dim" style="font-size:11px">' + list.length + " games</span></div>";
				}
				if (!list.length) {
					h += '<div class="nfl-empty">' +
						(mode === "favorites"
							? "No upcoming favorite games.<br><small>Set favorites in adapter admin.</small>"
							: "No upcoming games.<br><small>Enable schedule polling in adapter admin.</small>") +
						"</div>";
				} else {
					h += '<div class="nfl-sb-list">';
					for (var i = 0; i < list.length; i++) {
						var game = self._viewDtoToGame(list[i]);
						if (!game) continue;
						var when = self._fmtDateShort(game.date);
						var aw = game.away || {};
						var hm = game.home || {};
						var venue = (game.venue && game.venue.fullName) || "";
						h += '<div class="nfl-sch-row"><div class="nfl-sch-when"><strong>' + when.day +
							"</strong>" + when.time + '</div><div class="nfl-sch-match"><div class="nfl-sch-teams">';
						if (showLogos && aw.abbreviation) {
							h += '<img class="nfl-logo" style="width:28px;height:28px" src="' +
								self._logoUrl(aw.abbreviation, 28) + '" alt="" onerror="this.style.display=\'none\'">';
						}
						h += "<span>" + (aw.abbreviation || "—") + '</span><span class="nfl-vs">vs</span><span>' +
							(hm.abbreviation || "—") + "</span>";
						if (showLogos && hm.abbreviation) {
							h += '<img class="nfl-logo" style="width:28px;height:28px" src="' +
								self._logoUrl(hm.abbreviation, 28) + '" alt="" onerror="this.style.display=\'none\'">';
						}
						h += "</div>";
						if (showVenue && venue) h += '<div class="nfl-sch-venue">' + venue + "</div>";
						h += '</div><span class="nfl-badge nfl-badge-upcoming">UPCOMING</span></div>';
					}
					h += "</div>";
				}
				h += "</div>";
				$div.html(h);
			});
		};

		render();
		if (self._timers[wid]) clearInterval(self._timers[wid]);
		self._timers[wid] = setInterval(render, 60000);
	},
};

vis.binds["nfl"].version && console.log("Version nfl: " + vis.binds["nfl"].version);
