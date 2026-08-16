![Logo](admin/nfl.png)
# ioBroker.nfl

[![NPM version](https://img.shields.io/npm/v/iobroker.nfl.svg)](https://www.npmjs.com/package/iobroker.nfl)
[![Downloads](https://img.shields.io/npm/dm/iobroker.nfl.svg)](https://www.npmjs.com/package/iobroker.nfl)
![Number of Installations](http://iobroker.live/badges/nfl-installed.svg)
![Number of Installations](http://iobroker.live/badges/nfl-stable.svg)
[![NPM](https://nodei.co/npm/iobroker.nfl.png?downloads=true)](https://nodei.co/npm/iobroker.nfl/)

![Test and Release](https://github.com/danieldriessen/ioBroker.nfl/workflows/Test%20and%20Release/badge.svg)

## Description

ioBroker adapter that fetches NFL team information, live scores, and scoreboard data from public ESPN APIs and exposes them as ioBroker objects and files.

## Features

### Currently available (work in progress)

* Load the NFL team list from ESPN
* Download and store selected team logo variants in the adapter file store
* Create an ioBroker object tree under `nfl-teams.{espnTeamId}.*` (team info, colors, logos; slug is a state, not the folder key)
* Enrich teams with division and venue data (including venue images) where available
* Periodic scoreboard polling (ESPN CDN) writing `nfl-games.{eventId}.*` states: live scores, game clock, status, home/away teams
* Configurable live refresh interval (admin, default 30 s; auto 5 min when no games are live)
* Favorite team selection in admin (multi-select); `isFavorite` flag on each team object and on home/away per game
* **VIS-1 widget — NFL Scoreboard** (`tplNflScoreboard`): live/upcoming/all modes, favorite-filter, team logos (ESPN CDN), animated live indicator, dark-theme; auto-refreshes every 31 s
* **VIS-1 widget — NFL Favorite Team** (`tplNflFavoriteTeam`): single-team card showing live score + clock, next game countdown, or last result

### Not implemented yet

* Multi-week schedule endpoint (Scoreboard shows current week only)
* VIS-2 widgets (optional future add-on)

## Requirements

* Node.js `>= 18` (see `package.json` `engines`)
* js-controller `>= 5.0.19`
* admin `>= 6.17.13`
* Optional: `vis` (listed for future widgets; not required for team data)

## Configuration

| Setting | Default | Range | Description |
|---|---|---|---|
| **Favorite teams** | _(none)_ | any | Multi-select dropdown of all 32 NFL teams. Adapter writes `isFavorite` on team objects and per-game home/away states. |
| **Live scoreboard refresh interval (s)** | `30` | 15–300 | How often to poll the ESPN CDN scoreboard while games are in progress. Automatically slows to 5 min when no game is live. |

## Data source

Unofficial ESPN site/core HTTP APIs (no API key). Endpoints and payloads can change without notice. This project is not affiliated with ESPN or the NFL.

## Disclaimer

The developers of this module are in no way endorsed by or affiliated with the National Football League (NFL), ESPN, or any associated subsidiaries, logos, or trademarks.
The NFL and ESPN logos used in this adapter are for illustrative purposes only and are the property of their respective owners.
If there are any concerns regarding the use of copyrighted materials in this adapter, please feel free to contact the developers, and they will promptly address them.

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->

### **WORK IN PROGRESS**
* (Daniel Drießen) VIS-1 widgets: NFL Scoreboard and Favorite Team card
* (Daniel Drießen) ESPN CDN scoreboard polling loop; `nfl-games.*` live score objects; adaptive 30s/5min intervals
* (Daniel Drießen) Favorite-team admin multi-select; `isFavorite` states on team and game objects
* (Daniel Drießen) Team folders keyed by ESPN team id; dynamic division season year
* (Daniel Drießen) Team data, logos, division/venue enrichment
* (Daniel Drießen) initial release

## License
MIT License

Copyright (c) 2024-2026 Daniel Drießen <daniel.driessen@ddproductions.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
