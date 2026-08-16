// lib/classes/NFLDivision.js

"use strict";

class NFLDivision {
	constructor(id, uid, slug, abbreviation, name) {
		this.id = this._validateNumber(id, "id");
		this.uid = this._validateUID(uid, "uid");
		this.slug = this._validateString(slug, "slug");
		this.abbreviation = this._validateString(abbreviation, "abbreviation");
		this.name = this._validateString(name, "name");
	}

	_validateNumber(value, fieldName) {
		if (typeof value !== "number" || value <= 0) {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLDivision' class) didn't receive a positive value of type number!`);
		}
		return value;
	}

	_validateUID(value, fieldName) {
		const uidPattern = /^s:\d+~l:\d+~g:\d+$/;
		if (typeof value !== "string" || !uidPattern.test(value)) {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLDivision' class) didn't receive a valid UID string (e.g., 's:20~l:28~g:1')!`);
		}
		return value;
	}

	_validateString(value, fieldName) {
		if (typeof value !== "string" || value.trim() === "") {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLDivision' class) didn't receive a valid (non-empty) string!`);
		}
		return value;
	}

	/**************************************************************************************************************************************
	 * Validates an array of NFL-Divisions.
	 *
	 * This function checks if the provided array is a valid array of 'NFLDivision' instances.
	 * It performs the following validations:
	 * 1. Ensures the input is an array.
	 * 2. Checks if the array is empty, unless empty arrays are allowed by the 'allowEmptyArrays' parameter.
	 * 3. Confirms that every element in the array is an instance of the 'NFLDivision' class.
	 *
	 * @param {Array} nflDivisions - The array of 'NFLDivision' instances to validate.
	 * @param {boolean} [allowEmptyArrays=false] - Optional parameter that allows empty arrays if set to true.
	 *
	 * @returns {boolean} - Returns true if the array is valid, otherwise throws an error.
	 *
	 * @throws {Error} - Throws an error if the array is:
	 *                   - Not an array.
	 *                   - Empty (unless empty arrays are allowed).
	 *                   - Contains elements that are not instances of the 'NFLDivision' class.
	 **************************************************************************************************************************************/
	static validateNFLDivisionsArray(nflDivisions, allowEmptyArrays = false) {
		if (Array.isArray(nflDivisions)) {
			if (!allowEmptyArrays && nflDivisions.length === 0) {
				const errorMessage = `Error while validating NFL-Divisions array: Empty array!`;
				throw new Error(errorMessage);
			} else if (nflDivisions.every((item) => item instanceof NFLDivision)) {
				return true;
			} else {
				const errorMessage = `Error while validating NFL-Divisions array: Not all elements in the array are instances of 'NFLDivision' class!`;
				throw new Error(errorMessage);
			}
		} else {
			const errorMessage = `Error while validating NFL-Divisions array: Not an array!`;
			throw new Error(errorMessage);
		}
	}
}

module.exports = NFLDivision;
