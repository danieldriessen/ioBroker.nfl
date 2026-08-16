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
const IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__CURRENT = "current";
const IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE = "archive";
const IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE_ALL = "all";
const IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE_FAVORITES = "favorites";
const IOBROKER_OBJECT_ID__FOLDER__VIEWS = "views";
const IOBROKER_OBJECT_ID__FOLDER__SCHEDULE = "schedule";
const IOBROKER_OBJECT_ID__STATE__LEFT_SLATE_AT = "_leftSlateAt";

// Scoreboard poll settings
const URL_ESPN_CDN_SCOREBOARD = "https://cdn.espn.com/core/nfl/scoreboard?xhr=1&limit=50";
const SCOREBOARD_POLL_INTERVAL_IDLE_MS = 300_000; // 5 min when no live games
const SCOREBOARD_POLL_INTERVAL_MIN_S = 15;
const SCOREBOARD_POLL_INTERVAL_MAX_S = 300;
const SCHEDULE_POLL_INTERVAL_MIN_H = 1;
const SCHEDULE_POLL_INTERVAL_MAX_H = 48;
const SCHEDULE_POLL_INTERVAL_DEFAULT_H = 6;
/** @type {Record<number, string>} */
const ESPN_SEASON_TYPE_NAMES = {
	1: "Preseason",
	2: "Regular Season",
	3: "Postseason",
};
const URL_ESPN_API_NFL_WEEKS =
	"https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/{YEAR}/types/{SEASON_TYPE}/weeks?limit=50";

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
		/** @type {ReturnType<typeof setTimeout>|null} */
		this._scheduleTimer = null;
		/** @type {ReturnType<typeof setTimeout>|null} */
		this._teamDataTimer = null;
		/** @type {boolean} */
		this._teamDataRefreshInProgress = false;
		/** @type {object[]} Last scoreboard-week games (for views merge) */
		this._currentGames = [];
		/** @type {object[]} Multi-week schedule games (for focus / next favorite) */
		this._scheduleGames = [];
	}

	/**************************************************************************************************************************************
	 * This function is called when the adapter is ready
	 * (once databases are connected and the adapter has received configuration).
	 **************************************************************************************************************************************/
	async onReady() {
		// INITIALIZING THE ADAPTER

		// Reset the connection indicator during startup (to 'false')
		this.setState("info.connection", false, true);

		try {
			await this.refreshTeamMasterData({ reason: "startup" });
		} catch (error) {
			this.log.error(error.message);
			return;
		}

		// Initialization completed successfully
		await this.setStateAsync("info.connection", true, true);

		// Start scoreboard + multi-week schedule + team master-data refresh loops
		this._startScoreboardLoop();
		this._startScheduleLoop();
		this._startTeamDataRefreshLoop();
	}

	/**
	 * Full refresh of teams, logos, division/venue metadata, venue images, and object tree.
	 * Used at startup and on the slow periodic team-data timer.
	 * @param {{reason?: string}} [opts]
	 */
	async refreshTeamMasterData(opts = {}) {
		const reason = opts.reason || "refresh";
		if (this._teamDataRefreshInProgress) {
			this.log.warn(`Team master-data refresh skipped (${reason}): already in progress.`);
			return;
		}
		this._teamDataRefreshInProgress = true;
		this.log.info(`Refreshing NFL team master data (${reason})…`);
		try {
			this.nflDivisions = [];
			this.nflVenues = [];
			this.nflDivisionSeasonYear = null;

			this.nflTeams = await this.get_basicData_NFLTeams();
			await this.downloadAndStore_NFLTeam_LogoImages(this.nflTeams);
			await this.get_additionalData_NFLTeams(this.nflTeams, this.nflDivisions, this.nflVenues);
			await this.downloadAndStore_NFLVenue_Images(this.nflVenues);
			await this.createObjectStructure_NFLTeams(this.nflTeams);
			try {
				await this._pruneOrphanImageFiles();
			} catch (error) {
				this.log.warn(`Image orphan cleanup failed: ${error.message}`);
			}
			this.log.info(
				`Team master data refresh done (${reason}): ${this.nflTeams.length} teams, ${this.nflVenues.length} venues.`,
			);
		} finally {
			this._teamDataRefreshInProgress = false;
		}
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

	/** @returns {number} seasons to keep; 0 = unlimited */
	_archiveSeasonsToKeep() {
		const raw = Number(this.config.archiveSeasonsToKeep);
		if (!Number.isFinite(raw) || raw < 0) {
			return 2;
		}
		return Math.min(20, Math.floor(raw));
	}

	/** @returns {number} */
	_currentPostGameLingerHours() {
		const raw = Number(this.config.currentPostGameLingerHours);
		if (!Number.isFinite(raw) || raw < 0) {
			return 12;
		}
		return Math.min(168, raw);
	}

	/** @returns {number} */
	_focusPostGameLingerHours() {
		const raw = Number(this.config.focusPostGameLingerHours);
		if (!Number.isFinite(raw) || raw < 0) {
			return 24;
		}
		return Math.min(168, raw);
	}

	/** @returns {number} */
	_viewsTodayMaxSlots() {
		const raw = Number(this.config.viewsTodayMaxSlots);
		if (!Number.isFinite(raw)) {
			return 16;
		}
		return Math.min(32, Math.max(1, Math.floor(raw)));
	}

	/**
	 * Coerces admin checkbox / CLI values to boolean (handles string "false" from `iobroker object set`).
	 * @param {unknown} val
	 * @param {boolean} defaultValue
	 * @returns {boolean}
	 */
	_configFlag(val, defaultValue) {
		if (val === undefined || val === null || val === "") {
			return defaultValue;
		}
		if (typeof val === "string") {
			const s = val.trim().toLowerCase();
			if (["false", "0", "off", "no"].includes(s)) {
				return false;
			}
			if (["true", "1", "on", "yes"].includes(s)) {
				return true;
			}
		}
		if (val === false || val === 0) {
			return false;
		}
		if (val === true || val === 1) {
			return true;
		}
		return Boolean(val);
	}

	/** @returns {boolean} */
	_writeViewJson() {
		return this._configFlag(this.config.writeViewJson, true);
	}

	/** @returns {boolean} */
	_archiveAllGamesEnabled() {
		return this._configFlag(this.config.archiveAllGames, true);
	}

	/** @returns {boolean} */
	_archiveFavoriteGamesEnabled() {
		return this._configFlag(this.config.archiveFavoriteGames, true);
	}

	/** @returns {boolean} */
	_scheduleEnabled() {
		return this._configFlag(this.config.scheduleEnabled, true);
	}

	/** @returns {boolean} */
	_writeGameVenue() {
		return this._configFlag(this.config.writeGameVenue, true);
	}

	/** @returns {boolean} */
	_writeGameBroadcasts() {
		return this._configFlag(this.config.writeGameBroadcasts, true);
	}

	/** @returns {boolean} */
	_writeGameAttendance() {
		return this._configFlag(this.config.writeGameAttendance, true);
	}

	/** @returns {boolean} */
	_writeGameSourcePath() {
		return this._configFlag(this.config.writeGameSourcePath, true);
	}

	/**
	 * Deletes a relative object id if it exists (recursive optional).
	 * @param {string} relativeId
	 * @param {boolean} [recursive]
	 */
	async _deleteObjectIfExists(relativeId, recursive = false) {
		try {
			const id = replaceForbiddenCharactersInObjectID(relativeId);
			if (recursive) {
				await this.delObjectAsync(id, { recursive: true });
			} else {
				await this.delObjectAsync(id);
			}
		} catch (_e) {
			// missing is fine
		}
	}

	/**
	 * Removes optional game extras that the user disabled (across current/archive/schedule/views).
	 * Called after scoreboard/schedule writes so deselected fields do not linger.
	 */
	async _pruneDisabledGameExtras() {
		const wantVenue = this._writeGameVenue();
		const wantBroadcasts = this._writeGameBroadcasts();
		const wantAttendance = this._writeGameAttendance();
		const wantSourcePath = this._writeGameSourcePath();
		if (wantVenue && wantBroadcasts && wantAttendance && wantSourcePath) {
			return;
		}

		let objects;
		try {
			objects = await this.getAdapterObjectsAsync();
		} catch (error) {
			this.log.warn(`Could not list objects to prune game extras: ${error.message}`);
			return;
		}

		const prefix = `${this.namespace}.`;
		/** @type {Set<string>} */
		const venueRoots = new Set();
		/** @type {string[]} */
		const stateLeaves = [];

		for (const fullId of Object.keys(objects || {})) {
			if (!fullId.startsWith(prefix)) {
				continue;
			}
			const rel = fullId.slice(prefix.length);
			const obj = objects[fullId];
			if (!wantVenue && rel.endsWith(".venue") && obj?.type === "channel") {
				venueRoots.add(rel);
			}
			if (!wantBroadcasts && rel.endsWith(".broadcasts") && obj?.type === "state") {
				stateLeaves.push(rel);
			}
			if (!wantAttendance && rel.endsWith(".attendance") && obj?.type === "state") {
				stateLeaves.push(rel);
			}
			if (!wantSourcePath && rel.endsWith(".sourcePath") && obj?.type === "state") {
				stateLeaves.push(rel);
			}
		}

		for (const rel of venueRoots) {
			await this._deleteObjectIfExists(rel, true);
		}
		for (const rel of stateLeaves) {
			await this._deleteObjectIfExists(rel, false);
		}

		if (venueRoots.size || stateLeaves.length) {
			this.log.info(
				`Pruned disabled game extras: ${venueRoots.size} venue folder(s), ${stateLeaves.length} state(s).`,
			);
		}
	}

	/** @returns {number} schedule poll interval in ms */
	_schedulePollIntervalMs() {
		const raw = Number(this.config.schedulePollIntervalHours);
		const hours = Number.isFinite(raw)
			? Math.min(SCHEDULE_POLL_INTERVAL_MAX_H, Math.max(SCHEDULE_POLL_INTERVAL_MIN_H, raw))
			: SCHEDULE_POLL_INTERVAL_DEFAULT_H;
		if (hours !== raw && Number.isFinite(raw)) {
			this.log.warn(
				`schedulePollIntervalHours ${raw} out of range [${SCHEDULE_POLL_INTERVAL_MIN_H}, ${SCHEDULE_POLL_INTERVAL_MAX_H}]; using ${hours}.`,
			);
		}
		return hours * 3600 * 1000;
	}

	/**
	 * Hours between team/logo/venue master-data refreshes. `0` = disabled (startup only).
	 * @returns {number}
	 */
	_teamDataRefreshIntervalHours() {
		const raw = Number(this.config.teamDataRefreshIntervalHours);
		if (!Number.isFinite(raw) || raw < 0) {
			return 24;
		}
		return Math.min(168, Math.floor(raw));
	}

	/**
	 * Slow multi-week schedule loop (separate from live scoreboard cadence).
	 */
	_startScheduleLoop() {
		if (!this._scheduleEnabled()) {
			this.log.info("Multi-week schedule polling disabled in admin.");
			return;
		}
		const tick = async () => {
			if (this._scheduleTimer === null) {
				return;
			}
			try {
				await this.fetchAndStoreSchedule();
			} catch (error) {
				this.log.error(`Schedule poll failed: ${error.message}`);
			}
			if (this._scheduleTimer !== null) {
				this._scheduleTimer = setTimeout(tick, this._schedulePollIntervalMs());
			}
		};
		// Delay first schedule run so scoreboard can populate first
		this._scheduleTimer = setTimeout(tick, 15_000);
	}

	/**
	 * Periodic team / logo / venue refresh (default daily; 0 = startup only).
	 */
	_startTeamDataRefreshLoop() {
		const hours = this._teamDataRefreshIntervalHours();
		if (hours === 0) {
			this.log.info("Periodic team master-data refresh disabled (startup only).");
			return;
		}
		const intervalMs = hours * 3600 * 1000;
		const tick = async () => {
			if (this._teamDataTimer === null) {
				return;
			}
			try {
				await this.refreshTeamMasterData({ reason: `interval ${hours}h` });
			} catch (error) {
				this.log.error(`Team master-data refresh failed: ${error.message}`);
			}
			if (this._teamDataTimer !== null) {
				this._teamDataTimer = setTimeout(tick, intervalMs);
			}
		};
		this.log.info(`Scheduling team master-data refresh every ${hours}h (after first interval).`);
		this._teamDataTimer = setTimeout(tick, intervalMs);
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
	 * Merges current slate + schedule games; current slate wins on duplicate event IDs.
	 * @param {object[]} currentGames
	 * @param {object[]} scheduleGames
	 * @returns {object[]}
	 */
	_mergeGamesUniverse(currentGames, scheduleGames) {
		/** @type {Map<string, object>} */
		const byId = new Map();
		for (const g of scheduleGames || []) {
			if (g?.id) {
				byId.set(String(g.id), g);
			}
		}
		for (const g of currentGames || []) {
			if (g?.id) {
				byId.set(String(g.id), g);
			}
		}
		return [...byId.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
	}

	/**
	 * Normalizes one ESPN scoreboard event into a compact game DTO.
	 * @param {object} ev
	 * @param {number|null} seasonYear
	 * @param {number|null} weekNumber
	 * @param {number|null} seasonType
	 * @param {Set<string>} favoriteTeamIds
	 */
	_normalizeScoreboardEvent(ev, seasonYear, weekNumber, seasonType, favoriteTeamIds) {
		const eventId = String(ev.id || "");
		const comp = (ev.competitions || [])[0] || {};
		const statusObj = comp.status || {};
		const statusType = statusObj.type || {};
		const competitors = comp.competitors || [];
		const venue = comp.venue || {};
		const venueAddress = venue.address || {};
		const broadcasts = Array.isArray(comp.broadcasts) ? comp.broadcasts : [];
		const broadcastNames = broadcasts
			.flatMap((b) => (Array.isArray(b?.names) ? b.names : []))
			.filter(Boolean);
		/** @type {Record<string, object>} */
		const sides = {};
		for (const side of ["home", "away"]) {
			const c = competitors.find((x) => x.homeAway === side) || {};
			const team = c.team || {};
			const teamId = String(team.id ?? "");
			sides[side] = {
				teamId,
				abbreviation: team.abbreviation ?? "",
				displayName: team.displayName ?? "",
				score: c.score ?? "",
				winner: !!c.winner,
				isFavorite: favoriteTeamIds.has(teamId),
			};
		}
		return {
			id: eventId,
			name: ev.name ?? "",
			shortName: ev.shortName ?? "",
			date: ev.date ?? "",
			seasonYear: seasonYear,
			seasonType: seasonType,
			week: weekNumber,
			status: {
				state: statusType.state ?? "",
				name: statusType.name ?? "",
				detail: statusType.detail ?? "",
				shortDetail: statusType.shortDetail ?? "",
				period: statusObj.period ?? 0,
				displayClock: statusObj.displayClock ?? "",
				completed: !!statusType.completed,
			},
			home: sides.home,
			away: sides.away,
			venue: {
				id: venue.id != null ? String(venue.id) : "",
				fullName: venue.fullName ?? "",
				city: venueAddress.city ?? "",
				state: venueAddress.state ?? "",
				indoor: !!venue.indoor,
			},
			broadcasts: broadcastNames.join(", "),
			attendance: Number(comp.attendance) || 0,
		};
	}

	/**
	 * Compact DTO for JSON view mirrors.
	 * @param {object} game
	 * @param {string} objectPath relative or absolute path hint
	 */
	_gameToViewJson(game, objectPath) {
		/** @type {Record<string, unknown>} */
		const dto = {
			id: game.id,
			name: game.name,
			shortName: game.shortName,
			date: game.date,
			seasonYear: game.seasonYear,
			seasonType: game.seasonType,
			week: game.week,
			status: game.status?.state ?? "",
			clock: game.status?.displayClock ?? "",
			period: game.status?.period ?? 0,
			detail: game.status?.detail ?? "",
			completed: !!game.status?.completed,
			phase: game.phase || undefined,
			home: {
				id: game.home?.teamId ?? "",
				abbr: game.home?.abbreviation ?? "",
				name: game.home?.displayName ?? "",
				score: game.home?.score ?? "",
				winner: !!game.home?.winner,
				isFavorite: !!game.home?.isFavorite,
			},
			away: {
				id: game.away?.teamId ?? "",
				abbr: game.away?.abbreviation ?? "",
				name: game.away?.displayName ?? "",
				score: game.away?.score ?? "",
				winner: !!game.away?.winner,
				isFavorite: !!game.away?.isFavorite,
			},
			path: objectPath,
		};
		if (this._writeGameVenue()) {
			dto.venue = game.venue?.fullName || "";
		}
		if (this._writeGameBroadcasts()) {
			dto.broadcasts = game.broadcasts || "";
		}
		if (this._writeGameAttendance()) {
			dto.attendance = game.attendance || 0;
		}
		return dto;
	}

	/**
	 * Writes a full game channel tree under `basePath` (without namespace).
	 * @param {string} basePath e.g. nfl-games.current.401…
	 * @param {object} game normalized game
	 * @param {{includePhase?: boolean, phase?: string, clearLeftSlate?: boolean}} [opts]
	 */
	async _writeGameChannel(basePath, game, opts = {}) {
		const name = game.name || game.shortName || game.id || "Game";
		await this.setObjectNotExistsAsync(replaceForbiddenCharactersInObjectID(basePath), {
			type: "channel",
			common: { name },
			native: {},
		});

		await this._setSimpleState(`${basePath}.name`, "Name", "string", "value", game.name ?? "");
		await this._setSimpleState(`${basePath}.shortName`, "Short name", "string", "value", game.shortName ?? "");
		await this._setSimpleState(`${basePath}.date`, "Kickoff (UTC)", "string", "value.time", game.date ?? "");
		await this._setSimpleState(`${basePath}.seasonYear`, "Season year", "number", "value", game.seasonYear ?? 0);
		await this._setSimpleState(`${basePath}.seasonType`, "Season type", "number", "value", game.seasonType ?? 0);
		await this._setSimpleState(`${basePath}.week`, "Week", "number", "value", game.week ?? 0);
		await this._setSimpleState(`${basePath}.eventId`, "ESPN event ID", "string", "value", game.id ?? "");
		await this._setSimpleState(`${basePath}.headline`, "Headline", "string", "text", game.shortName || game.name || "");

		if (this._writeGameSourcePath()) {
			const sourcePath =
				game.path ||
				(game.sourcePath ? String(game.sourcePath) : `${this.namespace}.${basePath}`);
			await this._setSimpleState(`${basePath}.sourcePath`, "Canonical object path", "string", "value", sourcePath);
		} else {
			await this._deleteObjectIfExists(`${basePath}.sourcePath`);
		}

		if (this._writeGameBroadcasts()) {
			await this._setSimpleState(`${basePath}.broadcasts`, "Broadcasts", "string", "value", game.broadcasts ?? "");
		} else {
			await this._deleteObjectIfExists(`${basePath}.broadcasts`);
		}

		if (this._writeGameAttendance()) {
			await this._setSimpleState(`${basePath}.attendance`, "Attendance", "number", "value", game.attendance ?? 0);
		} else {
			await this._deleteObjectIfExists(`${basePath}.attendance`);
		}

		if (opts.includePhase) {
			await this._setSimpleState(`${basePath}.phase`, "View phase", "string", "value", opts.phase || game.phase || "idle");
		}

		const statusPath = `${basePath}.status`;
		await this.setObjectNotExistsAsync(replaceForbiddenCharactersInObjectID(statusPath), {
			type: "channel",
			common: { name: "Status" },
			native: {},
		});
		const st = game.status || {};
		await this._setSimpleState(`${statusPath}.state`, "State", "string", "value", st.state ?? "");
		await this._setSimpleState(`${statusPath}.name`, "Status name", "string", "value", st.name ?? "");
		await this._setSimpleState(`${statusPath}.detail`, "Detail", "string", "value", st.detail ?? "");
		await this._setSimpleState(`${statusPath}.shortDetail`, "Short detail", "string", "value", st.shortDetail ?? "");
		await this._setSimpleState(`${statusPath}.period`, "Period", "number", "value", st.period ?? 0);
		await this._setSimpleState(`${statusPath}.displayClock`, "Clock", "string", "value", st.displayClock ?? "");
		await this._setSimpleState(`${statusPath}.completed`, "Completed", "boolean", "indicator", !!st.completed);

		const venuePath = `${basePath}.venue`;
		if (this._writeGameVenue()) {
			const venue = game.venue || {};
			await this.setObjectNotExistsAsync(replaceForbiddenCharactersInObjectID(venuePath), {
				type: "channel",
				common: { name: "Venue" },
				native: {},
			});
			await this._setSimpleState(`${venuePath}.id`, "Venue ID", "string", "value", venue.id ?? "");
			await this._setSimpleState(`${venuePath}.fullName`, "Venue name", "string", "value", venue.fullName ?? "");
			await this._setSimpleState(`${venuePath}.city`, "City", "string", "value", venue.city ?? "");
			await this._setSimpleState(`${venuePath}.state`, "State", "string", "value", venue.state ?? "");
			await this._setSimpleState(`${venuePath}.indoor`, "Indoor", "boolean", "indicator", !!venue.indoor);
		} else {
			await this._deleteObjectIfExists(venuePath, true);
		}

		for (const side of ["home", "away"]) {
			const c = game[side] || {};
			const sidePath = `${basePath}.${side}`;
			await this.setObjectNotExistsAsync(replaceForbiddenCharactersInObjectID(sidePath), {
				type: "channel",
				common: { name: side === "home" ? "Home team" : "Away team" },
				native: {},
			});
			await this._setSimpleState(`${sidePath}.teamId`, "ESPN team ID", "string", "value", c.teamId ?? "");
			await this._setSimpleState(`${sidePath}.abbreviation`, "Abbreviation", "string", "value", c.abbreviation ?? "");
			await this._setSimpleState(`${sidePath}.displayName`, "Display name", "string", "value", c.displayName ?? "");
			await this._setSimpleState(`${sidePath}.score`, "Score", "string", "value", c.score ?? "");
			await this._setSimpleState(`${sidePath}.winner`, "Winner", "boolean", "indicator", !!c.winner);
			await this._setSimpleState(`${sidePath}.isFavorite`, "Is favorite?", "boolean", "indicator", !!c.isFavorite);
		}

		if (opts.clearLeftSlate) {
			const leftId = replaceForbiddenCharactersInObjectID(`${basePath}.${IOBROKER_OBJECT_ID__STATE__LEFT_SLATE_AT}`);
			try {
				await this.delObjectAsync(leftId);
			} catch (_e) {
				// ignore
			}
		}
	}

	/**
	 * Empty / idle game DTO for unused view slots.
	 * @returns {object}
	 */
	_idleGameDto() {
		return {
			id: "",
			name: "",
			shortName: "",
			date: "",
			seasonYear: 0,
			seasonType: 0,
			week: 0,
			phase: "idle",
			path: "",
			broadcasts: "",
			attendance: 0,
			venue: { id: "", fullName: "", city: "", state: "", indoor: false },
			status: {
				state: "",
				name: "",
				detail: "",
				shortDetail: "",
				period: 0,
				displayClock: "",
				completed: false,
			},
			home: { teamId: "", abbreviation: "", displayName: "", score: "", winner: false, isFavorite: false },
			away: { teamId: "", abbreviation: "", displayName: "", score: "", winner: false, isFavorite: false },
		};
	}

	/**
	 * Reads a normalized game DTO back from an existing channel (best-effort).
	 * @param {string} basePath
	 * @returns {Promise<object|null>}
	 */
	async _readGameChannel(basePath) {
		const get = async (rel) => {
			const st = await this.getStateAsync(replaceForbiddenCharactersInObjectID(`${basePath}.${rel}`));
			return st ? st.val : null;
		};
		const id = await get("eventId");
		const name = await get("name");
		if (id == null && name == null) {
			return null;
		}
		return {
			id: String(id || ""),
			name: String(name || ""),
			shortName: String((await get("shortName")) || ""),
			date: String((await get("date")) || ""),
			seasonYear: Number((await get("seasonYear")) || 0),
			week: Number((await get("week")) || 0),
			status: {
				state: String((await get("status.state")) || ""),
				name: String((await get("status.name")) || ""),
				detail: String((await get("status.detail")) || ""),
				shortDetail: String((await get("status.shortDetail")) || ""),
				period: Number((await get("status.period")) || 0),
				displayClock: String((await get("status.displayClock")) || ""),
				completed: !!(await get("status.completed")),
			},
			home: {
				teamId: String((await get("home.teamId")) || ""),
				abbreviation: String((await get("home.abbreviation")) || ""),
				displayName: String((await get("home.displayName")) || ""),
				score: String((await get("home.score")) ?? ""),
				winner: !!(await get("home.winner")),
				isFavorite: !!(await get("home.isFavorite")),
			},
			away: {
				teamId: String((await get("away.teamId")) || ""),
				abbreviation: String((await get("away.abbreviation")) || ""),
				displayName: String((await get("away.displayName")) || ""),
				score: String((await get("away.score")) ?? ""),
				winner: !!(await get("away.winner")),
				isFavorite: !!(await get("away.isFavorite")),
			},
		};
	}

	/**
	 * Fetches the ESPN CDN scoreboard, writes `nfl-games.current.*`, archives, and views.
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
		const seasonType = sbData.season?.type ?? null;
		const weekNumber = sbData.week?.number ?? null;
		const favoriteTeamIds = this._getFavoriteTeamIds();

		await this.setObjectNotExistsAsync(IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES, {
			type: "folder",
			common: { name: "NFL Games" },
			native: {},
		});
		await this.setObjectNotExistsAsync(
			`${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__CURRENT}`,
			{ type: "folder", common: { name: "Current scoreboard" }, native: {} },
		);
		await this.setObjectNotExistsAsync(
			`${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE}`,
			{ type: "folder", common: { name: "Archive" }, native: {} },
		);
		await this.setObjectNotExistsAsync(IOBROKER_OBJECT_ID__FOLDER__VIEWS, {
			type: "folder",
			common: { name: "DIY views (stable)" },
			native: {},
		});

		const infoPath = `${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__INFO}`;
		await this.setObjectNotExistsAsync(infoPath, {
			type: "channel",
			common: { name: "Scoreboard info" },
			native: {},
		});

		/** @type {object[]} */
		const games = [];
		let liveCount = 0;
		for (const ev of events) {
			if (!ev?.id) {
				continue;
			}
			const game = this._normalizeScoreboardEvent(ev, seasonYear, weekNumber, seasonType, favoriteTeamIds);
			games.path = `${this.namespace}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__CURRENT}.${game.id}`;
			games.push(game);
			if (game.status.state === "in") {
				liveCount++;
			}
		}

		const now = new Date().toISOString();
		const eventIdList = games.map((g) => g.id);
		await this._setSimpleState(`${infoPath}.lastUpdate`, "Last update", "string", "value", now);
		await this._setSimpleState(`${infoPath}.liveGameCount`, "Live game count", "number", "value", liveCount);
		await this._setSimpleState(`${infoPath}.eventCount`, "Event count", "number", "value", games.length);
		await this._setSimpleState(`${infoPath}.seasonYear`, "Season year", "number", "value", seasonYear);
		await this._setSimpleState(`${infoPath}.seasonType`, "Season type", "number", "value", seasonType);
		await this._setSimpleState(`${infoPath}.week`, "Week", "number", "value", weekNumber);
		const nextPollS = liveCount > 0 ? this._livePollIntervalMs() / 1000 : SCOREBOARD_POLL_INTERVAL_IDLE_MS / 1000;
		await this._setSimpleState(`${infoPath}.nextPollSeconds`, "Next poll in (s)", "number", "value", nextPollS);
		const idsJson = JSON.stringify(eventIdList);
		await this._setSimpleState(`${infoPath}.currentEventIds`, "Current event IDs (JSON)", "string", "value.json", idsJson);
		await this._setSimpleState(`${infoPath}.eventIds`, "Event IDs (JSON, alias)", "string", "value.json", idsJson);

		for (const game of games) {
			const eventPath = `${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__CURRENT}.${game.id}`;
			await this._writeGameChannel(eventPath, game, { clearLeftSlate: true });
		}

		if (eventIdList.length > 0) {
			await this._archiveOffSlateCurrentGames(new Set(eventIdList));
		}

		await this._deleteLegacyFlatGameFolders();
		await this._enforceArchiveSeasonRetention(seasonYear);
		this._currentGames = games;
		await this._updateDiyViews(games, favoriteTeamIds);
		await this._pruneDisabledGameExtras();

		this.log.debug(`Scoreboard stored: ${games.length} current events, ${liveCount} live.`);
		return liveCount > 0;
	}

	/**
	 * Moves current games that left the slate (after linger) into archive folders.
	 * @param {Set<string>} keepIds
	 */
	async _archiveOffSlateCurrentGames(keepIds) {
		const currentPrefix = `${this.namespace}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__CURRENT}.`;
		/** @type {Set<string>} */
		const candidates = new Set();

		let objects;
		try {
			objects = await this.getAdapterObjectsAsync();
		} catch (error) {
			this.log.warn(`Could not list objects for archive move: ${error.message}`);
			return;
		}

		for (const fullId of Object.keys(objects || {})) {
			if (!fullId.startsWith(currentPrefix)) {
				continue;
			}
			const rest = fullId.slice(currentPrefix.length);
			const eventId = rest.split(".")[0];
			if (eventId && /^\d+$/.test(eventId) && !keepIds.has(eventId)) {
				candidates.add(eventId);
			}
		}

		if (!candidates.size) {
			return;
		}

		const lingerMs = this._currentPostGameLingerHours() * 3600 * 1000;
		const now = Date.now();

		for (const eventId of candidates) {
			const basePath = `${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__CURRENT}.${eventId}`;
			const leftStateId = `${basePath}.${IOBROKER_OBJECT_ID__STATE__LEFT_SLATE_AT}`;
			let leftAt = null;
			try {
				const st = await this.getStateAsync(replaceForbiddenCharactersInObjectID(leftStateId));
				if (st && st.val) {
					leftAt = Date.parse(String(st.val));
				}
			} catch (_e) {
				// ignore
			}
			if (!leftAt || Number.isNaN(leftAt)) {
				const iso = new Date().toISOString();
				await this._setSimpleState(leftStateId, "Left scoreboard slate at", "string", "value.time", iso);
				if (lingerMs > 0) {
					this.log.debug(`Game ${eventId} left slate; linger ${this._currentPostGameLingerHours()}h before archive.`);
					continue;
				}
				leftAt = now;
			}

			if (lingerMs > 0 && now - leftAt < lingerMs) {
				continue;
			}

			const game = await this._readGameChannel(basePath);
			if (!game || !game.id) {
				try {
					await this.delObjectAsync(basePath, { recursive: true });
				} catch (_e) {
					// ignore
				}
				continue;
			}

			const season = String(game.seasonYear || "unknown");
			const isFav = !!(game.home?.isFavorite || game.away?.isFavorite);

			if (this._archiveAllGamesEnabled()) {
				const dest = `${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE_ALL}.${season}.${eventId}`;
				await this.setObjectNotExistsAsync(
					`${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE_ALL}`,
					{ type: "folder", common: { name: "All archived games" }, native: {} },
				);
				await this.setObjectNotExistsAsync(
					`${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE_ALL}.${season}`,
					{ type: "folder", common: { name: `Season ${season}` }, native: {} },
				);
				await this._writeGameChannel(dest, game);
			}

			if (isFav && this._archiveFavoriteGamesEnabled()) {
				const dest = `${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE_FAVORITES}.${season}.${eventId}`;
				await this.setObjectNotExistsAsync(
					`${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE_FAVORITES}`,
					{ type: "folder", common: { name: "Favorite-team archived games" }, native: {} },
				);
				await this.setObjectNotExistsAsync(
					`${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE_FAVORITES}.${season}`,
					{ type: "folder", common: { name: `Season ${season}` }, native: {} },
				);
				await this._writeGameChannel(dest, game);
			}

			try {
				await this.delObjectAsync(basePath, { recursive: true });
				this.log.info(`Archived game ${eventId} (season ${season}${isFav ? ", favorite" : ""}).`);
			} catch (error) {
				this.log.warn(`Failed to remove current game ${eventId} after archive: ${error.message}`);
			}
		}
	}

	/**
	 * Deletes legacy flat `nfl-games.{eventId}` channels from before the current/ layout.
	 */
	async _deleteLegacyFlatGameFolders() {
		const folderPrefix = `${this.namespace}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.`;
		const reserved = new Set([
			IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__INFO,
			IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__CURRENT,
			IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE,
		]);
		/** @type {Set<string>} */
		const legacyIds = new Set();

		let objects;
		try {
			objects = await this.getAdapterObjectsAsync();
		} catch (error) {
			this.log.warn(`Could not list objects for legacy game cleanup: ${error.message}`);
			return;
		}

		for (const fullId of Object.keys(objects || {})) {
			if (!fullId.startsWith(folderPrefix)) {
				continue;
			}
			const rest = fullId.slice(folderPrefix.length);
			const top = rest.split(".")[0];
			if (!top || reserved.has(top)) {
				continue;
			}
			if (/^\d+$/.test(top)) {
				legacyIds.add(top);
			}
		}

		for (const eventId of legacyIds) {
			const relativeId = `${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${eventId}`;
			try {
				await this.delObjectAsync(relativeId, { recursive: true });
				this.log.info(`Removed legacy flat game folder ${relativeId}.`);
			} catch (error) {
				this.log.warn(`Failed to delete legacy game folder '${relativeId}': ${error.message}`);
			}
		}
	}

	/**
	 * Drops archive season folders older than configured retention (0 = unlimited).
	 * @param {number|null} currentSeasonYear
	 */
	async _enforceArchiveSeasonRetention(currentSeasonYear) {
		const keepN = this._archiveSeasonsToKeep();
		if (keepN === 0) {
			return;
		}
		const currentY = Number(currentSeasonYear) || new Date().getFullYear();
		const minKeep = currentY - keepN + 1;

		for (const branch of [
			IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE_ALL,
			IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE_FAVORITES,
		]) {
			const branchPrefix = `${this.namespace}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE}.${branch}.`;
			/** @type {Set<string>} */
			const seasons = new Set();
			let objects;
			try {
				objects = await this.getAdapterObjectsAsync();
			} catch (_e) {
				return;
			}
			for (const fullId of Object.keys(objects || {})) {
				if (!fullId.startsWith(branchPrefix)) {
					continue;
				}
				const season = fullId.slice(branchPrefix.length).split(".")[0];
				if (season && /^\d+$/.test(season)) {
					seasons.add(season);
				}
			}
			for (const season of seasons) {
				if (Number(season) < minKeep) {
					const rel = `${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES}.${IOBROKER_OBJECT_ID__FOLDER__NFL_GAMES__ARCHIVE}.${branch}.${season}`;
					try {
						await this.delObjectAsync(rel, { recursive: true });
						this.log.info(`Removed archived season ${branch}/${season} (retention ${keepN}).`);
					} catch (error) {
						this.log.warn(`Failed to prune archive season ${rel}: ${error.message}`);
					}
				}
			}
		}
	}

	/**
	 * Local calendar YYYY-MM-DD for "today" filtering.
	 * @param {string} iso
	 * @returns {string}
	 */
	_localDateKey(iso) {
		if (!iso) {
			return "";
		}
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) {
			return "";
		}
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		return `${y}-${m}-${day}`;
	}

	/**
	 * Lists ESPN week numbers for a season year + type (core API).
	 * @param {number} year
	 * @param {number} seasonType
	 * @returns {Promise<number[]>}
	 */
	async _fetchEspnWeekNumbers(year, seasonType) {
		const url = URL_ESPN_API_NFL_WEEKS.replace("{YEAR}", String(year)).replace("{SEASON_TYPE}", String(seasonType));
		const response = await axios.get(url, { timeout: TIMEOUT_URL_REQUESTS_PRIMARY });
		const items = response.data?.items;
		if (!Array.isArray(items)) {
			return [];
		}
		/** @type {number[]} */
		const weeks = [];
		for (const item of items) {
			const ref = String(item?.$ref || "");
			const m = ref.match(/\/weeks\/(\d+)/);
			if (m) {
				weeks.push(Number(m[1]));
			}
		}
		return weeks.sort((a, b) => a - b);
	}

	/**
	 * Fetches one CDN scoreboard week and returns normalized games.
	 * @param {number} year
	 * @param {number} seasonType
	 * @param {number} week
	 * @param {Set<string>} favoriteTeamIds
	 * @returns {Promise<object[]>}
	 */
	async _fetchCdnScoreboardWeek(year, seasonType, week, favoriteTeamIds) {
		const url = `${URL_ESPN_CDN_SCOREBOARD}&week=${week}&seasontype=${seasonType}&year=${year}`;
		const response = await axios.get(url, { timeout: TIMEOUT_URL_REQUESTS_PRIMARY });
		const sbData = response.data?.content?.sbData;
		if (!sbData || !Array.isArray(sbData.events)) {
			return [];
		}
		const seasonYear = sbData.season?.year ?? year;
		const type = sbData.season?.type ?? seasonType;
		const weekNumber = sbData.week?.number ?? week;
		/** @type {object[]} */
		const games = [];
		for (const ev of sbData.events) {
			if (!ev?.id) {
				continue;
			}
			games.push(this._normalizeScoreboardEvent(ev, seasonYear, weekNumber, type, favoriteTeamIds));
		}
		return games;
	}

	/**
	 * Builds multi-week `schedule/{year}/type{N}/week{M}/{eventId}` and refreshes views.
	 */
	async fetchAndStoreSchedule() {
		if (!this._scheduleEnabled()) {
			return;
		}

		this.log.info("Fetching multi-week NFL schedule from ESPN CDN…");
		const favoriteTeamIds = this._getFavoriteTeamIds();

		// Resolve active season year from live scoreboard (CDN default)
		const metaResponse = await axios.get(URL_ESPN_CDN_SCOREBOARD, { timeout: TIMEOUT_URL_REQUESTS_PRIMARY });
		const metaSb = metaResponse.data?.content?.sbData;
		const seasonYear = Number(metaSb?.season?.year) || new Date().getFullYear();

		await this.setObjectNotExistsAsync(IOBROKER_OBJECT_ID__FOLDER__SCHEDULE, {
			type: "folder",
			common: { name: "NFL Schedule" },
			native: {},
		});
		const infoPath = `${IOBROKER_OBJECT_ID__FOLDER__SCHEDULE}.info`;
		await this.setObjectNotExistsAsync(infoPath, {
			type: "channel",
			common: { name: "Schedule info" },
			native: {},
		});
		const yearPath = `${IOBROKER_OBJECT_ID__FOLDER__SCHEDULE}.${seasonYear}`;
		await this.setObjectNotExistsAsync(yearPath, {
			type: "folder",
			common: { name: `Season ${seasonYear}` },
			native: {},
		});

		/** @type {object[]} */
		const allGames = [];
		let weekFetches = 0;

		for (const seasonType of [1, 2, 3]) {
			let weeks = [];
			try {
				weeks = await this._fetchEspnWeekNumbers(seasonYear, seasonType);
			} catch (error) {
				this.log.warn(`Could not list schedule weeks for ${seasonYear} type ${seasonType}: ${error.message}`);
				continue;
			}
			if (!weeks.length) {
				continue;
			}

			const typePath = `${yearPath}.type${seasonType}`;
			await this.setObjectNotExistsAsync(typePath, {
				type: "folder",
				common: { name: ESPN_SEASON_TYPE_NAMES[seasonType] || `Type ${seasonType}` },
				native: {},
			});

			for (const week of weeks) {
				weekFetches++;
				let weekGames = [];
				try {
					weekGames = await this._fetchCdnScoreboardWeek(seasonYear, seasonType, week, favoriteTeamIds);
				} catch (error) {
					this.log.warn(`Schedule week ${seasonYear}/t${seasonType}/w${week} failed: ${error.message}`);
					continue;
				}

				const weekPath = `${typePath}.week${week}`;
				await this.setObjectNotExistsAsync(weekPath, {
					type: "folder",
					common: { name: `Week ${week}` },
					native: {},
				});
				await this._setSimpleState(`${weekPath}.eventCount`, "Event count", "number", "value", weekGames.length);

				/** @type {Set<string>} */
				const weekKeep = new Set();
				for (const game of weekGames) {
					const eventPath = `${weekPath}.${game.id}`;
					game.path = `${this.namespace}.${eventPath}`;
					await this._writeGameChannel(eventPath, game);
					allGames.push(game);
					weekKeep.add(String(game.id));
				}

				// Prune removed events under this week folder
				const weekPrefix = `${this.namespace}.${weekPath}.`;
				try {
					const objects = await this.getAdapterObjectsAsync();
					/** @type {Set<string>} */
					const existing = new Set();
					for (const fullId of Object.keys(objects || {})) {
						if (!fullId.startsWith(weekPrefix)) {
							continue;
						}
						const rest = fullId.slice(weekPrefix.length);
						const eventId = rest.split(".")[0];
						if (eventId && /^\d+$/.test(eventId)) {
							existing.add(eventId);
						}
					}
					for (const eventId of existing) {
						if (!weekKeep.has(eventId)) {
							await this.delObjectAsync(`${weekPath}.${eventId}`, { recursive: true });
						}
					}
				} catch (error) {
					this.log.warn(`Could not prune schedule week ${weekPath}: ${error.message}`);
				}
			}
		}

		// Drop other season years under schedule/
		try {
			const objects = await this.getAdapterObjectsAsync();
			const rootPrefix = `${this.namespace}.${IOBROKER_OBJECT_ID__FOLDER__SCHEDULE}.`;
			/** @type {Set<string>} */
			const years = new Set();
			for (const fullId of Object.keys(objects || {})) {
				if (!fullId.startsWith(rootPrefix)) {
					continue;
				}
				const top = fullId.slice(rootPrefix.length).split(".")[0];
				if (top && /^\d{4}$/.test(top)) {
					years.add(top);
				}
			}
			for (const y of years) {
				if (Number(y) !== seasonYear) {
					await this.delObjectAsync(`${IOBROKER_OBJECT_ID__FOLDER__SCHEDULE}.${y}`, { recursive: true });
					this.log.info(`Removed schedule season ${y} (keeping ${seasonYear}).`);
				}
			}
		} catch (error) {
			this.log.warn(`Could not prune old schedule seasons: ${error.message}`);
		}

		this._scheduleGames = allGames;
		const now = new Date().toISOString();
		await this._setSimpleState(`${infoPath}.lastUpdate`, "Last update", "string", "value", now);
		await this._setSimpleState(`${infoPath}.seasonYear`, "Season year", "number", "value", seasonYear);
		await this._setSimpleState(`${infoPath}.eventCount`, "Event count", "number", "value", allGames.length);
		await this._setSimpleState(`${infoPath}.weekFetches`, "Week fetches last run", "number", "value", weekFetches);
		await this._setSimpleState(
			`${infoPath}.nextPollHours`,
			"Next schedule poll (h)",
			"number",
			"value",
			this._schedulePollIntervalMs() / 3600000,
		);

		await this._updateDiyViews(this._currentGames || [], favoriteTeamIds);
		await this._pruneDisabledGameExtras();
		this.log.info(`Schedule stored: ${allGames.length} events across ${weekFetches} week fetches (season ${seasonYear}).`);
	}

	/**
	 * Updates stable DIY view slots, byTeam.focus, and optional JSON mirrors.
	 * @param {object[]} games
	 * @param {Set<string>} favoriteTeamIds
	 */
	async _updateDiyViews(games, favoriteTeamIds) {
		const maxSlots = this._viewsTodayMaxSlots();
		const todayKey = this._localDateKey(new Date().toISOString());
		const sorted = games.slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
		const universe = this._mergeGamesUniverse(sorted, this._scheduleGames || []);

		const todayGames = sorted.filter((g) => this._localDateKey(g.date) === todayKey);
		const liveGames = sorted.filter((g) => g.status.state === "in");
		const favToday = todayGames.filter((g) => g.home?.isFavorite || g.away?.isFavorite);
		const favUniverse = universe.filter((g) => g.home?.isFavorite || g.away?.isFavorite);

		await this._writeViewSlotFolder(`${IOBROKER_OBJECT_ID__FOLDER__VIEWS}.today`, "Today's games", todayGames, maxSlots);
		await this._writeViewSlotFolder(`${IOBROKER_OBJECT_ID__FOLDER__VIEWS}.live`, "Live games", liveGames, maxSlots);

		const favoritesPath = `${IOBROKER_OBJECT_ID__FOLDER__VIEWS}.favorites`;
		if (favoriteTeamIds.size > 0) {
			await this.setObjectNotExistsAsync(favoritesPath, {
				type: "folder",
				common: { name: "Favorite views" },
				native: {},
			});
			await this._writeViewSlotFolder(`${favoritesPath}.today`, "Favorite games today", favToday, maxSlots);

			if (this._writeViewJson()) {
				await this._setSimpleState(
					`${favoritesPath}.current`,
					"Favorite games current slate (JSON)",
					"string",
					"value.json",
					JSON.stringify(
						sorted
							.filter((g) => g.home?.isFavorite || g.away?.isFavorite)
							.map((g) => this._gameToViewJson(g, g.path)),
					),
				);

				const nextFav = favUniverse
					.filter((g) => g.status.state === "pre")
					.sort((a, b) => String(a.date).localeCompare(String(b.date)))[0];
				const lastFav = favUniverse
					.filter((g) => g.status.state === "post")
					.sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
				await this._setSimpleState(
					`${favoritesPath}.next`,
					"Next favorite game (JSON)",
					"string",
					"value.json",
					JSON.stringify(nextFav ? this._gameToViewJson(nextFav, nextFav.path) : null),
				);
				await this._setSimpleState(
					`${favoritesPath}.last`,
					"Last favorite game (JSON)",
					"string",
					"value.json",
					JSON.stringify(lastFav ? this._gameToViewJson(lastFav, lastFav.path) : null),
				);
			}
		} else {
			try {
				await this.delObjectAsync(replaceForbiddenCharactersInObjectID(favoritesPath), { recursive: true });
				this.log.debug(`Removed ${favoritesPath} (no favorite teams configured).`);
			} catch (_e) {
				// folder may not exist yet
			}
		}

		if (this._writeViewJson()) {
			await this._setSimpleState(
				`${IOBROKER_OBJECT_ID__FOLDER__VIEWS}.today.scoreboard`,
				"Today scoreboard (JSON)",
				"string",
				"value.json",
				JSON.stringify(todayGames.map((g) => this._gameToViewJson(g, g.path))),
			);
			await this._setSimpleState(
				`${IOBROKER_OBJECT_ID__FOLDER__VIEWS}.live.list`,
				"Live games (JSON)",
				"string",
				"value.json",
				JSON.stringify(liveGames.map((g) => this._gameToViewJson(g, g.path))),
			);
		}

		// Schedule mirrors for VIS-1 schedule widget (always written — small JSON lists)
		await this.setObjectNotExistsAsync(`${IOBROKER_OBJECT_ID__FOLDER__VIEWS}.schedule`, {
			type: "folder",
			common: { name: "Schedule views" },
			native: {},
		});
		const upcoming = universe
			.filter((g) => g.status?.state === "pre")
			.sort((a, b) => String(a.date).localeCompare(String(b.date)))
			.slice(0, maxSlots);
		const favUpcoming = favUniverse
			.filter((g) => g.status?.state === "pre")
			.sort((a, b) => String(a.date).localeCompare(String(b.date)))
			.slice(0, maxSlots);
		await this._setSimpleState(
			`${IOBROKER_OBJECT_ID__FOLDER__VIEWS}.schedule.upcoming`,
			"Upcoming games (JSON)",
			"string",
			"value.json",
			JSON.stringify(upcoming.map((g) => this._gameToViewJson(g, g.path))),
		);
		await this._setSimpleState(
			`${IOBROKER_OBJECT_ID__FOLDER__VIEWS}.schedule.upcomingCount`,
			"Upcoming game count",
			"number",
			"value",
			upcoming.length,
		);
		await this._setSimpleState(
			`${IOBROKER_OBJECT_ID__FOLDER__VIEWS}.schedule.favoritesUpcoming`,
			"Upcoming favorite games (JSON)",
			"string",
			"value.json",
			JSON.stringify(favUpcoming.map((g) => this._gameToViewJson(g, g.path))),
		);

		await this.setObjectNotExistsAsync(`${IOBROKER_OBJECT_ID__FOLDER__VIEWS}.byTeam`, {
			type: "folder",
			common: { name: "Per-team focus views" },
			native: {},
		});

		const focusLingerMs = this._focusPostGameLingerHours() * 3600 * 1000;
		const now = Date.now();

		/** @type {Map<string, string>} */
		const teamNames = new Map();
		for (const t of this.nflTeams || []) {
			if (t && t.id != null) {
				teamNames.set(String(t.id), t.displayName || t.abbreviation || String(t.id));
			}
		}
		/** @type {Set<string>} */
		const teamIds = new Set(teamNames.keys());
		for (const id of favoriteTeamIds) {
			teamIds.add(String(id));
		}

		for (const teamId of [...teamIds].sort((a, b) => Number(a) - Number(b))) {
			const involving = universe.filter((g) => g.home?.teamId === teamId || g.away?.teamId === teamId);
			let chosen = null;
			let phase = "idle";

			const live = involving.find((g) => g.status.state === "in");
			if (live) {
				chosen = live;
				phase = "live";
			} else {
				const finals = involving
					.filter((g) => g.status.state === "post" || g.status.completed)
					.sort((a, b) => String(b.date).localeCompare(String(a.date)));
				const finalG = finals[0];
				if (finalG) {
					const endApprox = Date.parse(finalG.date) + 4 * 3600 * 1000;
					const anchor = Number.isNaN(endApprox) ? now : endApprox;
					if (focusLingerMs === 0 || now - anchor <= focusLingerMs) {
						chosen = finalG;
						phase = "final";
					}
				}
				if (!chosen) {
					const next = involving
						.filter((g) => g.status.state === "pre")
						.sort((a, b) => String(a.date).localeCompare(String(b.date)))[0];
					if (next) {
						chosen = next;
						phase = "upcoming";
					}
				}
			}

			const teamFolder = `${IOBROKER_OBJECT_ID__FOLDER__VIEWS}.byTeam.${teamId}`;
			const teamLabel = teamNames.get(teamId) || `Team ${teamId}`;
			const existingTeamObj = await this.getObjectAsync(replaceForbiddenCharactersInObjectID(teamFolder));
			if (existingTeamObj) {
				existingTeamObj.common = existingTeamObj.common || {};
				existingTeamObj.common.name = teamLabel;
				await this.setObjectAsync(replaceForbiddenCharactersInObjectID(teamFolder), existingTeamObj);
			} else {
				await this.setObjectNotExistsAsync(teamFolder, {
					type: "folder",
					common: { name: teamLabel },
					native: {},
				});
			}

			const focusPath = `${teamFolder}.focus`;
			const dto = chosen ? { ...chosen, phase } : this._idleGameDto();
			dto.phase = phase;
			if (chosen?.path) {
				dto.path = chosen.path;
			}
			await this._writeGameChannel(focusPath, dto, { includePhase: true, phase });
		}
	}

	/**
	 * Writes numbered flat view slots under a folder — only for real games.
	 * Does not create empty/idle placeholders. Removes leftover higher slots from prior polls.
	 * @param {string} folderPath
	 * @param {string} folderName
	 * @param {object[]} games
	 * @param {number} maxSlots
	 */
	async _writeViewSlotFolder(folderPath, folderName, games, maxSlots) {
		await this.setObjectNotExistsAsync(replaceForbiddenCharactersInObjectID(folderPath), {
			type: "folder",
			common: { name: folderName },
			native: {},
		});

		const used = Math.min(games.length, maxSlots);
		for (let i = 0; i < used; i++) {
			const game = games[i];
			const phase =
				game.phase ||
				(game.status?.state === "in"
					? "live"
					: game.status?.state === "post"
						? "final"
						: game.status?.state === "pre"
							? "upcoming"
							: "idle");
			await this._writeGameChannel(`${folderPath}.${i}`, { ...game, phase }, { includePhase: true, phase });
		}

		await this._setSimpleState(`${folderPath}.count`, "Slot count", "number", "value", used);

		// Drop slots that no longer have a game (e.g. live.0 after the game ended)
		const folderPrefix = `${this.namespace}.${folderPath}.`;
		/** @type {Set<number>} */
		const existingSlots = new Set();
		try {
			const objects = await this.getAdapterObjectsAsync();
			for (const fullId of Object.keys(objects || {})) {
				if (!fullId.startsWith(folderPrefix)) {
					continue;
				}
				const rest = fullId.slice(folderPrefix.length);
				const slot = rest.split(".")[0];
				if (/^\d+$/.test(slot)) {
					existingSlots.add(Number(slot));
				}
			}
		} catch (error) {
			this.log.warn(`Could not list view slots under ${folderPath}: ${error.message}`);
			return;
		}

		for (const slot of existingSlots) {
			if (slot >= used) {
				const rel = `${folderPath}.${slot}`;
				try {
					await this.delObjectAsync(replaceForbiddenCharactersInObjectID(rel), { recursive: true });
					this.log.debug(`Removed empty view slot ${rel}`);
				} catch (error) {
					this.log.warn(`Failed to remove view slot ${rel}: ${error.message}`);
				}
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
					// Prefer file storage + CDN URLs for VIS; base64 in objects is opt-in (writeLogoBase64).
					const teamLogoBase64 = this._configFlag(this.config.writeLogoBase64, false)
						? (await this.ensureNFLTeamLogoBase64(teamLogo)) || ""
						: "";

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
							teamLogoBase64 || undefined,
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

	/**
	 * Deletes adapter files under logo/venue dirs that are not referenced by current in-memory teams/venues.
	 */
	async _pruneOrphanImageFiles() {
		/** @type {Set<string>} */
		const keep = new Set();
		const norm = (p) => String(p || "").replace(/\\/g, "/").replace(/^\/+/, "");

		for (const team of this.nflTeams || []) {
			for (const logo of team.teamLogos || []) {
				if (logo && logo.localCopyMetaStorageSubPath) {
					keep.add(norm(logo.localCopyMetaStorageSubPath));
				}
			}
		}
		for (const venue of this.nflVenues || []) {
			for (const img of venue.venueImages || []) {
				if (img && img.localCopyMetaStorageSubPath) {
					keep.add(norm(img.localCopyMetaStorageSubPath));
				}
			}
		}

		const roots = [SUBPATH__NFL_TEAM_LOGO_IMAGES, SUBPATH__NFL_VENUE_IMAGES];
		let removed = 0;
		for (const root of roots) {
			removed += await this._pruneOrphanFilesUnder(norm(root), keep);
		}
		if (removed > 0) {
			this.log.info(`Removed ${removed} orphan logo/venue file(s) from adapter storage.`);
		}
	}

	/**
	 * Recursively lists and deletes files under `dir` that are not in `keep`.
	 * @param {string} dir
	 * @param {Set<string>} keep
	 * @returns {Promise<number>}
	 */
	async _pruneOrphanFilesUnder(dir, keep) {
		let removed = 0;
		/** @type {Array<{file: string, isDir: boolean}>} */
		let entries = [];
		try {
			entries = (await this.readDirAsync(this.namespace, dir)) || [];
		} catch (_e) {
			return 0;
		}
		for (const entry of entries) {
			const name = entry.file || entry.name;
			if (!name || name === "." || name === "..") {
				continue;
			}
			const full = dir ? `${dir}/${name}` : name;
			if (entry.isDir) {
				removed += await this._pruneOrphanFilesUnder(full, keep);
				// try remove empty dir — ignore errors
				try {
					const left = (await this.readDirAsync(this.namespace, full)) || [];
					if (!left.length) {
						await this.unlinkAsync(this.namespace, full);
					}
				} catch (_e) {
					// ignore
				}
			} else if (!keep.has(full)) {
				try {
					await this.unlinkAsync(this.namespace, full);
					removed++;
					this.log.debug(`Deleted orphan image file '${full}'`);
				} catch (error) {
					this.log.warn(`Could not delete orphan file '${full}': ${error.message}`);
				}
			}
		}
		return removed;
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
			if (this._scheduleTimer !== null) {
				clearTimeout(this._scheduleTimer);
				this._scheduleTimer = null;
			}
			if (this._teamDataTimer !== null) {
				clearTimeout(this._teamDataTimer);
				this._teamDataTimer = null;
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
