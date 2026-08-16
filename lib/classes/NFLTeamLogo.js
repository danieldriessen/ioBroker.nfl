// lib/classes/NFLTeamLogo.js

"use strict";

// Import required modules
const axios = require("axios");
const path = require("path");

// Define enumerators
const NFLTeamLogoTypes = Object.freeze({
	Default_Logo: 0,
	Default_Logo_Dark: 1,
	Scoreboard_Logo: 3,
	Scoreboard_Logo_Dark: 4,
});

class NFLTeamLogo {
	constructor(url, alternativeURL, width, height, isDefaultLogo, isFullLogo, isDarkLogo, isScoreboardLogo, localCopyMetaStorageSubPath) {
		this.url = this._validateURL(url, "url");
		this.alternativeURL = this._validateAlternativeURL(alternativeURL, "alternativeURL");
		this.width = this._validateNumber(width, "width");
		this.height = this._validateNumber(height, "height");
		this.isDefaultLogo = this._validateBoolean(isDefaultLogo, "isDefaultLogo");
		this.isFullLogo = this._validateBoolean(isFullLogo, "isFullLogo");
		this.isDarkLogo = this._validateBoolean(isDarkLogo, "isDarkLogo");
		this.isScoreboardLogo = this._validateBoolean(isScoreboardLogo, "isScoreboardLogo");
		this.localCopyMetaStorageSubPath = this._validateLocalCopyMetaStorageSubPath(localCopyMetaStorageSubPath, "localCopyMetaStorageSubPath");
		this.base64Image = null;
		this._base64LoadPromise = null;
	}

	_validateURL(value, fieldName) {
		try {
			new URL(value);
			return value;
		} catch (_) {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLTeamLogo' class) didn't receive a valid value of type URL! Received value: ${value}`);
		}
	}

	_validateAlternativeURL(value, fieldName) {
		if (value != null && value != "") {
			try {
				new URL(value);
				return value;
			} catch (_) {
				throw new TypeError(`Parameter '${fieldName}' (of the 'NFLTeamLogo' class) didn't receive a valid value of type URL! Received value: ${value}`);
			}
		}
		return value == null ? "" : value;
	}

	_validateNumber(value, fieldName) {
		if (typeof value !== "number" || value <= 0) {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLTeamLogo' class) didn't receive a positive value of type number!`);
		}
		return value;
	}

	_validateBoolean(value, fieldName) {
		if (typeof value !== "boolean") {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLTeamLogo' class) didn't receive a valid boolean value!`);
		}
		return value;
	}

	_validateLocalCopyMetaStorageSubPath(value, fieldName) {
		if (value == null || (typeof value === "string" && value.trim() !== "")) {
			return value;
		}
		throw new TypeError(`Parameter '${fieldName}' (of the 'NFLTeamLogo' class) didn't receive a valid string value or was not null!`);
	}

	_mimeTypeFromPathOrHeader(filePath, contentTypeHeader) {
		if (typeof contentTypeHeader === "string" && contentTypeHeader.startsWith("image/")) {
			const mime = contentTypeHeader.split(";")[0].trim();
			if (mime) {
				return mime;
			}
		}
		const extension = filePath ? path.extname(filePath).toLowerCase() : "";
		if (extension === ".jpg" || extension === ".jpeg") {
			return "image/jpeg";
		}
		if (extension === ".gif") {
			return "image/gif";
		}
		if (extension === ".webp") {
			return "image/webp";
		}
		if (extension === ".svg") {
			return "image/svg+xml";
		}
		return "image/png";
	}

	_toDataUri(buffer, mimeType) {
		return `data:${mimeType};base64,${Buffer.from(buffer).toString("base64")}`;
	}

	/**
	 * Lazily loads base64Image once. Prefer a local adapter file buffer (no second HTTP download).
	 * Falls back to fetching `this.url`. Failures leave base64Image as null (no throw to callers that prefer soft-fail).
	 *
	 * @param {{ localFileBuffer?: Buffer|Uint8Array|string, contentType?: string }} [options]
	 * @returns {Promise<string|null>}
	 */
	async ensureBase64Image(options = {}) {
		if (this.base64Image) {
			return this.base64Image;
		}
		if (this._base64LoadPromise) {
			return this._base64LoadPromise;
		}

		this._base64LoadPromise = (async () => {
			try {
				if (options.localFileBuffer != null) {
					const mimeType = this._mimeTypeFromPathOrHeader(this.localCopyMetaStorageSubPath, options.contentType);
					this.base64Image = this._toDataUri(options.localFileBuffer, mimeType);
					return this.base64Image;
				}

				const response = await axios.get(this.url, { responseType: "arraybuffer", timeout: 15000 });
				const mimeType = this._mimeTypeFromPathOrHeader(this.localCopyMetaStorageSubPath || this.url, response.headers && response.headers["content-type"]);
				this.base64Image = this._toDataUri(response.data, mimeType);
				return this.base64Image;
			} catch (_) {
				this.base64Image = null;
				return null;
			} finally {
				this._base64LoadPromise = null;
			}
		})();

		return this._base64LoadPromise;
	}

	static getHumanReadableNFLTeamLogoType(nflTeamLogo) {
		if (!(nflTeamLogo instanceof NFLTeamLogo)) {
			throw new TypeError(`Parameter 'nflTeamLogo' (of function 'getHumanReadableNFLTeamLogoType') must be an instance of 'NFLTeamLogo'`);
		}

		if (nflTeamLogo.isDefaultLogo && nflTeamLogo.isFullLogo && !nflTeamLogo.isDarkLogo && !nflTeamLogo.isScoreboardLogo) {
			return "Default Logo";
		} else if (!nflTeamLogo.isDefaultLogo && nflTeamLogo.isFullLogo && nflTeamLogo.isDarkLogo && !nflTeamLogo.isScoreboardLogo) {
			return "Default Logo (Dark)";
		} else if (!nflTeamLogo.isDefaultLogo && nflTeamLogo.isFullLogo && !nflTeamLogo.isDarkLogo && nflTeamLogo.isScoreboardLogo) {
			return "Scoreboard Logo";
		} else if (!nflTeamLogo.isDefaultLogo && nflTeamLogo.isFullLogo && nflTeamLogo.isDarkLogo && nflTeamLogo.isScoreboardLogo) {
			return "Scoreboard (Dark)";
		}
		return "UNKNOWN";
	}
}

module.exports = { NFLTeamLogo, NFLTeamLogoTypes };
