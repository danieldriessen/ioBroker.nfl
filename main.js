"use strict";

/***********************************************************************************************************************************************************************************
 Created with @iobroker/create-adapter v2.6.3

	Developed by: Daniel Drießen @ DDProductions

	Development references:
		- Unofficial list of ESPN NFL API Endpoints: https://gist.github.com/nntrn/ee26cb2a0716de0947a0a4e9a157bc1c#teams
 ***********************************************************************************************************************************************************************************/

// Import required modules
const utils = require("@iobroker/adapter-core");
const axios = require("axios");
const path = require("path");

// Import required classes
const NFLTeam = require("./lib/classes/NFLTeam");
const { NFLTeamLogo, NFLTeamLogoTypes } = require("./lib/classes/NFLTeamLogo");
const NFLDivision = require("./lib/classes/NFLDivision");
const NFLVenue = require("./lib/classes/NFLVenue");
const NFLVenueAddress = require("./lib/classes/NFLVenueAddress");
const NFLVenueImage = require("./lib/classes/NFLVenueImage");

// Define constants
const FORBIDDEN_CHARS = /[^._\-/ :!#$%&()+=@^{}|~\p{Ll}\p{Lu}\p{Nd}]+/gu;

// Define ioBroker object IDs, names & descriptions
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS = "nfl-teams";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAMS = "NFL-Teams";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS = "teamInfos";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_INFOS = "Team Infos";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__ID = "id";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__ID = "ID";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__UID = "uid";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__UID = "UID";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__SLUG = "slug";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__SLUG = "Slug";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__ABBREVIATION = "abbreviation";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__ABBREVIATION = "Abbreviation";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__DISPLAY_NAME = "displayName";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__DISPLAY_NAME = "Display name";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__SHORT_DISPLAY_NAME = "shortDisplayName";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__SHORT_DISPLAY_NAME = "Short display name";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__NAME = "name";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__NAME = "Name";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__NICKNAME = "nickname";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__NICKNAME = "Nickname";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__LOCATION = "location";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__LOCATION = "Location";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_COLORS = "teamColors";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_COLORS = "Team Colors";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__COLOR = "color";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__COLOR = "Color";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__ALTERNATE_COLOR = "alternateColor";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__ALTERNATE_COLOR = "Alternate color";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__IS_ACTIVE = "isActive";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__IS_ACTIVE = "Is active?";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__IS_ALLSTAR = "isAllStar";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__IS_ALLSTAR = "Is AllStar?";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__IS_FAVORITE = "isFavorite";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__IS_FAVORITE = "Is favorite?";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGOS = "teamLogos";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_LOGOS = "Team Logos";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGO__DEFAULT_LOGO = "defaultLogo";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_LOGO__DEFAULT_LOGO = "Default Logo";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGO__DEFAULT_LOGO_DARK = "defaultLogo_dark";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_LOGO__DEFAULT_LOGO_DARK = "Default Logo (Dark)";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGO__SCOREBOARD_LOGO = "scoreboardLogo";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_LOGO__SCOREBOARD_LOGO = "Scoreboard Logo";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGO__SCOREBOARD_LOGO_DARK = "scoreboardLogo_dark";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_LOGO__SCOREBOARD_LOGO_DARK = "Scoreboard Logo (Dark)";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__URL = "url";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__URL = "URL";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__ALTERNATIVE_URL = "alternativeURL";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__ALTERNATIVE_URL = "Alternative URL";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__WIDTH = "width";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__WIDTH = "Width";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__HEIGHT = "height";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__HEIGHT = "Height";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__IS_DEFAULT_LOGO = "isDefaultLogo";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__IS_DEFAULT_LOGO = "Is default logo?";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__IS_FULL_LOGO = "isFullLogo";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__IS_FULL_LOGO = "Is full logo?";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__IS_DARK_LOGO = "isDarkLogo";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__IS_DARK_LOGO = "Is dark logo?";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__IS_SCOREBOARD_LOGO = "isScoreboardLogo";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__IS_SCOREBOARD_LOGO = "Is scoreboard logo?";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__LOCAL_COPY_META_STORAGE_SUBPATH = "localCopyMetaStorageSubpath";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__LOCAL_COPY_META_STORAGE_SUBPATH = "Local copy meta-storage subpath";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__BASE64_IMAGE = "base64Image";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__BASE64_IMAGE = "Base64-Image";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION = "teamDivision";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION = "Team Division";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION__ID = "id";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION__ID = "ID";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION__UID = "uid";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION__UID = "UID";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION__SLUG = "slug";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION__SLUG = "Slug";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION__ABBREVIATION = "abbreviation";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION__ABBREVIATION = "Abbreviation";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION__NAME = "name";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION__NAME = "Name";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE = "teamVenue";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_VENUE = "Team Venue";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_VENUE__ID = "id";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_VENUE__ID = "ID";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_VENUE__FULL_NAME = "fullName";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_VENUE__FULL_NAME = "Full name";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS = "venueAddress";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS = "Venue address";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS__CITY = "city";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS__CITY = "City";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS__STATE = "state";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS__STATE = "State";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS__ZIP_CODE = "zipCode";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS__ZIP_CODE = "ZIP code";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_VENUE__HAS_GRASS = "hasGrass";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_VENUE__HAS_GRASS = "Has grass";
const IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_VENUE__IS_INDOOR = "isIndoor";
const IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_VENUE__IS_INDOOR = "Is indoor";
const IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_IMAGES = "venueImages";
const IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_IMAGES = "Venue images";

// NFL Games (scoreboard) object IDs
const IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES = "nfl-games";
const IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__INFO = "info";

// Scoreboard poll settings
const URL_ESPN_CDN_SCOREBOARD = "https://cdn.espn.com/core/nfl/scoreboard?xhr=1&limit=50";
const SCOREBOARD_POLL_INTERVAL_IDLE_MS = 300_000; // 5 min when no live games
const SCOREBOARD_POLL_INTERVAL_MIN_S = 15;
const SCOREBOARD_POLL_INTERVAL_MAX_S = 300;

// Define Paths
const SUBPATH__NFL_TEAM_LOGO_IMAGES = "NFL-Team Logos";
const SUBPATH__NFL_TEAM_LOGO_IMAGES__DEFAULT_LOGOS = path.join(SUBPATH__NFL_TEAM_LOGO_IMAGES, "Default Logos");
const SUBPATH__NFL_TEAM_LOGO_IMAGES__DARK_DEFAULT_LOGOS = path.join(SUBPATH__NFL_TEAM_LOGO_IMAGES, "Default Logos (Dark)");
const SUBPATH__NFL_TEAM_LOGO_IMAGES__SCOREBOARD_LOGOS = path.join(SUBPATH__NFL_TEAM_LOGO_IMAGES, "Scoreboard Logos");
const SUBPATH__NFL_TEAM_LOGO_IMAGES__DARK_SCOREBOARD_LOGOS = path.join(SUBPATH__NFL_TEAM_LOGO_IMAGES, "Scoreboard Logos (Dark)");
const SUBPATH__NFL_VENUE_IMAGES = "NFL-Venue Images";

// Define URLs
const URL_ESPN_API_BASIC_NFL_TEAM_DATA = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";
const URL_ESPN_API_ADDITIONAL_NFL_TEAM_DATA = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{TEAM-ID}";
const URL_ESPN_API_NFL_SEASONS = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons?limit=5";
const URL_ESPN_API_NFL_SEASON = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{YEAR}";
// Division/group metadata lives under regular-season groups (type 2). Current calendar type
// (pre/off) often has hasGroups=false — do not use the live season type for this URL.
const URL_ESPN_API_NFL_DIVISION_DATA = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{YEAR}/types/{SEASON_TYPE}/groups/{GROUP-ID}";
const ESPN_NFL_SEASON_TYPE_REGULAR = 2;

// Define Timeouts
const TIMEOUT_URL_REQUESTS_PRIMARY = 10000;

class Nfl extends utils.Adapter {
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "nfl",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));

		// Define global variables
		this.nflDivisions = [];
		this.nflTeams = [];
		this.nflVenues = [];
		/** @type {number|null} Cached ESPN season year used for division/group fetches */
		this.nflDivisionSeasonYear = null;
		/** @type {ReturnType<typeof setTimeout>|null} */
		this._scoreboardTimer = null;
	}

	/**************************************************************************************************************************************
	 * This function is called when the adapter is ready
	 * (once databases are connected and the adapter has received configuration).
	 **************************************************************************************************************************************/
	async onReady() {
		// INITIALIZING THE ADAPTER

		// Reset the connection indicator during startup (to 'false')
		this.setState("info.connection", false, true);

		// Get basic data for NFL-Teams
		try {
			this.nflTeams = await this.get_basicData_NFLTeams();
		} catch (error) {
			// TODO: Figure out what to do here besides just logging the error and returning. Maybe schedule another try or just set the connection state to false.
			this.log.error(error.message);
			return;
		}

		// Download and Store NFL-Team logo-images for all found NFL-Teams
		try {
			await this.downloadAndStore_NFLTeam_LogoImages(this.nflTeams);
		} catch (error) {
			// TODO: Figure out what to do here besides just logging the error and returning. Maybe just set the connection state to false.
			this.log.error(error.message);
			return;
		}

		// Get additional data for NFL-Teams
		try {
			await this.get_additionalData_NFLTeams(this.nflTeams, this.nflDivisions, this.nflVenues);
		} catch (error) {
			// TODO: Figure out what to do here besides just logging the error and returning. Maybe just set the connection state to false.
			this.log.error(error.message);
			return;
		}

		// Download and Store NFL-Venue images for all found NFL-Venues (associated with existing NFL-Teams)
		try {
			await this.downloadAndStore_NFLVenue_Images(this.nflVenues);
		} catch (error) {
			// TODO: Figure out what to do here besides just logging the error and returning. Maybe just set the connection state to false.
			this.log.error(error.message);
			return;
		}

		// Store NFL-Teams to object structure
		try {
			await this.createObjectStructure_NFLTeams(this.nflTeams);
		} catch (error) {
			// TODO: Figure out what to do here besides just logging the error and returning. Maybe just set the connection state to false.
			this.log.error(error.message);
			return;
		}

		// Initialization completed successfully
		await this.setStateAsync("info.connection", true, true);

		// Start scoreboard polling loop
		this._startScoreboardLoop();
	}

	/**************************************************************************************************************************************
	 * Fetches and processes a list of NFL-Teams from a specified API endpoint.
	 *
	 * The function performs the following steps:
	 * 1. Sends an HTTP GET request to the specified URL to fetch the NFL-Teams data.
	 * 3. Validates the structure of the received JSON response to ensure it contains the expected data.
	 * 4. Processes the response data to create instances of the 'NFLTeam' class, along with their associated logos.
	 * 5. Returns an array of 'NFLTeam' instances.
	 *
	 * The function ensures the following validations and error handling:
	 * - Checks if the HTTP request is successful. If it fails, throws an error with a relevant message.
	 * - Verifies that the received response is a valid JSON object. If not, throws an error indicating an invalid response.
	 * - Checks that the JSON response seems contain the expected structure with a list of NFL-Teams. If not, throws an error.
	 * - Creates instances of 'NFLTeam' class using the fetched data, and if any error occurs during this process, throws an error.
	 *
	 * @returns {Promise<NFLTeam[]>} A promise that resolves to an array of 'NFLTeam' instances.
	 *
	 * @throws {Error} If fetching or processing the NFL-Teams data fails at any step.
	 **************************************************************************************************************************************/
	async get_basicData_NFLTeams() {
		this.log.debug(`Getting basic data for NFL-Teams...`);
		this.log.silly(`Fetching basic data for NFL-Teams using URL: '${URL_ESPN_API_BASIC_NFL_TEAM_DATA}'...`);

		// Get the JSON content from the URL
		let responseData = null;
		try {
			const response = await axios.get(URL_ESPN_API_BASIC_NFL_TEAM_DATA, { timeout: TIMEOUT_URL_REQUESTS_PRIMARY });
			responseData = response.data;
		} catch (error) {
			const errorMessage = `Error while fetching basic data for NFL-Teams: ${error.message}`;
			throw new Error(errorMessage);
		}

		// Check if we received a valid response
		if (!responseData || typeof responseData !== "object" || responseData === null) {
			const errorMessage = `Error while fetching basic data for NFL-Teams: Invalid response received!`;
			throw new Error(errorMessage);
		}

		// Check if the response has the expected JSON structure
		if (!responseData.sports || !Array.isArray(responseData.sports)) {
			const errorMessage = `Error while fetching basic data for NFL-Teams: Invalid JSON structure received!`;
			throw new Error(errorMessage);
		}

		this.log.debug(`Successfully fetched basic data for NFL-Teams.`);
		this.log.silly(`Response-Data: ${JSON.stringify(responseData)}`);

		// Process and create NFLTeam instances
		this.log.debug(`Creating array for NFL-Teams...`);

		const nflTeams = [];

		try {
			responseData.sports[0].leagues[0].teams.map((teamData) => {
				const team = teamData.team;

				this.log.debug(`Creating NFLTeam object for NFL-Team: ${team.displayName}...`);

				try {
					// Get the NFL-Team logos and create an array
					const teamLogos = [];
					for (const teamLogo of team.logos) {
						const newTeamLogo = new NFLTeamLogo(teamLogo.href, teamLogo.alt || "", teamLogo.width, teamLogo.height, teamLogo.rel.includes("default"), teamLogo.rel.includes("full"), teamLogo.rel.includes("dark"), teamLogo.rel.includes("scoreboard"));

						// Set the desired 'local copy meta storage sub path' for the specific NFL-Team logo.
						if (teamLogo.rel.includes("default") && teamLogo.rel.includes("full") && !teamLogo.rel.includes("dark") && !teamLogo.rel.includes("scoreboard")) {
							newTeamLogo.localCopyMetaStorageSubPath = path.join(SUBPATH__NFL_TEAM_LOGO_IMAGES__DEFAULT_LOGOS, String(team.id) + ".png");
						} else if (!teamLogo.rel.includes("default") && teamLogo.rel.includes("full") && teamLogo.rel.includes("dark") && !teamLogo.rel.includes("scoreboard")) {
							newTeamLogo.localCopyMetaStorageSubPath = path.join(SUBPATH__NFL_TEAM_LOGO_IMAGES__DARK_DEFAULT_LOGOS, String(team.id) + ".png");
						} else if (!teamLogo.rel.includes("default") && teamLogo.rel.includes("full") && !teamLogo.rel.includes("dark") && teamLogo.rel.includes("scoreboard")) {
							newTeamLogo.localCopyMetaStorageSubPath = path.join(SUBPATH__NFL_TEAM_LOGO_IMAGES__SCOREBOARD_LOGOS, String(team.id) + ".png");
						} else if (!teamLogo.rel.includes("default") && teamLogo.rel.includes("full") && teamLogo.rel.includes("dark") && teamLogo.rel.includes("scoreboard")) {
							newTeamLogo.localCopyMetaStorageSubPath = path.join(SUBPATH__NFL_TEAM_LOGO_IMAGES__DARK_SCOREBOARD_LOGOS, String(team.id) + ".png");
						}

						teamLogos.push(newTeamLogo);
					}

					// Create the NFLTeam object
					const newNFLTeam = new NFLTeam(Number(team.id), team.uid, team.slug, team.abbreviation, team.displayName, team.shortDisplayName, team.name, team.nickname, team.location, team.color, team.alternateColor, team.isActive, team.isAllStar, teamLogos);

					nflTeams.push(newNFLTeam);
				} catch (error) {
					const errorMessage = `Error while creating NFLTeam object for NFL-Team '${team.displayName}': ${error.message}`;
					throw new Error(errorMessage);
				}

				this.log.debug(`Successfully created NFLTeam object for NFL-Team '${team.displayName}'.`);
			});

			this.log.debug(`Successfully created array for ${nflTeams.length} NFL-Teams.`);
			return nflTeams;
		} catch (error) {
			const errorMessage = `Error while creating array for NFL-Teams: ${error.message}`;
			throw new Error(errorMessage);
		}
	}

	/**************************************************************************************************************************************
	 * Downloads and stores NFL-Team logo images.
	 *
	 * This function takes an array of 'NFLTeam' objects, validates the array, and then downloads the logos for each team based on the
	 * specified logo type (Default Logo, Default Logo (Dark), Scoreboard Logo, Scoreboard Logo (Dark)).
	 * It uses the function 'downloadFileToAdapterFilesDataSubDir' to store the downloaded logo images to the approriate subdirectory
	 * for the specific logo.
	 * In case of errors during the download, it skips to the next logo to download while logging a warning.
	 *
	 * @param {NFLTeam[]} nflTeams - Array of 'NFLTeam' objects to process.
	 *
	 * @returns {Promise<void>} - Returns a promise that resolves when all logos have been processed.
	 *
	 * @throws {TypeError} - Throws an error if validation of the NFL-Teams array fails.
	 **************************************************************************************************************************************/
	async downloadAndStore_NFLTeam_LogoImages(nflTeams) {
		this.log.debug(`Downloading and storing NFL-Team logo-images...`);

		// Validate received parameter 'nflTeams'
		if (!nflTeams) {
			const errorMessage = `Error while downloading and storing NFL-Team logo-images: Missing value for parameter 'nflTeams'!`;
			throw new TypeError(errorMessage);
		}
		try {
			NFLTeam.validateNFLTeamsArray(nflTeams);
		} catch (error) {
			const errorMessage = `Error while downloading and storing NFL-Team logo-images: ${error.message}`;
			throw new TypeError(errorMessage);
		}

		// Download all NFL-Team logo images for all NFL-Teams
		// Iterate NFL-Teams
		for (const nflTeam of nflTeams) {
			this.log.debug(`Downloading and storing NFL-Team logo-images for NFL-Team '${nflTeam.displayName}'...`);

			// Iterate NFL-Team logo-images
			for (const nflTeamLogo of nflTeam.teamLogos) {
				// Skip logo variants that are intentionally not stored (no resolved storage path).
				if (!nflTeamLogo.localCopyMetaStorageSubPath) {
					this.log.silly(`Skipping download of unmatched NFL-Team logo variant for NFL-Team '${nflTeam.displayName}' (no local storage path).`);
					continue;
				}
				try {
					await this.downloadFileToAdapterFilesDataSubDir(nflTeamLogo.url, path.dirname(nflTeamLogo.localCopyMetaStorageSubPath), path.basename(nflTeamLogo.localCopyMetaStorageSubPath));
					this.log.debug(`Successfully downloaded and stored NFL-Team logo-image of type '${NFLTeamLogo.getHumanReadableNFLTeamLogoType(nflTeamLogo)}' for NFL-Team '${nflTeam.displayName}'.`);
				} catch (error) {
					const errorMessage = `Error while downloading and storing NFL-Team logo-image of type '${NFLTeamLogo.getHumanReadableNFLTeamLogoType(nflTeamLogo)}' for NFL-Team '${nflTeam.displayName}': ${error.message}`;
					this.log.error(errorMessage);
					this.log.warn(`Skipping download of NFL-Team logo-image of type '${NFLTeamLogo.getHumanReadableNFLTeamLogoType(nflTeamLogo)}' for NFL-Team '${nflTeam.displayName}'!`);
					continue; // Skip to the next iteration
				}
			}
		}

		this.log.debug(`Finished downloading and storing NFL-Team logo-images.`);
	}

	/**************************************************************************************************************************************
	 * @todo add documentation for this function
	 **************************************************************************************************************************************/
	async get_additionalData_NFLTeams(nflTeams, nflDivisions, nflVenues) {
		this.log.debug(`Getting additional data for NFL-Teams...`);

		// Validate received parameter 'nflTeams'
		if (!nflTeams) {
			const errorMessage = `Error while getting additional data for NFL-Teams: Missing value for parameter 'nflTeams'!`;
			throw new TypeError(errorMessage);
		}
		try {
			NFLTeam.validateNFLTeamsArray(nflTeams);
		} catch (error) {
			const errorMessage = `Error while getting additional data for NFL-Teams: ${error.message}`;
			throw new TypeError(errorMessage);
		}

		// Validate received parameter 'nflDivisions'
		if (!nflDivisions) {
			const errorMessage = `Error while getting additional data for NFL-Teams: Missing value for parameter 'nflDivisions'!`;
			throw new TypeError(errorMessage);
		}
		try {
			NFLDivision.validateNFLDivisionsArray(nflDivisions, true);
		} catch (error) {
			const errorMessage = `Error while getting additional data for NFL-Teams: ${error.message}`;
			throw new TypeError(errorMessage);
		}

		// Validate received parameter 'nflVenues'
		if (!nflVenues) {
			const errorMessage = `Error while getting additional data for NFL-Teams: Missing value for parameter 'nflVenues'!`;
			throw new TypeError(errorMessage);
		}
		try {
			NFLVenue.validateNFLVenuesArray(nflVenues, true);
		} catch (error) {
			const errorMessage = `Error while getting additional data for NFL-Teams: ${error.message}`;
			throw new TypeError(errorMessage);
		}

		for (const nflTeam of nflTeams) {
			this.log.debug(`Getting additional data for NFL-Team '${nflTeam.displayName}'...`);

			const url = URL_ESPN_API_ADDITIONAL_NFL_TEAM_DATA.replace("{TEAM-ID}", nflTeam.id);
			this.log.debug(`Fetching additional data for NFL-Team '${nflTeam.displayName}' using URL: '${url}'...`);

			// Get the content from the NFL-Team information URL
			let responseData = null;
			try {
				const response = await axios.get(url, { timeout: TIMEOUT_URL_REQUESTS_PRIMARY });
				responseData = response.data;
			} catch (error) {
				const errorMessage = `Error while getting additional data for NFL-Team '${nflTeam.displayName}': ${error.message}`;
				this.log.error(errorMessage);
				const warningMessage = `Warning: Skipping acquisition of additional data for NFL-Team '${nflTeam.displayName}'!`;
				this.log.warn(warningMessage);
				continue;
			}

			// Check if we received a valid response
			if (!responseData || typeof responseData !== "object" || responseData === null) {
				const errorMessage = `Error while getting additional data for NFL-Team '${nflTeam.displayName}': Invalid response received!`;
				this.log.error(errorMessage);
				const warningMessage = `Warning: Skipping acquisition of additional data for NFL-Team '${nflTeam.displayName}'!`;
				this.log.warn(warningMessage);
				continue;
			}

			// Check if the response has the expected JSON structure
			if (!responseData.team || !responseData.team.id || !responseData.team.slug) {
				const errorMessage = `Error while getting additional data for NFL-Team '${nflTeam.displayName}': Invalid JSON structure received!`;
				this.log.error(errorMessage);
				const warningMessage = `Warning: Skipping acquisition of additional data for NFL-Team '${nflTeam.displayName}'!`;
				this.log.warn(warningMessage);
				continue;
			}

			// Get the NFL-Team data part from the response date
			const team = responseData.team;

			// Identity is ESPN team id (stable). Slug is display metadata and may change.
			if (Number(team.id) !== nflTeam.id) {
				const errorMessage = `Error while getting additional data for NFL-Team '${nflTeam.displayName}': Wrong information received (id mismatch)!`;
				this.log.error(errorMessage);
				const warningMessage = `Warning: Skipping acquisition of additional data for NFL-Team '${nflTeam.displayName}'!`;
				this.log.warn(warningMessage);
				continue;
			}
			if (team.slug && team.slug !== nflTeam.slug) {
				this.log.info(`NFL-Team id ${nflTeam.id} slug updated: '${nflTeam.slug}' → '${team.slug}'`);
				nflTeam.slug = team.slug;
			}

			this.log.debug(`Successfully fetched additional data for NFL-Team '${nflTeam.displayName}'.`);
			this.log.silly(`Response-Data: ${JSON.stringify(responseData)}`);

			// NFL-DIVISION
			// Check if NFL-Division 'id' is included in the response data
			if (team.groups?.id) {
				// Check if we already fetched the information for the NFL-Division.
				let nflDivisionInformation = null;
				for (const nflDivision of nflDivisions) {
					if (Number(nflDivision.id) === Number(team.groups.id)) {
						nflDivisionInformation = nflDivision;
					}
				}

				if (nflDivisionInformation !== null) {
					// <-- We already fetched the division information before. No need to do it again.
					// Add the 'NFLDivision' object to the existing 'NFLTeam' object.
					try {
						nflTeam.setNFLDivision(nflDivisionInformation);
					} catch (error) {
						const errorMessage = `Error while updating NFLTeam object for NFL-Team '${nflTeam.displayName}': Unable to add NFL-Division data!`;
						this.log.error(errorMessage);
						const warningMessage = `Warning: Skipping acquisition of NFL-Division data for NFL-Team '${nflTeam.displayName}'!`;
						this.log.warn(warningMessage);
					}
				} else {
					// Get the NFL-Division information (from the appropriate API endpoint)
					let newNFLDivision = null;
					try {
						newNFLDivision = await this.get_data_NFLDivision(Number(team.groups.id));

						// Check if we received a valid 'NFLDivision' object
						if (newNFLDivision instanceof NFLDivision) {
							// Add the 'NFLDivision' object to the array of already fetched 'NFLDivision' objects.
							nflDivisions.push(newNFLDivision);

							// Add the 'NFLDivision' object to the existing 'NFLTeam' object.
							try {
								nflTeam.setNFLDivision(newNFLDivision);
							} catch (error) {
								const errorMessage = `Error while updating NFLTeam object for NFL-Team '${nflTeam.displayName}': Unable to add NFL-Division data!`;
								this.log.error(errorMessage);
								const warningMessage = `Warning: Skipping acquisition of NFL-Division data for NFL-Team '${nflTeam.displayName}'!`;
								this.log.warn(warningMessage);
							}
						} else {
							const errorMessage = `Error while getting additional data for NFL-Team '${nflTeam.displayName}': An unknown error occurred while retrieving NFL-Division data!`;
							this.log.error(errorMessage);
							const warningMessage = `Warning: Skipping acquisition of NFL-Division data for NFL-Team '${nflTeam.displayName}'!`;
							this.log.warn(warningMessage);
						}
					} catch (error) {
						const errorMessage = `Error while getting additional data for NFL-Team '${nflTeam.displayName}': Could not retrieve NFL-Division data!: ${error.message}`;
						this.log.error(errorMessage);
						const warningMessage = `Warning: Skipping acquisition of NFL-Division data for NFL-Team '${nflTeam.displayName}'!`;
						this.log.warn(warningMessage);
					}
				}
			} else {
				const errorMessage = `Error while getting NFL-Division data for NFL-Team '${nflTeam.displayName}': 'ID' of NFL-Division could not be found within the data for the NFL-Team!`;
				this.log.error(errorMessage);
				const warningMessage = `Warning: Skipping acquisition of NFL-Division data for NFL-Team '${nflTeam.displayName}'!`;
				this.log.warn(warningMessage);
			}

			// NFL-VENUE
			// Check if NFL-Venue 'id' is included in the response data
			if (team.franchise?.venue?.id) {
				// Check if we already fetched the information for the NFL-Venue.
				let nflVenueInformation = null;
				for (const nflVenue of nflVenues) {
					if (Number(nflVenue.id) === Number(team.franchise.venue.id)) {
						nflVenueInformation = nflVenue;
					}
				}

				if (nflVenueInformation !== null) {
					// <-- We already fetched the venue information before. No need to do it again.
					// Add the 'NFLVenue' object to the existing 'NFLTeam' object.
					try {
						nflTeam.setNFLVenue(nflVenueInformation);
					} catch (error) {
						const errorMessage = `Error while updating NFLTeam object for NFL-Team '${nflTeam.displayName}': Unable to add NFL-Venue data!`;
						this.log.error(errorMessage);
						const warningMessage = `Warning: Skipping acquisition of NFL-Venue data for NFL-Team '${nflTeam.displayName}'!`;
						this.log.warn(warningMessage);
					}
				} else {
					// Get the NFL-Venue information
					let venueAddress = null;
					const venueImages = [];
					let venue = null;

					if (team.franchise.venue.address) {
						try {
							venueAddress = new NFLVenueAddress(team.franchise.venue.address.city, team.franchise.venue.address.state, team.franchise.venue.address.zipCode);
						} catch (error) {
							const warningMessage = `Warning: Unable to create NFLVenueAddress object for Venue of NFL-Team '${nflTeam.displayName}': ${error.message}`;
							this.log.warn(warningMessage);
						}
					} else {
						const warningMessage = `Warning: Skipping acquisition of NFL-Venue address data for NFL-Team '${nflTeam.displayName}': No venue address found!`;
						this.log.warn(warningMessage);
					}

					if (team.franchise.venue.images && Array.isArray(team.franchise.venue.images) && team.franchise.venue.images.length > 0) {
						for (const nflVenueImage of team.franchise.venue.images) {
							let localCopyMetaStorageSubPath_imageNameAndExtensionComponent = team.franchise.venue.id;

							if (nflVenueImage.rel.includes("full")) {
								localCopyMetaStorageSubPath_imageNameAndExtensionComponent = localCopyMetaStorageSubPath_imageNameAndExtensionComponent + "_full";
							} else {
								localCopyMetaStorageSubPath_imageNameAndExtensionComponent = localCopyMetaStorageSubPath_imageNameAndExtensionComponent + "_partial";
							}
							if (nflVenueImage.rel.includes("day")) {
								localCopyMetaStorageSubPath_imageNameAndExtensionComponent = localCopyMetaStorageSubPath_imageNameAndExtensionComponent + "_day";
							} else {
								localCopyMetaStorageSubPath_imageNameAndExtensionComponent = localCopyMetaStorageSubPath_imageNameAndExtensionComponent + "_night";
							}
							if (nflVenueImage.rel.includes("interior")) {
								localCopyMetaStorageSubPath_imageNameAndExtensionComponent = localCopyMetaStorageSubPath_imageNameAndExtensionComponent + "_interior";
							} else {
								localCopyMetaStorageSubPath_imageNameAndExtensionComponent = localCopyMetaStorageSubPath_imageNameAndExtensionComponent + "_exterior";
							}

							localCopyMetaStorageSubPath_imageNameAndExtensionComponent = localCopyMetaStorageSubPath_imageNameAndExtensionComponent + ".png";

							const localCopyMetaStorageSubPath = path.join(SUBPATH__NFL_VENUE_IMAGES, team.franchise.venue.id, localCopyMetaStorageSubPath_imageNameAndExtensionComponent);
							this.log.debug(`PATH: ${localCopyMetaStorageSubPath}`);

							try {
								const newVenueImage = new NFLVenueImage(nflVenueImage.href, nflVenueImage.alt, Number(nflVenueImage.width), Number(nflVenueImage.height), nflVenueImage.rel.includes("full"), nflVenueImage.rel.includes("day"), nflVenueImage.rel.includes("interior"), localCopyMetaStorageSubPath);
								venueImages.push(newVenueImage);
							} catch (error) {
								const warningMessage = `Warning: Unable to add NFLVenueImage object to NFLVenueImages array for Venue of NFL-Team '${nflTeam.displayName}': ${error.message}`;
								this.log.warn(warningMessage);
							}
						}
					} else {
						const warningMessage = `Warning: Skipping acquisition of NFL-Venue images data for NFL-Team '${nflTeam.displayName}': No venue image found!`;
						this.log.warn(warningMessage);
					}

					if (team.franchise.venue.id) {
						try {
							venue = new NFLVenue(Number(team.franchise.venue.id), team.franchise.venue.fullName, venueAddress, team.franchise.venue.grass, team.franchise.venue.indoor, venueImages);
						} catch (error) {
							const warningMessage = `Warning: Unable to create NFLVenue object for Venue of NFL-Team '${nflTeam.displayName}': ${error.message}`;
							this.log.warn(warningMessage);
						}

						if (venue !== null) {
							nflVenues.push(venue);

							try {
								nflTeam.setNFLVenue(venue);
							} catch (error) {
								const errorMessage = `Error while updating NFLTeam object for NFL-Team '${nflTeam.displayName}': Unable to add NFL-Venue data!`;
								this.log.error(errorMessage);
								const warningMessage = `Warning: Skipping acquisition of NFL-Venue data for NFL-Team '${nflTeam.displayName}'!`;
								this.log.warn(warningMessage);
							}
						}
					} else {
						const warningMessage = `Warning: Skipping acquisition of NFL-Venue data for NFL-Team '${nflTeam.displayName}': No venue data found!`;
						this.log.warn(warningMessage);
					}
				}
			} else {
				const errorMessage = `Error while getting NFL-Venue data for NFL-Team '${nflTeam.displayName}': 'ID' of NFL-Venue could not be found within the data for the NFL-Team!`;
				this.log.error(errorMessage);
				const warningMessage = `Warning: Skipping acquisition of NFL-Venue data for NFL-Team '${nflTeam.displayName}'!`;
				this.log.warn(warningMessage);
			}
		}
	}

	/* ====================================================== SCOREBOARD LOOP ========================================================= */

	/**
	 * Returns the configured favorite team IDs as a Set of strings.
	 * @returns {Set<string>}
	 */
	_getFavoriteTeamIds() {
		const raw = this.config.favoriteTeamIds;
		const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
		return new Set(arr.map(String));
	}

	/**
	 * Reads `pollIntervalLiveSeconds` from adapter config, clamps to allowed range, and returns ms.
	 * @returns {number}
	 */
	_livePollIntervalMs() {
		const raw = Number(this.config.pollIntervalLiveSeconds);
		const clamped = Number.isFinite(raw)
			? Math.min(SCOREBOARD_POLL_INTERVAL_MAX_S, Math.max(SCOREBOARD_POLL_INTERVAL_MIN_S, raw))
			: 30;
		if (clamped !== raw) {
			this.log.warn(`pollIntervalLiveSeconds ${raw} out of range [${SCOREBOARD_POLL_INTERVAL_MIN_S}, ${SCOREBOARD_POLL_INTERVAL_MAX_S}]; using ${clamped}.`);
		}
		return clamped * 1000;
	}

	/**
	 * Kicks off the first scoreboard fetch and schedules subsequent ones.
	 * Uses a recursive setTimeout so polls never overlap.
	 */
	_startScoreboardLoop() {
		const tick = async () => {
			if (this._scoreboardTimer === null) {
				return; // adapter was unloaded
			}
			let nextMs = SCOREBOARD_POLL_INTERVAL_IDLE_MS;
			try {
				const hasLive = await this.fetchAndStoreScoreboard();
				nextMs = hasLive ? this._livePollIntervalMs() : SCOREBOARD_POLL_INTERVAL_IDLE_MS;
			} catch (error) {
				this.log.error(`Scoreboard poll failed: ${error.message}`);
			}
			if (this._scoreboardTimer !== null) {
				this._scoreboardTimer = setTimeout(tick, nextMs);
			}
		};
		this._scoreboardTimer = setTimeout(tick, 0);
	}

	/**
	 * Fetches the ESPN CDN scoreboard, writes game objects under `nfl-games.*`.
	 * @returns {Promise<boolean>} true if at least one game is currently live
	 */
	async fetchAndStoreScoreboard() {
		this.log.debug(`Fetching NFL scoreboard from ESPN CDN...`);

		const response = await axios.get(URL_ESPN_CDN_SCOREBOARD, { timeout: TIMEOUT_URL_REQUESTS_PRIMARY });
		const sbData = response.data?.content?.sbData;

		if (!sbData || !Array.isArray(sbData.events)) {
			throw new Error(`Unexpected CDN scoreboard response shape`);
		}

		const events = sbData.events;
		const seasonYear = sbData.season?.year ?? null;
		const weekNumber = sbData.week?.number ?? null;
		const favoriteTeamIds = this._getFavoriteTeamIds();

		// Ensure nfl-games folder
		await this.setObjectNotExistsAsync(IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES, {
			type: "folder",
			common: { name: "NFL Games" },
			native: {},
		});

		// Write info channel
		const infoPath = `${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__INFO}`;
		await this.setObjectNotExistsAsync(infoPath, {
			type: "channel",
			common: { name: "Scoreboard info" },
			native: {},
		});

		let liveCount = 0;
		for (const ev of events) {
			const comp = (ev.competitions || [])[0] || {};
			const statusType = (comp.status || {}).type || {};
			if (statusType.state === "in") {
				liveCount++;
			}
		}

		const now = new Date().toISOString();
		await this._setSimpleState(`${infoPath}.lastUpdate`, "Last update", "string", "value", now);
		await this._setSimpleState(`${infoPath}.liveGameCount`, "Live game count", "number", "value", liveCount);
		await this._setSimpleState(`${infoPath}.eventCount`, "Event count", "number", "value", events.length);
		await this._setSimpleState(`${infoPath}.seasonYear`, "Season year", "number", "value", seasonYear);
		await this._setSimpleState(`${infoPath}.week`, "Week", "number", "value", weekNumber);

		const nextPollS = liveCount > 0 ? this._livePollIntervalMs() / 1000 : SCOREBOARD_POLL_INTERVAL_IDLE_MS / 1000;
		await this._setSimpleState(`${infoPath}.nextPollSeconds`, "Next poll in (s)", "number", "value", nextPollS);
		const eventIdList = events.map((e) => e.id).filter(Boolean);
		await this._setSimpleState(`${infoPath}.eventIds`, "Event IDs (JSON)", "string", "value.json", JSON.stringify(eventIdList));

		// Write per-game objects
		for (const ev of events) {
			const eventId = ev.id;
			if (!eventId) {
				continue;
			}
			const eventPath = `${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${eventId}`;

			await this.setObjectNotExistsAsync(replaceForbiddenCharactersInObjectID(eventPath), {
				type: "channel",
				common: { name: ev.name || ev.shortName || eventId },
				native: {},
			});

			await this._setSimpleState(`${eventPath}.name`, "Name", "string", "value", ev.name ?? "");
			await this._setSimpleState(`${eventPath}.shortName`, "Short name", "string", "value", ev.shortName ?? "");
			await this._setSimpleState(`${eventPath}.date`, "Kickoff (UTC)", "string", "value.time", ev.date ?? "");

			const comp = (ev.competitions || [])[0] || {};
			const statusObj = comp.status || {};
			const statusType = statusObj.type || {};

			const statusPath = `${eventPath}.status`;
			await this.setObjectNotExistsAsync(replaceForbiddenCharactersInObjectID(statusPath), {
				type: "channel",
				common: { name: "Status" },
				native: {},
			});
			await this._setSimpleState(`${statusPath}.state`, "State", "string", "value", statusType.state ?? "");
			await this._setSimpleState(`${statusPath}.name`, "Status name", "string", "value", statusType.name ?? "");
			await this._setSimpleState(`${statusPath}.detail`, "Detail", "string", "value", statusType.detail ?? "");
			await this._setSimpleState(`${statusPath}.shortDetail`, "Short detail", "string", "value", statusType.shortDetail ?? "");
			await this._setSimpleState(`${statusPath}.period`, "Period", "number", "value", statusObj.period ?? 0);
			await this._setSimpleState(`${statusPath}.displayClock`, "Clock", "string", "value", statusObj.displayClock ?? "");
			await this._setSimpleState(`${statusPath}.completed`, "Completed", "boolean", "indicator", statusType.completed ?? false);

			// Competitors
			const competitors = comp.competitors || [];
			for (const side of ["home", "away"]) {
				const c = competitors.find((x) => x.homeAway === side) || {};
				const team = c.team || {};
				const sidePath = `${eventPath}.${side}`;
				await this.setObjectNotExistsAsync(replaceForbiddenCharactersInObjectID(sidePath), {
					type: "channel",
					common: { name: side === "home" ? "Home team" : "Away team" },
					native: {},
				});
				await this._setSimpleState(`${sidePath}.teamId`, "ESPN team ID", "string", "value", team.id ?? "");
				await this._setSimpleState(`${sidePath}.abbreviation`, "Abbreviation", "string", "value", team.abbreviation ?? "");
				await this._setSimpleState(`${sidePath}.displayName`, "Display name", "string", "value", team.displayName ?? "");
				await this._setSimpleState(`${sidePath}.score`, "Score", "string", "value", c.score ?? "");
				await this._setSimpleState(`${sidePath}.winner`, "Winner", "boolean", "indicator", c.winner ?? false);
				await this._setSimpleState(`${sidePath}.isFavorite`, "Is favorite?", "boolean", "indicator", favoriteTeamIds.has(String(team.id ?? "")));
			}
		}

		// Drop event channels that are no longer on the current scoreboard slate
		if (eventIdList.length > 0) {
			await this._pruneStaleGameObjects(eventIdList);
		}

		this.log.debug(`Scoreboard stored: ${events.length} events, ${liveCount} live.`);
		return liveCount > 0;
	}

	/**
	 * Deletes `nfl-games.{eventId}` trees whose ESPN event id is not in the current scoreboard.
	 * Keeps the `info` channel. Skips pruning if the current slate is empty (safety).
	 * @param {Array<string|number>} currentEventIds
	 */
	async _pruneStaleGameObjects(currentEventIds) {
		const keep = new Set(currentEventIds.map(String));
		const folderPrefix = `${this.namespace}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.`;
		/** @type {Set<string>} */
		const staleEventIds = new Set();

		let objects;
		try {
			objects = await this.getAdapterObjectsAsync();
		} catch (error) {
			this.log.warn(`Could not list adapter objects for game cleanup: ${error.message}`);
			return;
		}

		for (const fullId of Object.keys(objects || {})) {
			if (!fullId.startsWith(folderPrefix)) {
				continue;
			}
			const rest = fullId.slice(folderPrefix.length);
			const eventId = rest.split(".")[0];
			if (!eventId || eventId === IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__INFO) {
				continue;
			}
			if (!keep.has(eventId)) {
				staleEventIds.add(eventId);
			}
		}

		if (!staleEventIds.size) {
			return;
		}

		this.log.info(`Removing ${staleEventIds.size} stale nfl-games event folder(s) no longer on the scoreboard.`);
		for (const eventId of staleEventIds) {
			const relativeId = `${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${eventId}`;
			try {
				await this.delObjectAsync(relativeId, { recursive: true });
			} catch (error) {
				this.log.warn(`Failed to delete stale game object '${relativeId}': ${error.message}`);
			}
		}
	}

	/**
	 * Creates (if not existing) and updates a simple state.
	 * @param {string} idPath - Object id path (without adapter namespace)
	 * @param {string} name - Human-readable name
	 * @param {"string"|"number"|"boolean"} type
	 * @param {string} role
	 * @param {string|number|boolean|null} value
	 */
	async _setSimpleState(idPath, name, type, role, value) {
		const id = replaceForbiddenCharactersInObjectID(idPath);
		await this.setObjectNotExistsAsync(id, {
			type: "state",
			common: { name, type, role, read: true, write: false },
			native: {},
		});
		await this.setStateAsync(id, { val: value, ack: true });
	}

	/* ====================================================== END SCOREBOARD LOOP =================================================== */

	/**************************************************************************************************************************************
	 * Resolves the ESPN NFL season year to use for division/group metadata.
	 * Prefers a season whose start/end window contains "now"; falls back to the newest listed year.
	 * Result is cached on the adapter instance for the process lifetime.
	 *
	 * @returns {Promise<number>}
	 **************************************************************************************************************************************/
	async resolveNFLDivisionSeasonYear() {
		if (this.nflDivisionSeasonYear != null) {
			return this.nflDivisionSeasonYear;
		}

		this.log.debug(`Resolving ESPN NFL season year for division/group fetches...`);

		let seasonsResponseData = null;
		try {
			const response = await axios.get(URL_ESPN_API_NFL_SEASONS, { timeout: TIMEOUT_URL_REQUESTS_PRIMARY });
			seasonsResponseData = response.data;
		} catch (error) {
			const errorMessage = `Error while fetching NFL seasons list for division data: ${error.message}`;
			throw new Error(errorMessage);
		}

		if (!seasonsResponseData || typeof seasonsResponseData !== "object" || !Array.isArray(seasonsResponseData.items) || seasonsResponseData.items.length === 0) {
			throw new Error(`Error while fetching NFL seasons list for division data: Invalid or empty response!`);
		}

		const seasonYears = [];
		for (const item of seasonsResponseData.items) {
			const ref = item && item.$ref;
			if (typeof ref !== "string") {
				continue;
			}
			const match = ref.match(/\/seasons\/(\d{4})(?:\?|$)/);
			if (match) {
				seasonYears.push(Number(match[1]));
			}
		}

		if (seasonYears.length === 0) {
			throw new Error(`Error while fetching NFL seasons list for division data: Could not parse any season years!`);
		}

		const nowMs = Date.now();
		let resolvedYear = seasonYears[0];

		for (const year of seasonYears) {
			const seasonUrl = URL_ESPN_API_NFL_SEASON.replace("{YEAR}", String(year));
			try {
				const seasonResponse = await axios.get(seasonUrl, { timeout: TIMEOUT_URL_REQUESTS_PRIMARY });
				const seasonData = seasonResponse.data;
				if (!seasonData || typeof seasonData !== "object") {
					continue;
				}
				const startMs = seasonData.startDate ? Date.parse(seasonData.startDate) : NaN;
				const endMs = seasonData.endDate ? Date.parse(seasonData.endDate) : NaN;
				if (!Number.isNaN(startMs) && !Number.isNaN(endMs) && nowMs >= startMs && nowMs <= endMs) {
					resolvedYear = year;
					break;
				}
			} catch (error) {
				this.log.debug(`Could not inspect season ${year} while resolving division season year: ${error.message}`);
			}
		}

		this.nflDivisionSeasonYear = resolvedYear;
		this.log.debug(`Using ESPN NFL season year ${resolvedYear} (regular season type ${ESPN_NFL_SEASON_TYPE_REGULAR}) for division/group fetches.`);
		return resolvedYear;
	}

	/**************************************************************************************************************************************
	 * Fetches NFL-Division metadata for a group id via the core API (current season year, regular-season type).
	 *
	 * @param {number} id - The ESPN group/division ID.
	 * @returns {Promise<NFLDivision>}
	 **************************************************************************************************************************************/
	async get_data_NFLDivision(id) {
		this.log.debug(`Getting data for NFL-Division with ID '${id}'...`);

		// Validate "id" parameter
		if (!id) {
			const errorMessage = `Error while getting data for NFL-Division: Missing value for parameter 'id'!`;
			throw new TypeError(errorMessage);
		}
		if (typeof id !== "number" || id <= 0) {
			const errorMessage = `Error while getting data for NFL-Division with ID '${id}': Invalid value for parameter 'id'!`;
			throw new TypeError(errorMessage);
		}

		const seasonYear = await this.resolveNFLDivisionSeasonYear();

		// Get the content from the NFL-Division information URL
		const url = URL_ESPN_API_NFL_DIVISION_DATA.replace("{YEAR}", String(seasonYear)).replace("{SEASON_TYPE}", String(ESPN_NFL_SEASON_TYPE_REGULAR)).replace("{GROUP-ID}", id.toString());
		this.log.silly(`Fetching data for NFL-Division with ID '${id}' using URL: '${url}'...`);

		const response = await axios.get(url, { timeout: TIMEOUT_URL_REQUESTS_PRIMARY });
		const responseData = response.data;

		if (typeof responseData === "object" && responseData !== null) {
			// Check if the response has the expected JSON structure
			if (responseData.id) {
				// Check if we got the response for the correct NFL-Team
				if (Number(responseData.id) === id) {
					// Create the NFLDivision object
					this.log.debug(`Creating NFLDivision object for NFL-Division with ID '${id}'...`);
					try {
						const newNFLDivision = new NFLDivision(Number(responseData.id), responseData.uid, responseData.slug, responseData.abbreviation, responseData.name);
						this.log.debug(`Successfully created NFLDivision object for NFL-Division with ID '${id}'`);
						return newNFLDivision;
					} catch (error) {
						const errorMessage = `Error while creating NFLDivision object for NFL-Division with ID '${id}': ${error.message}`;
						throw new Error(errorMessage);
					}
				} else {
					const errorMessage = `Error while getting data for NFL-Division with ID '${id}': Invalid data received!`;
					throw new Error(errorMessage);
				}
			} else {
				const errorMessage = `Error while getting data for NFL-Division with ID '${id}': Invalid JSON structure received!`;
				throw new Error(errorMessage);
			}
		} else {
			const errorMessage = `Error while getting data for NFL-Division with ID '${id}': Invalid response received!`;
			throw new Error(errorMessage);
		}
	}

	/**************************************************************************************************************************************
	 * @todo add documentation for this function
	 **************************************************************************************************************************************/
	async downloadAndStore_NFLVenue_Images(nflVenues) {
		this.log.debug(`Downloading and storing NFL-Venue images...`);

		// Validate received parameter 'nflVenues'
		if (!nflVenues) {
			const errorMessage = `Error while downloading and storing NFL-Venue images: Missing value for parameter 'nflVenues'!`;
			throw new TypeError(errorMessage);
		}
		try {
			NFLVenue.validateNFLVenuesArray(nflVenues, true);
		} catch (error) {
			const errorMessage = `Error while downloading and storing NFL-Venue images: ${error.message}`;
			throw new TypeError(errorMessage);
		}

		if (nflVenues.length === 0) {
			this.log.debug(`No NFL-Venues available — skipping venue image downloads.`);
			return;
		}

		// Download all NFL-Venue images for all NFL-Venues (stored in the nflVenues array)
		// Iterate NFL-Venues
		for (const nflVenue of nflVenues) {
			this.log.debug(`Downloading and storing NFL-Venue images for NFL-Venue with ID '${nflVenue.id}' & Name '${nflVenue.fullName}'...`);

			// Iterate NFL-Venue images
			for (const venueImage of nflVenue.venueImages) {
				if (!venueImage.localCopyMetaStorageSubPath) {
					this.log.warn(`Skipping download of NFL-Venue image for NFL-Venue with ID '${nflVenue.id}' & Name '${nflVenue.fullName}': missing local storage path.`);
					continue;
				}
				try {
					await this.downloadFileToAdapterFilesDataSubDir(venueImage.url, path.dirname(venueImage.localCopyMetaStorageSubPath), path.basename(venueImage.localCopyMetaStorageSubPath));
					this.log.debug(`Successfully downloaded and stored NFL-Venue image for NFL-Venue with ID '${nflVenue.id}' & Name '${nflVenue.fullName}'.`);
				} catch (error) {
					const errorMessage = `Error while downloading and storing NFL-Venue image for NFL-Venue with ID '${nflVenue.id}' & Name '${nflVenue.fullName}': ${error.message}`;
					this.log.error(errorMessage);
					this.log.warn(`Skipping download of NFL-Venue image for NFL-Venue with ID '${nflVenue.id}' & Name '${nflVenue.fullName}'!`);
					continue; // Skip to the next iteration
				}
			}
		}

		this.log.debug(`Finished downloading and storing NFL-Venue images.`);
	}

	/**************************************************************************************************************************************
	 * @todo add documentation for this function
	 **************************************************************************************************************************************/
	async createObjectStructure_NFLTeams(nflTeams) {
		this.log.debug(`Creating object structure for NFL-Teams...`);

		// Validate received parameter 'nflTeams'
		try {
			NFLTeam.validateNFLTeamsArray(nflTeams);
		} catch (error) {
			const errorMessage = `Error while creating object structure for NFL-Teams: ${error.message}`;
			throw new Error(errorMessage);
		}

		// CREATE FOLDER for NFL-TEAMS
		this.log.debug(`Creating folder for NFL-Teams...`);
		try {
			let folderCreationResult = null;
			folderCreationResult = await this.setObjectNotExistsAsync(replaceForbiddenCharactersInObjectID(IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS), {
				type: "folder",
				common: {
					name: IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAMS,
				},
				native: {},
			});

			if (folderCreationResult) {
				this.log.debug(`Successfully created folder for NFL-Teams.`);
			} else {
				this.log.debug(`Folder for NFL-Teams does already exist.`);

				// Update the folder
				this.log.debug(`Updating the folder for NFL-Teams...`);

				// Fetch the existing object to preserve its current properties
				const existingObject = await this.getObjectAsync(replaceForbiddenCharactersInObjectID(IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS));

				if (existingObject) {
					existingObject.common = {
						...existingObject.common,
						name: IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAMS,
					};

					try {
						const folderUpdateResult = await this.extendObjectAsync(replaceForbiddenCharactersInObjectID(IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS), existingObject);

						if (folderUpdateResult) {
							this.log.debug(`Successfully updated folder for NFL-Teams.`);
						} else {
							const warningMessage = `Folder for NFL-Teams could not be updated: Unknown error!`;
							this.log.warn(warningMessage);
						}
					} catch {
						const warningMessage = `Folder for NFL-Teams could not be updated: Updated folder information could not be stored!`;
						this.log.warn(warningMessage);
					}
				} else {
					const warningMessage = `Folder for NFL-Teams could not be updated: Could not retrieve existing folder information!`;
					this.log.warn(warningMessage);
				}
			}
		} catch (error) {
			const errorMessage = `Error while creating folder for NFL-Teams: ${error.message}`;
			this.log.error(errorMessage);
			throw new Error(errorMessage);
		}

		// Iterate NFL-Teams and create NFL-Team folder and all objects and states for every NFL-Team.
		const favoriteTeamIds = this._getFavoriteTeamIds();
		for (const nflTeam of nflTeams) {
			this.log.debug(`Creating objects and setting states for NFL-Team '${nflTeam.displayName}'...`);
			// Stable folder key: ESPN team id (not slug — slugs can rename).
			const nflTeamObjectIdKey = getNFLTeamObjectIdKey(nflTeam);

			// CREATE: NFL-TEAM FOLDER
			try {
				const nflTeamLogoForNFLTeamFolder = NFLTeam.getNFLTeamLogoOfType(nflTeam, NFLTeamLogoTypes.Scoreboard_Logo);
				const icon = (nflTeamLogoForNFLTeamFolder && (await this.ensureNFLTeamLogoBase64(nflTeamLogoForNFLTeamFolder))) || "";
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(nflTeam, IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey, nflTeam.displayName, "folder", undefined, undefined, undefined, undefined, icon, undefined, undefined, undefined, undefined, undefined);
			} catch (error) {
				throw new Error(error.message);
			}

			// CREATE: NFL-TEAM SUBFOLDER 'teamInfos'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(nflTeam, IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS, IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_INFOS, "folder", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'id'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(nflTeam, IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__ID, IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__ID, "state", undefined, undefined, "number", "value", undefined, false, true, nflTeam.id, undefined, true);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'uid'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(nflTeam, IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__UID, IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__UID, "state", undefined, undefined, "string", "value", undefined, false, true, nflTeam.uid, undefined, true);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'slug'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(nflTeam, IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__SLUG, IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__SLUG, "state", undefined, undefined, "string", "value", undefined, false, true, nflTeam.slug, undefined, true);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'abbreviation'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__ABBREVIATION,
					IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__ABBREVIATION,
					"state",
					undefined,
					undefined,
					"string",
					"value",
					undefined,
					false,
					true,
					nflTeam.abbreviation,
					undefined,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'displayName'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__DISPLAY_NAME,
					IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__DISPLAY_NAME,
					"state",
					undefined,
					undefined,
					"string",
					"value",
					undefined,
					false,
					true,
					nflTeam.displayName,
					undefined,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'shortDisplayName'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__SHORT_DISPLAY_NAME,
					IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__SHORT_DISPLAY_NAME,
					"state",
					undefined,
					undefined,
					"string",
					"value",
					undefined,
					false,
					true,
					nflTeam.shortDisplayName,
					undefined,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'name'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(nflTeam, IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__NAME, IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__NAME, "state", undefined, undefined, "string", "value", undefined, false, true, nflTeam.name, undefined, true);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'nickname'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__NICKNAME,
					IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__NICKNAME,
					"state",
					undefined,
					undefined,
					"string",
					"value",
					undefined,
					false,
					true,
					nflTeam.nickname,
					undefined,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'location'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__LOCATION,
					IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__LOCATION,
					"state",
					undefined,
					undefined,
					"string",
					"value",
					undefined,
					false,
					true,
					nflTeam.location,
					undefined,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// CREATE: NFL-TEAM SUBFOLDER 'teamColors'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_COLORS,
					IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_COLORS,
					"folder",
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'color'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_COLORS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__COLOR,
					IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__COLOR,
					"state",
					undefined,
					undefined,
					"string",
					"value",
					undefined,
					false,
					true,
					nflTeam.color,
					undefined,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'alternateColor'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_COLORS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__ALTERNATE_COLOR,
					IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__ALTERNATE_COLOR,
					"state",
					undefined,
					undefined,
					"string",
					"value",
					undefined,
					false,
					true,
					nflTeam.alternateColor,
					undefined,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'isActive'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__IS_ACTIVE,
					IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__IS_ACTIVE,
					"state",
					undefined,
					undefined,
					"boolean",
					"value",
					undefined,
					false,
					true,
					nflTeam.isActive,
					undefined,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'isAllStar'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__IS_ALLSTAR,
					IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__IS_ALLSTAR,
					"state",
					undefined,
					undefined,
					"boolean",
					"value",
					undefined,
					false,
					true,
					nflTeam.isAllStar,
					undefined,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'isFavorite'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__IS_FAVORITE,
					IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__IS_FAVORITE,
					"state",
					undefined,
					undefined,
					"boolean",
					"indicator",
					undefined,
					false,
					true,
					favoriteTeamIds.has(String(nflTeam.id)),
					undefined,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// CREATE: NFL-TEAM SUBFOLDER 'teamLogos'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGOS,
					IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_LOGOS,
					"folder",
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// CREATE: NFL-TEAM - 'teamLogos' SUBFOLDERS
			for (const teamLogo of nflTeam.teamLogos) {
				let ioBrokerObjectID_folder_nflTeam_teamLogo = null;
				let ioBrokerObjectName_folder_nflTeam_teamLogo = null;
				if (teamLogo.isDefaultLogo && teamLogo.isFullLogo && !teamLogo.isDarkLogo && !teamLogo.isScoreboardLogo) {
					ioBrokerObjectID_folder_nflTeam_teamLogo = IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGO__DEFAULT_LOGO;
					ioBrokerObjectName_folder_nflTeam_teamLogo = IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_LOGO__DEFAULT_LOGO;
				} else if (!teamLogo.isDefaultLogo && teamLogo.isFullLogo && teamLogo.isDarkLogo && !teamLogo.isScoreboardLogo) {
					ioBrokerObjectID_folder_nflTeam_teamLogo = IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGO__DEFAULT_LOGO_DARK;
					ioBrokerObjectName_folder_nflTeam_teamLogo = IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_LOGO__DEFAULT_LOGO_DARK;
				} else if (!teamLogo.isDefaultLogo && teamLogo.isFullLogo && !teamLogo.isDarkLogo && teamLogo.isScoreboardLogo) {
					ioBrokerObjectID_folder_nflTeam_teamLogo = IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGO__SCOREBOARD_LOGO;
					ioBrokerObjectName_folder_nflTeam_teamLogo = IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_LOGO__SCOREBOARD_LOGO;
				} else if (!teamLogo.isDefaultLogo && teamLogo.isFullLogo && teamLogo.isDarkLogo && teamLogo.isScoreboardLogo) {
					ioBrokerObjectID_folder_nflTeam_teamLogo = IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGO__SCOREBOARD_LOGO_DARK;
					ioBrokerObjectName_folder_nflTeam_teamLogo = IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_LOGO__SCOREBOARD_LOGO_DARK;
				}

				if (ioBrokerObjectID_folder_nflTeam_teamLogo != null && ioBrokerObjectName_folder_nflTeam_teamLogo != null) {
					const teamLogoBase64 = (await this.ensureNFLTeamLogoBase64(teamLogo)) || "";

					// CREATE: 'TEAM LOGOS' SUBFOLDER for LOGO-TYPE
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGOS + "." + ioBrokerObjectID_folder_nflTeam_teamLogo,
							ioBrokerObjectName_folder_nflTeam_teamLogo,
							"folder",
							undefined,
							undefined,
							undefined,
							undefined,
							teamLogoBase64,
							undefined,
							undefined,
							undefined,
							undefined,
							undefined,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'url'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGOS + "." + ioBrokerObjectID_folder_nflTeam_teamLogo + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__URL,
							IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__URL,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo,
							undefined,
							"string",
							"text.url",
							undefined,
							false,
							true,
							teamLogo.url,
							undefined,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'alternativeURL'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGOS + "." + ioBrokerObjectID_folder_nflTeam_teamLogo + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__ALTERNATIVE_URL,
							IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__ALTERNATIVE_URL,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo,
							undefined,
							"string",
							"text.url",
							undefined,
							false,
							true,
							teamLogo.alternativeURL,
							undefined,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'width'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGOS + "." + ioBrokerObjectID_folder_nflTeam_teamLogo + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__WIDTH,
							IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__WIDTH,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo,
							undefined,
							"number",
							"value",
							undefined,
							false,
							true,
							teamLogo.width,
							"px",
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'height'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGOS + "." + ioBrokerObjectID_folder_nflTeam_teamLogo + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__HEIGHT,
							IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__HEIGHT,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo,
							undefined,
							"number",
							"value",
							undefined,
							false,
							true,
							teamLogo.height,
							"px",
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isDefaultLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGOS + "." + ioBrokerObjectID_folder_nflTeam_teamLogo + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__IS_DEFAULT_LOGO,
							IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__IS_DEFAULT_LOGO,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isDefaultLogo,
							undefined,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isFullLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGOS + "." + ioBrokerObjectID_folder_nflTeam_teamLogo + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__IS_FULL_LOGO,
							IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__IS_FULL_LOGO,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isFullLogo,
							undefined,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isDarkLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGOS + "." + ioBrokerObjectID_folder_nflTeam_teamLogo + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__IS_DARK_LOGO,
							IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__IS_DARK_LOGO,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isDarkLogo,
							undefined,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isScoreboardLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGOS + "." + ioBrokerObjectID_folder_nflTeam_teamLogo + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__IS_SCOREBOARD_LOGO,
							IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__IS_SCOREBOARD_LOGO,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isScoreboardLogo,
							undefined,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'localCopyMetaStorageSubpath'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGOS + "." + ioBrokerObjectID_folder_nflTeam_teamLogo + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__LOCAL_COPY_META_STORAGE_SUBPATH,
							IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__LOCAL_COPY_META_STORAGE_SUBPATH,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo,
							undefined,
							"string",
							"value",
							undefined,
							false,
							true,
							teamLogo.localCopyMetaStorageSubPath,
							undefined,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'base64Image'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_LOGOS + "." + ioBrokerObjectID_folder_nflTeam_teamLogo + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_LOGO__BASE64_IMAGE,
							IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_LOGO__BASE64_IMAGE,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo,
							undefined,
							"string",
							"value",
							undefined,
							false,
							true,
							teamLogoBase64,
							undefined,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}
				}
			}

			if (nflTeam.nflDivision) {
				// CREATE: NFL-TEAM SUBFOLDER 'teamDivision'
				try {
					await this.createOrUpdateObjectAndSetState_for_NFLTeam(
						nflTeam,
						IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION,
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION,
						"folder",
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
					);
				} catch (error) {
					throw new Error(error.message);
				}

				// STORE: NFL-TEAM - DIVISION 'id'
				try {
					await this.createOrUpdateObjectAndSetState_for_NFLTeam(
						nflTeam,
						IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION__ID,
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION__ID,
						"state",
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION,
						undefined,
						"number",
						"value",
						undefined,
						false,
						true,
						nflTeam.nflDivision.id,
						undefined,
						true,
					);
				} catch (error) {
					throw new Error(error.message);
				}

				// STORE: NFL-TEAM - DIVISION 'uid'
				try {
					await this.createOrUpdateObjectAndSetState_for_NFLTeam(
						nflTeam,
						IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION__UID,
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION__UID,
						"state",
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION,
						undefined,
						"string",
						"value",
						undefined,
						false,
						true,
						nflTeam.nflDivision.uid,
						undefined,
						true,
					);
				} catch (error) {
					throw new Error(error.message);
				}

				// STORE: NFL-TEAM - DIVISION 'slug'
				try {
					await this.createOrUpdateObjectAndSetState_for_NFLTeam(
						nflTeam,
						IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION__SLUG,
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION__SLUG,
						"state",
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION,
						undefined,
						"string",
						"value",
						undefined,
						false,
						true,
						nflTeam.nflDivision.slug,
						undefined,
						true,
					);
				} catch (error) {
					throw new Error(error.message);
				}

				// STORE: NFL-TEAM - DIVISION 'abbreviation'
				try {
					await this.createOrUpdateObjectAndSetState_for_NFLTeam(
						nflTeam,
						IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION__ABBREVIATION,
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION__ABBREVIATION,
						"state",
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION,
						undefined,
						"string",
						"value",
						undefined,
						false,
						true,
						nflTeam.nflDivision.abbreviation,
						undefined,
						true,
					);
				} catch (error) {
					throw new Error(error.message);
				}

				// STORE: NFL-TEAM - DIVISION 'name'
				try {
					await this.createOrUpdateObjectAndSetState_for_NFLTeam(
						nflTeam,
						IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_DIVISION__NAME,
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION__NAME,
						"state",
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_DIVISION,
						undefined,
						"string",
						"value",
						undefined,
						false,
						true,
						nflTeam.nflDivision.name,
						undefined,
						true,
					);
				} catch (error) {
					throw new Error(error.message);
				}

			} else {
				this.log.warn(`Skipping teamDivision object structure for NFL-Team '${nflTeam.displayName}': no division data available.`);
			}

			if (nflTeam.nflVenue) {
				// CREATE: NFL-TEAM SUBFOLDER 'teamVenue'
				try {
					await this.createOrUpdateObjectAndSetState_for_NFLTeam(
						nflTeam,
						IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE,
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_VENUE,
						"folder",
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
					);
				} catch (error) {
					throw new Error(error.message);
				}

				// STORE: NFL-TEAM - VENUE 'id'
				try {
					await this.createOrUpdateObjectAndSetState_for_NFLTeam(
						nflTeam,
						IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_VENUE__ID,
						IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_VENUE__ID,
						"state",
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_VENUE,
						undefined,
						"number",
						"value",
						undefined,
						false,
						true,
						nflTeam.nflVenue.id,
						undefined,
						true,
					);
				} catch (error) {
					throw new Error(error.message);
				}

				// STORE: NFL-TEAM - VENUE 'fullName'
				try {
					await this.createOrUpdateObjectAndSetState_for_NFLTeam(
						nflTeam,
						IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_VENUE__FULL_NAME,
						IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_VENUE__FULL_NAME,
						"state",
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_VENUE,
						undefined,
						"string",
						"value",
						undefined,
						false,
						true,
						nflTeam.nflVenue.fullName,
						undefined,
						true,
					);
				} catch (error) {
					throw new Error(error.message);
				}

				if (nflTeam.nflVenue.venueAddress) {
					// CREATE: 'TEAM VENUE' SUBFOLDER for VENUE ADDRESS
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS,
							IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS,
							"folder",
							undefined,
							undefined,
							undefined,
							undefined,
							undefined,
							undefined,
							undefined,
							undefined,
							undefined,
							undefined,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM VENUE 'city'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS__CITY,
							IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS__CITY,
							"state",
							IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS,
							undefined,
							"string",
							"value",
							undefined,
							false,
							true,
							nflTeam.nflVenue.venueAddress.city,
							undefined,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM VENUE 'state'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS__STATE,
							IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS__STATE,
							"state",
							IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS,
							undefined,
							"string",
							"value",
							undefined,
							false,
							true,
							nflTeam.nflVenue.venueAddress.state,
							undefined,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM VENUE 'zipCode'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS__ZIP_CODE,
							IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS__ZIP_CODE,
							"state",
							IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_ADDRESS,
							undefined,
							"string",
							"value",
							undefined,
							false,
							true,
							nflTeam.nflVenue.venueAddress.zipCode,
							undefined,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

				} else {
					this.log.warn(`Skipping venueAddress object structure for NFL-Team '${nflTeam.displayName}': no venue address available.`);
				}

				// STORE: TEAM VENUE 'hasGrass'
				try {
					await this.createOrUpdateObjectAndSetState_for_NFLTeam(
						nflTeam,
						IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_VENUE__HAS_GRASS,
						IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_VENUE__HAS_GRASS,
						"state",
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_VENUE,
						undefined,
						"boolean",
						"indicator",
						undefined,
						false,
						true,
						nflTeam.nflVenue.grass,
						undefined,
						true,
					);
				} catch (error) {
					throw new Error(error.message);
				}

				// STORE: TEAM VENUE 'isIndoor'
				try {
					await this.createOrUpdateObjectAndSetState_for_NFLTeam(
						nflTeam,
						IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE + "." + IOBROKER_OBJECT_ID__STATE__NFL_TEAM__TEAM_VENUE__IS_INDOOR,
						IOBROKER_OBJECT_NAME__STATE__NFL_TEAM__TEAM_VENUE__IS_INDOOR,
						"state",
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_VENUE,
						undefined,
						"boolean",
						"indicator",
						undefined,
						false,
						true,
						nflTeam.nflVenue.indoor,
						undefined,
						true,
					);
				} catch (error) {
					throw new Error(error.message);
				}

				// CREATE: 'TEAM VENUE' SUBFOLDER for VENUE IMAGES
				try {
					await this.createOrUpdateObjectAndSetState_for_NFLTeam(
						nflTeam,
						IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_IMAGES,
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_IMAGES,
						"folder",
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
					);
				} catch (error) {
					throw new Error(error.message);
				}

				/*
				let venueImageCounter = 1;
				for (const venueImage of nflTeam.nflVenue.venueImages) {
					// CREATE: 'TEAM VENUE IMAGES' SUBFOLDER for VENUE IMAGE
				try {
					await this.createOrUpdateObjectAndSetState_for_NFLTeam(
						nflTeam,
						IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS + "." + nflTeamObjectIdKey + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE + "." + IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_IMAGES,
						IOBROKER_OBJECT_NAME__FOLDER__NFL_TEAM__TEAM_VENUE__VENUE_IMAGES,
						"folder",
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
						undefined,
					);
				} catch (error) {
					throw new Error(error.message);
				}
				}
				*/

			} else {
				this.log.warn(`Skipping teamVenue object structure for NFL-Team '${nflTeam.displayName}': no venue data available.`);
			}

			this.log.debug(`Successfully created objects and set states for NFL-Team '${nflTeam.displayName}'.`);
		}
	}

	/* -------------------------------------------------------- HELPER FUNCTIONS ------------------------------------------------------- */

	/**************************************************************************************************************************************
	 * Downloads a file from the specified URL and stores it in the adapter's files data directory.
	 *
	 * @param {string} downloadURL - The URL of the file to be downloaded.
	 * @param {string} subPath - The sub-directory path within the adapter's files data directory where the file should be stored.
	 * @param {string} fileNameAndExtension - The name of the file along with its extension.
	 *
	 * @returns {Promise<boolean>} - Returns a promise that resolves to true if the file is successfully downloaded and stored.
	 * @throws {Error} - Throws an error if there is an issue with downloading or storing the file.
	 **************************************************************************************************************************************/
	async downloadFileToAdapterFilesDataSubDir(downloadURL, subPath, fileNameAndExtension) {
		let storePath = null;
		if (subPath != null && subPath.length > 0) {
			if (subPath.startsWith("/")) {
				subPath = subPath.slice(1);
			}
			if (subPath.endsWith("/")) {
				subPath = subPath.slice(0, -1);
			}
			storePath = subPath + "/" + fileNameAndExtension;
		} else {
			storePath = fileNameAndExtension;
		}

		try {
			const response = await axios.get(downloadURL, { responseType: "arraybuffer" });
			await this.writeFileAsync(this.namespace, storePath, response.data);
			return true;
		} catch (error) {
			const errorMessage = `Error while downloading and storing file from URL '${downloadURL}': ${error.message}`;
			throw new Error(errorMessage);
		}
	}

	/**************************************************************************************************************************************
	 * Ensures a team logo has a base64 data-URI, preferring the already downloaded adapter file to avoid a second HTTP fetch.
	 **************************************************************************************************************************************/
	async ensureNFLTeamLogoBase64(teamLogo) {
		if (!(teamLogo instanceof NFLTeamLogo)) {
			return null;
		}

		if (teamLogo.localCopyMetaStorageSubPath) {
			const storePath = teamLogo.localCopyMetaStorageSubPath.replace(/\\/g, "/");
			try {
				const fileResult = await this.readFileAsync(this.namespace, storePath);
				const localFileBuffer = fileResult && Object.prototype.hasOwnProperty.call(fileResult, "file") ? fileResult.file : fileResult;
				const contentType = fileResult && fileResult.mimeType ? fileResult.mimeType : undefined;
				return await teamLogo.ensureBase64Image({ localFileBuffer, contentType });
			} catch (error) {
				this.log.debug(`Could not read local logo file '${storePath}' for base64 conversion: ${error.message}. Falling back to URL fetch.`);
			}
		}

		return await teamLogo.ensureBase64Image();
	}

	/**************************************************************************************************************************************
	 * Creates or updates an object for a given NFL-Team in the specified namespace, and sets its state if applicable.
	 *
	 * @param {Object} nflTeam - The NFL team for which the object is being created or updated. Must have a `displayName` property.
	 * @param {string} namespacePath - The namespace path where the object will be created or updated.
	 * @param {string} objectName - The name of the object to be created or updated.
	 * @param {"folder" | "state"} objectType - The type of the object.
	 * @param {string} [subCategory] - An optional sub-category. Used only for ioBroker logging.
	 * @param {string} [objectDescription] - A description of the object. If not provided, this field will be omitted.
	 * @param {"number" | "string" | "boolean" | "array" | "object" | "mixed" | "file"} [commonType] - The common type of the object. This is not applicable for "folder" objects.
	 * @param {string} [role] - The role of the object.
	 * @param {string} [icon] - The icon for the object.
	 * @param {boolean} [write] - Specifies if the object is writable.
	 * @param {boolean} [read] - Specifies if the object is readable.
	 * @param {*} [value] - The value to be set for the object if its type is "state".
	 * @param {string} [unit] - The unit of the value to be set for the object if its type is "state".
	 * @param {boolean} [acknowledge] - Acknowledgment flag for setting the state.
	 *
	 * @returns {Promise<void>} - Returns a promise that resolves when the object creation or update, and state setting (if applicable) is complete.
	 * @throws {Error} - Throws an error if there is an issue with creating, updating, or setting the state of the object.
	 *
	 * @todo Completely recreate this documentation
	 **************************************************************************************************************************************/
	async createOrUpdateObjectAndSetState_for_NFLTeam(nflTeam, namespacePath, objectName, objectType, subCategory, objectDescription, commonType, role, icon, write, read, value, unit, acknowledge) {
		// Validate subcategory
		if (subCategory !== undefined && subCategory !== null && typeof subCategory !== "string" && subCategory !== "") {
			const errorMessage = `Error while creating ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}': The received value for parameter 'subCategory' is invalid: '${subCategory}' (${typeof subCategory})!`;
			this.log.error(errorMessage);
			throw new TypeError(errorMessage);
		}
		subCategory = subCategory ? `for '${subCategory}' ` : "";

		// CREATE OBJECT
		this.log.silly(`Creating ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}'...`);

		// Replace forbidden characters in object-id.
		namespacePath = replaceForbiddenCharactersInObjectID(namespacePath);

		// Validate other parameters
		if (!(nflTeam instanceof NFLTeam)) {
			const errorMessage = `Error while creating ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}': The received value for parameter 'nflTeam' is not an instance of 'NFLTeam'!`;
			this.log.error(errorMessage);
			throw new TypeError(errorMessage);
		}
		if (namespacePath === undefined || namespacePath === null || typeof namespacePath !== "string" || namespacePath == "") {
			const errorMessage = `Error while creating ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}': The received value for parameter 'namespacePath' is invalid: '${namespacePath}' (${typeof namespacePath})!`;
			this.log.error(errorMessage);
			throw new TypeError(errorMessage);
		}
		if (objectName === undefined || objectName === null || typeof objectName !== "string" || objectName == "") {
			const errorMessage = `Error while creating ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}': The received value for parameter 'objectName' is invalid: '${objectName}' (${typeof objectName})!`;
			this.log.error(errorMessage);
			throw new TypeError(errorMessage);
		}
		if (objectType.toString().toLowerCase() == "folder") {
			objectType = "folder";
		} else if (objectType.toString().toLowerCase() == "state") {
			objectType = "state";
		} else {
			const errorMessage = `Error while creating ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}': The received value for parameter 'objectType' is invalid: '${objectType}' (${typeof objectType})!`;
			this.log.error(errorMessage);
			throw new TypeError(errorMessage);
		}
		if (objectType === "state" && objectDescription !== undefined && objectDescription !== null && typeof objectDescription !== "string") {
			const errorMessage = `Error while creating ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}': The received value for parameter 'objectDescription' is invalid: '${objectDescription}' (${typeof objectDescription})!`;
			this.log.error(errorMessage);
			throw new TypeError(errorMessage);
		}
		if (objectType === "state" && commonType !== "number" && commonType !== "string" && commonType !== "boolean" && commonType !== "array" && commonType !== "object" && commonType !== "mixed" && commonType !== "file") {
			const errorMessage = `Error while creating ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}': The received value for parameter 'commonType' is invalid: '${commonType}' (${typeof commonType})!`;
			this.log.error(errorMessage);
			throw new TypeError(errorMessage);
		}
		if (objectType === "state" && (role === undefined || role === null || typeof role !== "string" || role == "")) {
			const errorMessage = `Error while creating ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}': The received value for parameter 'role' is invalid: '${role}' (${typeof role})!`;
			this.log.error(errorMessage);
			throw new TypeError(errorMessage);
		}
		if (objectType === "state" && icon !== undefined && icon !== null && typeof icon !== "string") {
			const errorMessage = `Error while creating ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}': The received value for parameter 'icon' is invalid: '${icon}' (${typeof icon})!`;
			this.log.error(errorMessage);
			throw new TypeError(errorMessage);
		}
		if (objectType === "state" && typeof write !== "boolean") {
			const errorMessage = `Error while creating ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}': The received value for parameter 'write' is invalid: '${write}' (${typeof write})!`;
			this.log.error(errorMessage);
			throw new TypeError(errorMessage);
		}
		if (objectType === "state" && typeof read !== "boolean") {
			const errorMessage = `Error while creating ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}': The received value for parameter 'read' is invalid: '${read}' (${typeof read})!`;
			this.log.error(errorMessage);
			throw new TypeError(errorMessage);
		}
		if (objectType === "state" && (value === undefined || value === null)) {
			value = "";
		}
		if (objectType === "state" && unit !== undefined && unit !== null && typeof unit !== "string") {
			const errorMessage = `Error while creating ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}': The received value for parameter 'unit' is invalid: '${unit}' (${typeof unit})!`;
			this.log.error(errorMessage);
			throw new TypeError(errorMessage);
		}
		if (objectType === "state" && (acknowledge === undefined || acknowledge === null || typeof acknowledge !== "boolean")) {
			const errorMessage = `Error while creating ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}': The received value for parameter 'acknowledge' is invalid: '${acknowledge}' (${typeof acknowledge})!`;
			this.log.error(errorMessage);
			throw new TypeError(errorMessage);
		}

		try {
			let objectCreationResult = null;
			if (objectType === "folder") {
				objectCreationResult = await this.setObjectNotExistsAsync(namespacePath, {
					type: objectType,
					common: {
						name: objectName,
						desc: objectDescription,
						icon: icon,
					},
					native: {},
				});
			} else if (objectType === "state" && (commonType === "number" || commonType === "string" || commonType === "boolean" || commonType === "array" || commonType === "object" || commonType === "mixed" || commonType === "file") && role && typeof write == "boolean" && typeof read == "boolean") {
				objectCreationResult = await this.setObjectNotExistsAsync(namespacePath, {
					type: objectType,
					common: {
						name: objectName,
						desc: objectDescription,
						type: commonType,
						role: role,
						icon: icon,
						read: read,
						write: write,
						unit: unit,
					},
					native: {},
				});
			}

			if (objectCreationResult) {
				this.log.silly(`Successfully created ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}'.`);
			} else {
				this.log.silly(`${objectType.charAt(0).toUpperCase() + objectType.slice(1).toLowerCase()} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}' does already exist.`);

				// Update the object
				this.log.silly(`Updating the ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}'...`);

				// Fetch the existing object to preserve its current properties
				const existingObject = await this.getObjectAsync(namespacePath);

				if (existingObject) {
					// Set values to update
					existingObject.common.name = objectName;
					if (objectDescription !== undefined && objectDescription !== null) {
						existingObject.common.desc = objectDescription;
					}
					if (commonType !== undefined && commonType !== null && objectType === "state") {
						existingObject.common.type = commonType;
					}
					if (role !== undefined && role !== null) {
						existingObject.common.role = role;
					}
					if (icon !== undefined && icon !== null) {
						existingObject.common.icon = icon;
					}
					if (write !== undefined && write !== null) {
						existingObject.common.write = write;
					}
					if (read !== undefined && read !== null) {
						existingObject.common.read = read;
					}

					try {
						const objectUpdateResult = await this.extendObjectAsync(namespacePath, existingObject);

						if (objectUpdateResult) {
							this.log.silly(`Successfully updated ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}'.`);
						} else {
							const warningMessage = `${objectType.charAt(0).toUpperCase() + objectType.slice(1).toLowerCase()} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}' could not be updated: Unknown error!`;
							this.log.warn(warningMessage);
						}
					} catch {
						const warningMessage = `${objectType.charAt(0).toUpperCase() + objectType.slice(1).toLowerCase()} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}' could not be updated: Updated object information could not be stored!`;
						this.log.warn(warningMessage);
					}
				} else {
					const warningMessage = `${objectType.charAt(0).toUpperCase() + objectType.slice(1).toLowerCase()} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}' could not be updated: Could not retrieve existing object information!`;
					this.log.warn(warningMessage);
				}
			}
		} catch (error) {
			const errorMessage = `Error while creating ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}': ${error.message}`;
			this.log.error(errorMessage);
			throw new Error(errorMessage);
		}

		// SET STATE
		if (objectType == "state") {
			this.log.silly(`Setting ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}'...`);

			try {
				await this.setStateAsync(namespacePath, {
					val: value,
					ack: acknowledge,
				});

				this.log.silly(`Successfully set ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}'.`);
			} catch (error) {
				const errorMessage = `Error while setting ${objectType} '${objectName}' ${subCategory}for NFL-Team '${nflTeam.displayName}': ${error.message}`;
				this.log.error(errorMessage);
				throw new Error(errorMessage);
			}
		}
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			if (this._scoreboardTimer !== null) {
				clearTimeout(this._scoreboardTimer);
				this._scoreboardTimer = null;
			}
			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	/**
	 * Builds the favorite-team options for admin `selectSendTo`.
	 * Prefers in-memory `this.nflTeams` (current after init);
	 * falls back to team displayName/abbreviation states if memory is empty.
	 * Rebuilt on every admin request so the dropdown stays fresh.
	 * @returns {Promise<Array<{label: string, value: string}>>}
	 */
	async _getTeamsForAdmin() {
		if (Array.isArray(this.nflTeams) && this.nflTeams.length) {
			return this.nflTeams
				.slice()
				.sort((a, b) => a.displayName.localeCompare(b.displayName))
				.map((t) => ({
					label: `${t.displayName} (${t.abbreviation})`,
					value: String(t.id),
				}));
		}

		const displayNamePattern =
			`${IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS}.*.${IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS}.${IOBROKER_OBJECT_ID__STATE__NFL_TEAM__DISPLAY_NAME}`;
		const abbreviationPattern =
			`${IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS}.*.${IOBROKER_OBJECT_ID__FOLDER__NFL_TEAM__TEAM_INFOS}.${IOBROKER_OBJECT_ID__STATE__NFL_TEAM__ABBREVIATION}`;

		const [displayNames, abbreviations] = await Promise.all([
			this.getStatesAsync(displayNamePattern),
			this.getStatesAsync(abbreviationPattern),
		]);

		/** @type {Map<string, {id: string, displayName: string, abbreviation: string}>} */
		const byId = new Map();
		const teamIdFromFullId = (fullId) => {
			const match = String(fullId).match(new RegExp(`\\.${IOBROKER_OBJECT_ID__FOLDER__NFL_TEAMS}\\.(\\d+)\\.`));
			return match ? match[1] : null;
		};

		for (const [fullId, st] of Object.entries(displayNames || {})) {
			const teamId = teamIdFromFullId(fullId);
			if (!teamId) {
				continue;
			}
			if (!byId.has(teamId)) {
				byId.set(teamId, { id: teamId, displayName: "", abbreviation: "" });
			}
			if (st && st.val != null && st.val !== "") {
				byId.get(teamId).displayName = String(st.val);
			}
		}
		for (const [fullId, st] of Object.entries(abbreviations || {})) {
			const teamId = teamIdFromFullId(fullId);
			if (!teamId) {
				continue;
			}
			if (!byId.has(teamId)) {
				byId.set(teamId, { id: teamId, displayName: "", abbreviation: "" });
			}
			if (st && st.val != null && st.val !== "") {
				byId.get(teamId).abbreviation = String(st.val);
			}
		}

		return [...byId.values()]
			.map((t) => ({
				label: t.abbreviation ? `${t.displayName || t.id} (${t.abbreviation})` : t.displayName || t.id,
				value: t.id,
			}))
			.sort((a, b) => a.label.localeCompare(b.label));
	}

	/**
	 * Handles messages sent to the adapter instance (used by admin selectSendTo / sendTo).
	 * @param {ioBroker.Message} obj
	 */
	onMessage(obj) {
		if (typeof obj !== "object" || !obj) {
			return;
		}
		if (obj.command === "getTeams") {
			// Always answer so admin UI does not hang; options are rebuilt on every open/request.
			this._getTeamsForAdmin()
				.then((teams) => {
					this.log.debug(`getTeams: returning ${teams.length} team option(s) to admin`);
					if (obj.callback) {
						this.sendTo(obj.from, obj.command, teams, obj.callback);
					}
				})
				.catch((error) => {
					this.log.error(`getTeams failed: ${error.message}`);
					if (obj.callback) {
						this.sendTo(obj.from, obj.command, [], obj.callback);
					}
				});
		}
	}
}

/**
 * Stable ioBroker object-id segment for an NFL team folder.
 * Uses ESPN numeric team id — never the mutable slug.
 * @param {{id: number}|number|string} nflTeamOrId
 * @returns {string}
 */
function getNFLTeamObjectIdKey(nflTeamOrId) {
	const id = nflTeamOrId != null && typeof nflTeamOrId === "object" ? nflTeamOrId.id : nflTeamOrId;
	const numericId = Number(id);
	if (id === undefined || id === null || id === "" || Number.isNaN(numericId)) {
		throw new TypeError(`Invalid NFL team id for object key: ${id}`);
	}
	return String(numericId);
}

function replaceForbiddenCharactersInObjectID(objectID) {
	return (objectID || "").replace(FORBIDDEN_CHARS, "_");
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Nfl(options);
} else {
	// otherwise start the instance directly
	new Nfl();
}
