// lib/classes/NFLVenue.js

"use strict";

// Import required class
const NFLVenueAddress = require("./NFLVenueAddress");
const NFLVenueImage = require("./NFLVenueImage");

class NFLVenue {
	constructor(id, fullName, venueAddress, grass, indoor, venueImages) {
		this.id = this._validateNumber(id, "id");
		this.fullName = this._validateString(fullName, "fullName");
		this.venueAddress = this._validateNFLVenueAddress(venueAddress, "venueAddress");
		this.grass = this._validateBoolean(grass, "grass");
		this.indoor = this._validateBoolean(indoor, "indoor");
		this.venueImages = this._validateVenueImagesArray(venueImages, "venueImages");
	}

	_validateNumber(value, fieldName) {
		if (typeof value !== "number" || value <= 0) {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLVenue' class) didn't receive a positive value of type number!: ${value}`);
		}
		return value;
	}

	_validateString(value, fieldName) {
		if (typeof value !== "string" || value.trim() === "") {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLVenue' class) didn't receive a valid (non-empty) string!`);
		}
		return value;
	}

	_validateNFLVenueAddress(value, fieldName) {
		if (value !== undefined && !(value instanceof NFLVenueAddress)) {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLVenue' class) should be an instance of 'NFLVenueAddress' or undefined.`);
		}
		return value;
	}

	_validateBoolean(value, fieldName) {
		if (typeof value !== "boolean") {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLVenue' class) didn't receive a valid boolean value!`);
		}
		return value;
	}

	_validateVenueImagesArray(value, fieldName) {
		if (!Array.isArray(value)) {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLVenue' class) didn't receive a valid array!`);
		}
		for (const item of value) {
			if (!(item instanceof NFLVenueImage)) {
				throw new TypeError(`Parameter '${fieldName}' (of the 'NFLVenue' class) should only contain instances of 'NFLVenueImage'!`);
			}
		}
		return value;
	}

	static validateNFLVenuesArray(nflVenues, allowEmptyArrays = false) {
		if (Array.isArray(nflVenues)) {
			if (!allowEmptyArrays && nflVenues.length === 0) {
				const errorMessage = `Error while validating NFL-Venues array: Empty array!`;
				throw new Error(errorMessage);
			} else if (nflVenues.every((item) => item instanceof NFLVenue)) {
				return true;
			} else {
				const errorMessage = `Error while validating NFL-Venues array: Not all elements in the array are instances of 'NFLVenue' class!`;
				throw new Error(errorMessage);
			}
		} else {
			const errorMessage = `Error while validating NFL-Venues array: Not an array!`;
			throw new Error(errorMessage);
		}
	}
}

module.exports = NFLVenue;
