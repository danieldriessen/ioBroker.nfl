/*
	ioBroker.vis nfl Widget-Set

	version: "0.0.1"

	Copyright 2024-2026 Daniel Drießen daniel.driessen@ddproductions.de
*/
/* global $, vis */
"use strict";

// ─── Translation dictionary for edit-mode labels ──────────────────────────────
$.extend(true, systemDictionary, {
	"nfl_instance":       { en: "Adapter instance",           de: "Adapter-Instanz" },
	"nfl_mode":           { en: "Games to show",              de: "Angezeigte Spiele" },
	"nfl_scheduleMode":   { en: "Schedule list",              de: "Spielplan-Liste" },
	"nfl_favoriteOnly":   { en: "Favorite team only",         de: "Nur Lieblingsteam" },
	"nfl_maxGames":       { en: "Max. games shown",           de: "Max. angezeigte Spiele" },
	"nfl_showLogos":      { en: "Show team logos",            de: "Teamlogos anzeigen" },
	"nfl_bgColor":        { en: "Background color",           de: "Hintergrundfarbe" },
	"nfl_textColor":      { en: "Text color",                 de: "Textfarbe" },
	"nfl_accentColor":    { en: "Accent / score color",       de: "Akzent- / Ergebnisfarbe" },
	"nfl_group_data":     { en: "Data source",                de: "Datenquelle" },
	"nfl_group_filter":   { en: "Filters",                    de: "Filter" },
	"nfl_group_style":    { en: "Appearance",                 de: "Erscheinungsbild" },
});

