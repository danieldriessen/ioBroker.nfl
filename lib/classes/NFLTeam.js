// lib/classes/NFLTeam.js

"use strict";

// Import required class
const { NFLTeamLogo, NFLTeamLogoTypes } = require("./NFLTeamLogo");

class NFLTeam {
	constructor(id, uid, slug, abbreviation, displayName, shortDisplayName, name, nickname, location, color, alternateColor, isActive, isAllStar, teamLogos) {
		this.id = this._validateNumber(id, "id");
		this.uid = this._validateUID(uid, "uid");
		this.slug = this._validateString(slug, "slug");
		this.abbreviation = this._validateAbbreviation(abbreviation, "abbreviation");
		this.displayName = this._validateString(displayName, "displayName");
		this.shortDisplayName = this._validateString(shortDisplayName, "shortDisplayName");
		this.name = this._validateString(name, "name");
		this.nickname = this._validateString(nickname, "nickname");
		this.location = this._validateString(location, "location");
		this.color = this._validateColor(color, "color");
		this.alternateColor = this._validateColor(alternateColor, "alternateColor");
		this.isActive = this._validateBoolean(isActive, "isActive");
		this.isAllStar = this._validateBoolean(isAllStar, "isAllStar");
		this.teamLogos = this._validateTeamLogosArray(teamLogos, "teamLogos");
	}

	_validateNumber(value, fieldName) {
		if (typeof value !== "number" || value <= 0) {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLTeam' class) didn't receive a positive value of type number!`);
		}
		return value;
	}

	_validateUID(value, fieldName) {
		const uidPattern = /^s:\d+~l:\d+~t:\d+$/;
		if (typeof value !== "string" || !uidPattern.test(value)) {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLTeam' class) didn't receive a valid UID string (e.g., 's:20~l:28~t:1')!`);
		}
		return value;
	}

	_validateString(value, fieldName) {
		if (typeof value !== "string" || value.trim() === "") {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLTeam' class) didn't receive a valid (non-empty) string!`);
		}
		return value;
	}

	_validateAbbreviation(value, fieldName) {
		const abbreviationPattern = /^[A-Z]{2,4}$/;
		if (typeof value !== "string" || !abbreviationPattern.test(value)) {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLTeam' class) didn't receive a valid abbreviation string (2-4 uppercase letters)!`);
		}
		return value;
	}

	_validateColor(value, fieldName) {
		const colorPattern = /^#[0-9A-Fa-f]{6}$/;
		const alternativeColorPattern = /^[0-9A-Fa-f]{6}$/;
		if (typeof value !== "string" || (!colorPattern.test(value) && !alternativeColorPattern.test(value))) {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLTeam' class) didn't receive a valid hex color string (e.g., #RRGGBB)!`);
		}

		if (alternativeColorPattern.test(value)) {
			return "#" + value;
		} else {
			return value;
		}
	}

	_validateBoolean(value, fieldName) {
		if (typeof value !== "boolean") {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLTeam' class) didn't receive a valid boolean value!`);
		}
		return value;
	}

	_validateTeamLogosArray(value, fieldName) {
		if (!Array.isArray(value)) {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLTeam' class) didn't receive a valid array!`);
		}
		for (const item of value) {
			if (!(item instanceof NFLTeamLogo)) {
				throw new TypeError(`Parameter '${fieldName}' (of the 'NFLTeam' class) should only contain instances of 'NFLTeamLogo'!`);
			}
		}
		return value;
	}

	/**************************************************************************************************************************************
	 * Validates an array of NFL-Teams.
	 *
	 * @param {Array} nflTeams - The array of NFL teams to validate.
	 * @returns {boolean} - Returns true if the array is valid, otherwise throws an error.
	 * @throws {Error} - Throws an error if the array is empty, not an array, or contains elements that are not instances of the NFLTeam class.
	 **************************************************************************************************************************************/
	static validateNFLTeamsArray(nflTeams) {
		if (Array.isArray(nflTeams)) {
			if (nflTeams.length === 0) {
				const errorMessage = `Error while validating NFL-Teams array: Empty array!`;
				throw new Error(errorMessage);
			} else if (nflTeams.every((item) => item instanceof NFLTeam)) {
				return true;
			} else {
				const errorMessage = `Error while validating NFL-Teams array: Not all elements in the array are instances of 'NFLTeam' class!`;
				throw new Error(errorMessage);
			}
		} else {
			const errorMessage = `Error while validating NFL-Teams array: Not an array!`;
			throw new Error(errorMessage);
		}
	}

	/**************************************************************************************************************************************
	 * Retrieves the logo of an NFL-Team based on the specified logo type.
	 *
	 * @param {NFLTeam} nflTeam - The NFL team object whose logo is to be retrieved. Must be an instance of NFLTeam.
	 * @param {0 | 1 | 3 | 4} logoType - The type of logo to retrieve. Must be a valid value from NFLTeamLogoTypes.
	 *
	 * @returns {NFLTeamLogo|null} - Returns the matching NFLTeamLogo object if found, otherwise returns null.
	 *
	 * @throws {TypeError} - Throws a TypeError if 'nflTeam' is not an instance of NFLTeam or 'logoType' is not a valid type from NFLTeamLogoTypes.
	 **************************************************************************************************************************************/
	static getNFLTeamLogoOfType(nflTeam, logoType) {
		// Validate that 'nflTeam' is an instance of NFLTeam
		if (!(nflTeam instanceof NFLTeam)) {
			throw new TypeError(`Parameter 'nflTeam' (of the 'getNFLTeamLogoOfType' function) must be an instance of 'NFLTeam'`);
		}

		// Validate that 'logoType' is a valid property of NFLTeamLogoTypes
		const validLogoTypes = Object.values(NFLTeamLogoTypes);
		if (!validLogoTypes.includes(logoType)) {
			throw new TypeError(`Parameter 'logoType' (of the 'getNFLTeamLogoOfType' function) must be a valid type from 'NFLTeamLogoTypes'`);
		}

		// Find and return the appropriate logo based on the type
		for (const logo of nflTeam.teamLogos) {
			switch (logoType) {
				case NFLTeamLogoTypes.Default_Logo:
					if (logo.isDefaultLogo && logo.isFullLogo && !logo.isDarkLogo && !logo.isScoreboardLogo) {
						return logo;
					}
					break;
				case NFLTeamLogoTypes.Default_Logo_Dark:
					if (!logo.isDefaultLogo && logo.isFullLogo && logo.isDarkLogo && !logo.isScoreboardLogo) {
						return logo;
					}
					break;
				case NFLTeamLogoTypes.Scoreboard_Logo:
					if (!logo.isDefaultLogo && logo.isFullLogo && !logo.isDarkLogo && logo.isScoreboardLogo) {
						return logo;
					}
					break;
				case NFLTeamLogoTypes.Scoreboard_Logo_Dark:
					if (!logo.isDefaultLogo && logo.isFullLogo && logo.isDarkLogo && logo.isScoreboardLogo) {
						return logo;
					}
					break;
				default:
					break;
			}
		}

		// If no matching logo is found, return null
		return null;
	}
}

module.exports = NFLTeam;
