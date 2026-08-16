![Logo](admin/nfl.png)
# ioBroker.nfl

[![NPM version](https://img.shields.io/npm/v/iobroker.nfl.svg)](https://www.npmjs.com/package/iobroker.nfl)
[![Downloads](https://img.shields.io/npm/dm/iobroker.nfl.svg)](https://www.npmjs.com/package/iobroker.nfl)
![Number of Installations](http://iobroker.live/badges/nfl-installed.svg)
![Number of Installations](http://iobroker.live/badges/nfl-stable.svg)
[![NPM](https://nodei.co/npm/iobroker.nfl.png?downloads=true)](https://nodei.co/npm/iobroker.nfl/)

![Test and Release](https://github.com/danieldriessen/ioBroker.nfl/workflows/Test%20and%20Release/badge.svg)

## Description

ioBroker adapter that fetches NFL team information (and, planned later, scores and live game updates) from public ESPN sports APIs and exposes it as ioBroker objects and files.

## Features

### Currently available (work in progress)

* Load the NFL team list from ESPN
* Download and store selected team logo variants in the adapter file store
* Create an ioBroker object tree under `nfl-teams.*` (team info, colors, logos)
* Enrich teams with division and venue data (including venue images) where available

### Not implemented yet

* Game schedules / scoreboards
* Live scores and periodic refresh while games are in progress
* Favorite team configuration
* Production VIS-1 widgets (live / schedule / favorite — template stub only today)
* Meaningful admin configuration (placeholder options only)

## Requirements

* Node.js `>= 18` (see `package.json` `engines`)
* js-controller `>= 5.0.19`
* admin `>= 6.17.13`
* Optional: `vis` (listed for future widgets; not required for team data)

## Configuration

The admin UI still contains placeholder options from the adapter scaffold (`option1` / `option2`). They are not used by the adapter logic yet.

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
* (Daniel Drießen) Team data, logos, division/venue enrichment (ongoing)
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