// ─── Widget namespace ─────────────────────────────────────────────────────────
vis.binds["nfl"] = {
	version: "0.0.1",

	/** Per-widget refresh timers keyed by widget ID. */
	_timers: {},

	/**
	 * Called by VIS-1 when a widget is removed from the view.
	 * Clears the refresh timer so stale intervals don't pile up.
	 * @param {string} wid
	 */
	destroy: function (wid) {
		if (vis.binds["nfl"]._timers[wid]) {
			clearInterval(vis.binds["nfl"]._timers[wid]);
			delete vis.binds["nfl"]._timers[wid];
		}
	},

	// ── Helpers ──────────────────────────────────────────────────────────────

	/**
	 * Returns the ESPN CDN scoreboard logo URL for a given team abbreviation.
	 * Sized to `sz × sz` pixels (default 36).
	 * @param {string} abbrev  e.g. "PIT"
	 * @param {number} [sz=36]
	 * @returns {string}
	 */
	_logoUrl: function (abbrev, sz) {
		if (!abbrev) return "";
		return (
			"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/scoreboard/" +
			abbrev.toLowerCase() +
			".png&w=" + (sz || 36) + "&h=" + (sz || 36) + "&scale=crop"
		);
	},

	/**
	 * Formats an ISO date string as a short localized game-time string.
	 * Output example: "Sun, Sep 7  1:00 PM"
	 * @param {string} iso
	 * @returns {string}
	 */
	_fmtDate: function (iso) {
		if (!iso) return "";
		var d = new Date(iso);
		if (isNaN(d.getTime())) return iso;
		var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
		var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		var h = d.getHours(), m = d.getMinutes();
		var ampm = h >= 12 ? "PM" : "AM";
		h = h % 12 || 12;
		return days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate() +
			"  " + h + ":" + (m < 10 ? "0" + m : m) + " " + ampm;
	},

	/**
	 * Returns a human-readable game status string.
	 * Live:  "Q2  5:32"   Final: "Final" / "OT"   Pre: ""
	 * @param {Object} game
	 * @returns {string}
	 */
	_statusText: function (game) {
		var st = game.status || {};
		if (st.state === "in") {
			var p = st.period;
			var label = p <= 4 ? "Q" + p : (p === 5 ? "OT" : p + "OT");
			return [label, st.displayClock].filter(Boolean).join("  ");
		}
		if (st.state === "post") {
			return st.detail || "Final";
		}
		return "";
	},

	/**
	 * Parses a flat ioBroker states object into an array of game objects.
	 * Keys like "{instance}.nfl-games.current.{eventId}.home.score" are decomposed.
	 * @param {Object} states  Raw vis.conn.getStates result
	 * @param {string} instance  e.g. "nfl.0"
	 * @returns {Array<Object>}
	 */
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
				games[eventId] = {
					id: eventId,
					status: {},
					home: {},
					away: {},
				};
			}

			var subKey = rest.substring(firstDot + 1);
			var val = states[key] ? states[key].val : null;
			var parts = subKey.split(".");

			if (parts.length === 1) {
				games[eventId][parts[0]] = val;
			} else if (parts.length === 2) {
				if (!games[eventId][parts[0]]) games[eventId][parts[0]] = {};
				games[eventId][parts[0]][parts[1]] = val;
			}
		}

		return Object.values(games).sort(function (a, b) {
			return (a.date || "") < (b.date || "") ? -1 : 1;
		});
	},

	/**
	 * Reads all nfl-games.current states for one adapter instance.
	 * Strategy: read currentEventIds (or legacy eventIds) first, then bulk-read game fields.
	 * @param {string} instance
	 * @param {function(Object)} callback  called with the flat states object
	 */
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
			if (err || !infoStates) { callback({}); return; }

			var eventIdsRaw =
				(infoStates[instance + ".nfl-games.info.currentEventIds"]) ||
				(infoStates[instance + ".nfl-games.info.eventIds"]);
			var eventIds = [];
			try {
				eventIds = JSON.parse((eventIdsRaw && eventIdsRaw.val) || "[]");
			} catch (e) {
				// malformed JSON — just use empty list
			}

			if (!eventIds.length) { callback(infoStates || {}); return; }

			// Build the full list of per-game state IDs
			var GAME_FIELDS = [
				"name", "shortName", "date",
				"status.state", "status.period", "status.displayClock",
				"status.detail", "status.completed",
				"home.teamId", "home.abbreviation", "home.displayName",
				"home.score", "home.winner", "home.isFavorite",
				"away.teamId", "away.abbreviation", "away.displayName",
				"away.score", "away.winner", "away.isFavorite",
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

	// ── Scoreboard widget ─────────────────────────────────────────────────────

	/**
	 * Creates and manages the NFL Scoreboard widget.
	 * @param {string} wid
	 * @param {string} view
	 * @param {Object} data  Widget attrs
	 * @param {Object} style
	 */
	createScoreboard: function (wid, view, data, style) {
		var $div = $("#" + wid);
		if (!$div.length) {
			return setTimeout(function () {
				vis.binds["nfl"].createScoreboard(wid, view, data, style);
			}, 100);
		}

		var self = vis.binds["nfl"];
		var instance  = (data.instance || "nfl.0").trim();
		var mode      = data.mode || "all";          // all | live | upcoming
		var favOnly   = data.favoriteOnly === true || data.favoriteOnly === "true";
		var maxGames  = Math.max(1, parseInt(data.maxGames, 10) || 10);
		var showLogos = !(data.showLogos === false || data.showLogos === "false");
		var bg        = data.bgColor    || "#0d1117";
		var fg        = data.textColor  || "#e6edf3";
		var accent    = data.accentColor|| "#c8a94e";

		var render = function () {
			self._loadStates(instance, function (states) {
				var games = self._parseGames(states, instance);

				if (mode === "live")     games = games.filter(function (g) { return g.status.state === "in"; });
				else if (mode === "upcoming") games = games.filter(function (g) { return g.status.state === "pre"; });

				if (favOnly) games = games.filter(function (g) { return g.home.isFavorite || g.away.isFavorite; });
				if (games.length > maxGames) games = games.slice(0, maxGames);

				var liveCount = games.filter(function (g) { return g.status.state === "in"; }).length;
				var weekNum   = (states[instance + ".nfl-games.info.week"] || {}).val || "";
				var seasonYr  = (states[instance + ".nfl-games.info.seasonYear"] || {}).val || "";

				var h = '<div class="nfl-sb" style="background:' + bg + ';color:' + fg + '">';

				// ── Header ──────────────────────────────────────────────────
				h += '<div class="nfl-sb-hdr" style="border-bottom:1px solid ' + accent + '28">';
				h += '<span class="nfl-sb-title" style="color:' + accent + '">🏈 NFL';
				if (weekNum)  h += '&nbsp;&nbsp;<span class="nfl-dim">Week&nbsp;' + weekNum + '</span>';
				if (seasonYr) h += '&nbsp;<span class="nfl-dim">' + seasonYr + '</span>';
				h += '</span>';
				if (liveCount > 0) {
					h += '<span class="nfl-live-badge" style="background:' + accent + ';color:#000">' +
						'<span class="nfl-dot-anim"></span>' + liveCount + '&nbsp;LIVE</span>';
				}
				h += '</div>';

				// ── Game list ────────────────────────────────────────────────
				if (!games.length) {
					h += '<div class="nfl-empty" style="color:' + fg + '88">No games to show</div>';
				} else {
					h += '<div class="nfl-sb-list">';
					for (var i = 0; i < games.length; i++) {
						h += self._gameRow(games[i], showLogos, bg, fg, accent);
					}
					h += '</div>';
				}

				h += '</div>'; // .nfl-sb
				$div.html(h);
			});
		};

		render();

		// Refresh every 31 s (adapter polls live games at ≤ 30 s)
		if (self._timers[wid]) clearInterval(self._timers[wid]);
		self._timers[wid] = setInterval(render, 31000);
	},

	/**
	 * Renders one game row for the Scoreboard widget.
	 * @private
	 */
	_gameRow: function (game, showLogos, bg, fg, accent) {
		var self  = vis.binds["nfl"];
		var state = game.status.state;
		var live  = state === "in";
		var final = state === "post";
		var pre   = state === "pre";
		var rowBg = live ? (bg === "#0d1117" ? "#161b22" : "rgba(255,255,255,0.04)") : "transparent";

		var h = '<div class="nfl-row' + (live ? " nfl-row-live" : "") + '" style="background:' + rowBg + '">';

		// Status line
		h += '<div class="nfl-row-status">';
		if (live) {
			h += '<span class="nfl-live-line"><span class="nfl-dot-red"></span><span style="color:#ff5555">' +
				self._statusText(game) + '</span></span>';
		} else if (final) {
			h += '<span style="color:' + fg + '55;font-size:10px;letter-spacing:.06em">FINAL</span>';
		} else if (pre && game.date) {
			h += '<span style="color:' + fg + '77;font-size:10px">' + self._fmtDate(game.date) + '</span>';
		}
		h += '</div>';

		// Teams + scores
		h += '<div class="nfl-row-teams">';

		// Away
		var aw = game.away || {}, awFav = !!aw.isFavorite;
		h += '<div class="nfl-team">';
		if (showLogos && aw.abbreviation) {
			h += '<img class="nfl-logo" src="' + self._logoUrl(aw.abbreviation, 32) +
				'" alt="' + aw.abbreviation + '" onerror="this.style.display=\'none\'">';
		}
		h += '<span class="nfl-abbr' + (awFav ? ' nfl-abbr-fav' : '') + '"' +
			(awFav ? ' style="color:' + accent + '"' : '') + '>' + (aw.abbreviation || "—") + '</span>';
		h += '</div>';

		// Score block
		h += '<div class="nfl-score-blk">';
		if (live || final) {
			var as = aw.score !== undefined && aw.score !== "" ? aw.score : "0";
			var hs = (game.home || {}).score !== undefined && (game.home || {}).score !== "" ? (game.home || {}).score : "0";
			h += '<span class="nfl-score' + (aw.winner  ? " nfl-win" : "") + '" style="color:' + accent + '">' + as + '</span>';
			h += '<span class="nfl-sep" style="color:' + fg + '33">–</span>';
			h += '<span class="nfl-score' + ((game.home || {}).winner ? " nfl-win" : "") + '" style="color:' + accent + '">' + hs + '</span>';
		} else {
			h += '<span class="nfl-vs" style="color:' + fg + '44">vs</span>';
		}
		h += '</div>';

		// Home
		var hm = game.home || {}, hmFav = !!hm.isFavorite;
		h += '<div class="nfl-team nfl-team-r">';
		h += '<span class="nfl-abbr' + (hmFav ? ' nfl-abbr-fav' : '') + '"' +
			(hmFav ? ' style="color:' + accent + '"' : '') + '>' + (hm.abbreviation || "—") + '</span>';
		if (showLogos && hm.abbreviation) {
			h += '<img class="nfl-logo" src="' + self._logoUrl(hm.abbreviation, 32) +
				'" alt="' + hm.abbreviation + '" onerror="this.style.display=\'none\'">';
		}
		h += '</div>';

		h += '</div>'; // .nfl-row-teams
		h += '</div>'; // .nfl-row

		return h;
	},

	// ── Favorite Team widget ──────────────────────────────────────────────────

	/**
	 * Creates and manages the NFL Favorite Team focus card.
	 * @param {string} wid
	 * @param {string} view
	 * @param {Object} data
	 * @param {Object} style
	 */
	createFavoriteTeam: function (wid, view, data, style) {
		var $div = $("#" + wid);
		if (!$div.length) {
			return setTimeout(function () {
				vis.binds["nfl"].createFavoriteTeam(wid, view, data, style);
			}, 100);
		}

		var self      = vis.binds["nfl"];
		var instance  = (data.instance || "nfl.0").trim();
		var showLogos = !(data.showLogos === false || data.showLogos === "false");
		var bg        = data.bgColor    || "#0d1117";
		var fg        = data.textColor  || "#e6edf3";
		var accent    = data.accentColor|| "#c8a94e";

		var render = function () {
			self._loadStates(instance, function (states) {
				var games = self._parseGames(states, instance);

				// Pick best favorite-team game: live > upcoming > last played
				var liveG = null, nextG = null, lastG = null;
				for (var i = 0; i < games.length; i++) {
					var g = games[i];
					if (!(g.home.isFavorite || g.away.isFavorite)) continue;
					var s = g.status.state;
					if (s === "in"  && !liveG) liveG = g;
					if (s === "pre" && !nextG) nextG = g;
					if (s === "post")          lastG = g;
				}
				var game = liveG || nextG || lastG;

				var h = '<div class="nfl-ft" style="background:' + bg + ';color:' + fg + '">';

				if (!game) {
					// No favorite team configured or no matching game
					h += '<div class="nfl-ft-hdr" style="border-bottom:1px solid ' + accent + '28">';
					h += '<span style="color:' + accent + ';font-weight:700">⭐ Favorite Team</span></div>';
					h += '<div class="nfl-empty" style="color:' + fg + '77">';
					h += 'No favorite team configured.<br>';
					h += '<small style="opacity:.55">Set a favorite team in the adapter admin settings.</small>';
					h += '</div>';
				} else {
					var isHome  = !!(game.home.isFavorite);
					var my      = isHome ? game.home : game.away;
					var opp     = isHome ? game.away : game.home;
					var live    = game.status.state === "in";
					var final   = game.status.state === "post";

					// Header
					h += '<div class="nfl-ft-hdr" style="border-bottom:1px solid ' + accent + '28">';
					h += '<span style="color:' + accent + ';font-weight:700">⭐ ' + (my.displayName || "My Team") + '</span>';
					if (live) {
						h += '<span class="nfl-live-badge" style="background:' + accent + ';color:#000">' +
							'<span class="nfl-dot-anim"></span>LIVE</span>';
					}
					h += '</div>';

					// Body
					h += '<div class="nfl-ft-body">';

					// My team logo
					if (showLogos && my.abbreviation) {
						h += '<div class="nfl-ft-logo-wrap">';
						h += '<img class="nfl-ft-logo" src="' + self._logoUrl(my.abbreviation, 80) +
							'" alt="' + my.abbreviation + '" onerror="this.style.display=\'none\'">';
						h += '</div>';
					}

					if (live || final) {
						// Status / clock
						if (live) {
							h += '<div class="nfl-ft-clock" style="color:' + fg + '88">' +
								self._statusText(game) + '</div>';
						} else {
							h += '<div class="nfl-ft-label" style="color:' + fg + '55">FINAL</div>';
						}

						// Big score display
						h += '<div class="nfl-ft-scores">';

						h += '<div class="nfl-ft-side">';
						h += '<div class="nfl-ft-abbr" style="color:' + fg + '77">' + (my.abbreviation || "") + '</div>';
						h += '<div class="nfl-ft-big" style="color:' + accent + ';' +
							(my.winner ? "text-shadow:0 0 12px " + accent + "66" : "") + '">' +
							(my.score || "0") + '</div>';
						h += '</div>';

						h += '<div class="nfl-ft-dash" style="color:' + fg + '25">–</div>';

						h += '<div class="nfl-ft-side">';
						h += '<div class="nfl-ft-abbr" style="color:' + fg + '77">' + (opp.abbreviation || "") + '</div>';
						h += '<div class="nfl-ft-big" style="color:' + accent + ';' +
							(opp.winner ? "text-shadow:0 0 12px " + accent + "66" : "") + '">' +
							(opp.score || "0") + '</div>';
						h += '</div>';

						h += '</div>'; // .nfl-ft-scores

						// Opponent info
						h += '<div class="nfl-ft-opp" style="color:' + fg + '77">';
						if (showLogos && opp.abbreviation) {
							h += '<img class="nfl-ft-opp-logo" src="' + self._logoUrl(opp.abbreviation, 22) +
								'" alt="" onerror="this.style.display=\'none\'">&nbsp;';
						}
						h += (isHome ? "vs " : "@ ") + (opp.displayName || opp.abbreviation || "");
						h += '</div>';

					} else {
						// Upcoming game
						h += '<div class="nfl-ft-label" style="color:' + fg + '55">NEXT GAME</div>';
						h += '<div class="nfl-ft-date" style="color:' + accent + '">' + self._fmtDate(game.date) + '</div>';
						h += '<div class="nfl-ft-opp" style="color:' + fg + '">';
						if (showLogos && opp.abbreviation) {
							h += '<img class="nfl-ft-opp-logo" src="' + self._logoUrl(opp.abbreviation, 28) +
								'" alt="" onerror="this.style.display=\'none\'">&nbsp;';
						}
						h += (isHome ? "vs&nbsp;" : "@&nbsp;") + (opp.displayName || opp.abbreviation || "TBD");
						h += '</div>';
					}

					h += '</div>'; // .nfl-ft-body
				}

				h += '</div>'; // .nfl-ft
				$div.html(h);
			});
		};

		render();

		if (self._timers[wid]) clearInterval(self._timers[wid]);
		self._timers[wid] = setInterval(render, 31000);
	},

	/**
	 * Maps a compact view-JSON game DTO into the shape expected by `_gameRow`.
	 * @param {Object} dto
	 * @returns {Object}
	 */
	_viewDtoToGame: function (dto) {
		if (!dto) return null;
		var home = dto.home || {};
		var away = dto.away || {};
		return {
			id: dto.id,
			name: dto.name,
			shortName: dto.shortName,
			date: dto.date,
			week: dto.week,
			seasonYear: dto.seasonYear,
			status: {
				state: dto.status || "pre",
				displayClock: dto.clock || "",
				period: dto.period || 0,
				detail: dto.detail || "",
				completed: !!dto.completed,
			},
			home: {
				teamId: home.id || "",
				abbreviation: home.abbr || "",
				displayName: home.name || "",
				score: home.score || "",
				winner: !!home.winner,
				isFavorite: !!home.isFavorite,
			},
			away: {
				teamId: away.id || "",
				abbreviation: away.abbr || "",
				displayName: away.name || "",
				score: away.score || "",
				winner: !!away.winner,
				isFavorite: !!away.isFavorite,
			},
		};
	},

	// ── Schedule widget ───────────────────────────────────────────────────────

	/**
	 * Multi-week upcoming schedule list (reads views.schedule.* JSON mirrors).
	 * @param {string} wid
	 * @param {string} view
	 * @param {Object} data
	 * @param {Object} style
	 */
	createSchedule: function (wid, view, data, style) {
		var $div = $("#" + wid);
		if (!$div.length) {
			return setTimeout(function () {
				vis.binds["nfl"].createSchedule(wid, view, data, style);
			}, 100);
		}

		var self = vis.binds["nfl"];
		var instance = (data.instance || "nfl.0").trim();
		var mode = data.scheduleMode || "upcoming"; // upcoming | favorites
		var maxGames = Math.max(1, parseInt(data.maxGames, 10) || 12);
		var showLogos = !(data.showLogos === false || data.showLogos === "false");
		var bg = data.bgColor || "#0d1117";
		var fg = data.textColor || "#e6edf3";
		var accent = data.accentColor || "#c8a94e";

		var stateId =
			mode === "favorites"
				? instance + ".views.schedule.favoritesUpcoming"
				: instance + ".views.schedule.upcoming";

		var render = function () {
			vis.conn.getStates([stateId, instance + ".views.schedule.upcomingCount"], function (err, states) {
				var list = [];
				try {
					var raw = states && states[stateId] && states[stateId].val;
					list = JSON.parse(raw || "[]");
					if (!Array.isArray(list)) list = [];
				} catch (e) {
					list = [];
				}
				if (list.length > maxGames) list = list.slice(0, maxGames);

				var games = [];
				for (var i = 0; i < list.length; i++) {
					var g = self._viewDtoToGame(list[i]);
					if (g) games.push(g);
				}

				var h = '<div class="nfl-sb nfl-sch" style="background:' + bg + ';color:' + fg + '">';
				h += '<div class="nfl-sb-hdr" style="border-bottom:1px solid ' + accent + '28">';
				h += '<span class="nfl-sb-title" style="color:' + accent + '">';
				h += mode === "favorites" ? "⭐ Upcoming Favorites" : "📅 NFL Schedule";
				h += '</span>';
				h += '<span class="nfl-dim" style="font-size:11px">' + games.length + " game" + (games.length === 1 ? "" : "s") + "</span>";
				h += "</div>";

				if (!games.length) {
					h += '<div class="nfl-empty" style="color:' + fg + '88">';
					if (mode === "favorites") {
						h += "No upcoming favorite games.<br><small style=\"opacity:.55\">Set favorites in adapter admin, or wait for schedule refresh.</small>";
					} else {
						h += "No upcoming games.<br><small style=\"opacity:.55\">Enable schedule polling in adapter admin.</small>";
					}
					h += "</div>";
				} else {
					h += '<div class="nfl-sb-list">';
					for (var j = 0; j < games.length; j++) {
						h += self._gameRow(games[j], showLogos, bg, fg, accent);
					}
					h += "</div>";
				}

				h += "</div>";
				$div.html(h);
			});
		};

		render();

		// Schedule changes slowly — refresh once a minute
		if (self._timers[wid]) clearInterval(self._timers[wid]);
		self._timers[wid] = setInterval(render, 60000);
	},
};

vis.binds["nfl"].version && console.log("Version nfl: " + vis.binds["nfl"].version);
