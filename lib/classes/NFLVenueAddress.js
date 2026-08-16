// lib/classes/NFLVenueAddress.js

"use strict";

class NFLVenueAddress {
	constructor(city, state, zipCode) {
		this.city = this._validateString(city, "city");
		this.state = this._validateString(state, "state");
		this.zipCode = this._validateString(zipCode, "zipCode");
	}

	_validateString(value, fieldName) {
		if (typeof value !== "string" || value.trim() === "") {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLVenueAddress' class) didn't receive a valid (non-empty) string!`);
		}
		return value;
	}
}

module.exports = NFLVenueAddress;
