// lib/classes/NFLVenueImage.js

"use strict";

class NFLVenueImage {
	constructor(url, alt, width, height, isFullImage, isDayImage, isInteriorImage, localCopyMetaStorageSubPath) {
		this.url = this._validateURL(url, "url");
		this.alt = this._validateString(alt, "alt");
		this.width = this._validateNumber(width, "width");
		this.height = this._validateNumber(height, "height");
		this.isFullImage = this._validateBoolean(isFullImage, "isFullImage");
		this.isDayImage = this._validateBoolean(isDayImage, "isDayImage");
		this.isInteriorImage = this._validateBoolean(isInteriorImage, "isInteriorImage");
		this.localCopyMetaStorageSubPath = this._validateLocalCopyMetaStorageSubPath(localCopyMetaStorageSubPath, "localCopyMetaStorageSubPath");
	}

	_validateURL(value, fieldName) {
		try {
			new URL(value);
			return value;
		} catch (_) {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLVenueImage' class) didn't receive a valid value of type URL! Received value: ${value}`);
		}
	}

	_validateString(value, fieldName) {
		if (typeof value !== "string") {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLVenueImage' class) didn't receive a valid (non-empty) string!`);
		}
		return value;
	}

	_validateNumber(value, fieldName) {
		if (typeof value !== "number" || value <= 0) {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLVenueImage' class) didn't receive a positive value of type number!`);
		}
		return value;
	}

	_validateBoolean(value, fieldName) {
		if (typeof value !== "boolean") {
			throw new TypeError(`Parameter '${fieldName}' (of the 'NFLVenueImage' class) didn't receive a valid boolean value!`);
		}
		return value;
	}

	_validateLocalCopyMetaStorageSubPath(value, fieldName) {
		if (value == null || (typeof value === "string" && value.trim() !== "")) {
			return value;
		}
		throw new TypeError(`Parameter '${fieldName}' (of the 'NFLVenueImage' class) didn't receive a valid string value or was not null!`);
	}
}

module.exports = NFLVenueImage;
