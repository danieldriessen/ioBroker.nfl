// lib/classes/NFLTeamLogo.js

"use strict";

// Import required modules
const axios = require("axios");

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

		// Automatically create the base64 string from the image URL
		this._initializeBase64Image();
	}

	_validateURL(value, fieldName) {
		try {
			new URL(value);
			return value;
		} catch (_) {
			throw new TypeError(`Paramter '${fieldName}' (of the 'NFLTeamLogo' class) didn't receive a valid value of type URL! Received value: ${value}`);
		}
	}

	_validateAlternativeURL(value, fieldName) {
		if (value != null && value != "") {
			try {
				new URL(value);
				return value;
			} catch (_) {
				throw new TypeError(`Paramter '${fieldName}' (of the 'NFLTeamLogo' class) didn't receive a valid value of type URL! Received value: ${value}`);
			}
		}
	}

	_validateNumber(value, fieldName) {
		if (typeof value !== "number" || value <= 0) {
			throw new TypeError(`Paraneter '${fieldName}' (of the 'NFLTeamLogo' class) didn't receive a positive value of type number!`);
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
		} else {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLTeamLogo' class) didn't receive a valid string value or was not null!`);
		}
	}

	async _createBase64StringFromImageFileAtURL(imageURL) {
		try {
			const response = await axios.get(imageURL, {
				responseType: "arraybuffer", // Ensure the response is in binary format
			});

			const buffer = Buffer.from(response.data, "binary");
			const base64String = buffer.toString("base64");
			const base64ImageRepresentation = `data:image/png;base64,${base64String}`;

			return base64ImageRepresentation;
		} catch (error) {
			throw new Error(`Error while creating base64 string from image at URL '${imageURL}': ${error.message}`);
		}
	}

	async _initializeBase64Image() {
		try {
			this.base64Image = await this._createBase64StringFromImageFileAtURL(this.url);
		} catch (error) {
			throw new Error(`Error while instantiating 'NFLTeamLogo' object: Failed to initialize base64-image from Image-URL: ${error.message}`);
		}
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
		} else {
			return "UNKNOWN";
		}
	}
}

module.exports = { NFLTeamLogo, NFLTeamLogoTypes };
