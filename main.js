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

// Define ioBroker object IDs, names & descriptions
const ioBrokerObjectID_folder_nflTeams = "nfl-teams";
const ioBrokerObjectName_folder_nflTeams = "NFL-Teams";
const ioBrokerObjectID_folder_nflTeam_teamInfos = "teamInfos";
const ioBrokerObjectName_folder_nflTeam_teamInfos = "Team Infos";
const ioBrokerObjectID_state_nflTeam_id = "id";
const ioBrokerObjectName_state_nflTeam_id = "ID";
const ioBrokerObjectID_state_nflTeam_uid = "uid";
const ioBrokerObjectName_state_nflTeam_uid = "UID";
const ioBrokerObjectID_state_nflTeam_abbreviation = "abbreviation";
const ioBrokerObjectName_state_nflTeam_abbreviation = "Abbreviation";
const ioBrokerObjectID_state_nflTeam_displayName = "displayName";
const ioBrokerObjectName_state_nflTeam_displayName = "Display name";
const ioBrokerObjectID_state_nflTeam_shortDisplayName = "shortDisplayName";
const ioBrokerObjectName_state_nflTeam_shortDisplayName = "Short display name";
const ioBrokerObjectID_state_nflTeam_name = "name";
const ioBrokerObjectName_state_nflTeam_name = "Name";
const ioBrokerObjectID_state_nflTeam_nickname = "nickname";
const ioBrokerObjectName_state_nflTeam_nickname = "Nickname";
const ioBrokerObjectID_state_nflTeam_location = "location";
const ioBrokerObjectName_state_nflTeam_location = "Location";
const ioBrokerObjectID_folder_nflTeam_teamColors = "teamColors";
const ioBrokerObjectName_folder_nflTeam_teamColors = "Team Colors";
const ioBrokerObjectID_state_nflTeam_color = "color";
const ioBrokerObjectName_state_nflTeam_color = "Color";
const ioBrokerObjectID_state_nflTeam_alternateColor = "alternateColor";
const ioBrokerObjectName_state_nflTeam_alternateColor = "Alternate color";
const ioBrokerObjectID_state_nflTeam_isActive = "isActive";
const ioBrokerObjectName_state_nflTeam_isActive = "Is active?";
const ioBrokerObjectID_state_nflTeam_isAllStar = "isAllStar";
const ioBrokerObjectName_state_nflTeam_isAllStar = "Is AllStar?";
const ioBrokerObjectID_folder_nflTeam_teamLogos = "teamLogos";
const ioBrokerObjectName_folder_nflTeam_teamLogos = "Team Logos";
const ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogo = "defaultLogo";
const ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogo = "Default Logo";
const ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogoDark = "defaultLogo_dark";
const ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogoDark = "Default Logo (Dark)";
const ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogo = "scoreboardLogo";
const ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogo = "Scoreboard Logo";
const ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogoDark = "scoreboardLogo_dark";
const ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogoDark = "Scoreboard Logo (Dark)";
const ioBrokerObjectID_state_nflTeam_teamLogo_url = "url";
const ioBrokerObjectName_state_nflTeam_teamLogo_url = "URL";
const ioBrokerObjectID_state_nflTeam_teamLogo_alternativeURL = "alternativeURL";
const ioBrokerObjectName_state_nflTeam_teamLogo_alternativeURL = "Alternative URL";
const ioBrokerObjectID_state_nflTeam_teamLogo_width = "width";
const ioBrokerObjectName_state_nflTeam_teamLogo_width = "Width";
const ioBrokerObjectID_state_nflTeam_teamLogo_height = "height";
const ioBrokerObjectName_state_nflTeam_teamLogo_height = "Height";
const ioBrokerObjectID_state_nflTeam_teamLogo_isDefaultLogo = "isDefaultLogo";
const ioBrokerObjectName_state_nflTeam_teamLogo_isDefaultLogo = "Is default logo?";
const ioBrokerObjectID_state_nflTeam_teamLogo_isFullLogo = "isFullLogo";
const ioBrokerObjectName_state_nflTeam_teamLogo_isFullLogo = "Is full logo?";
const ioBrokerObjectID_state_nflTeam_teamLogo_isDarkLogo = "isDarkLogo";
const ioBrokerObjectName_state_nflTeam_teamLogo_isDarkLogo = "Is dark logo?";
const ioBrokerObjectID_state_nflTeam_teamLogo_isScoreboardLogo = "isScoreboardLogo";
const ioBrokerObjectName_state_nflTeam_teamLogo_isScoreboardLogo = "Is scoreboard logo?";
const ioBrokerObjectID_state_nflTeam_teamLogo_localCopyMetaStorageSubPath = "localCopyMetaStorageSubPath";
const ioBrokerObjectName_state_nflTeam_teamLogo_localCopyMetaStorageSubPath = "Local copy meta-storage sub-path";
const ioBrokerObjectID_state_nflTeam_teamLogo_base64Image = "base64Image";
const ioBrokerObjectName_state_nflTeam_teamLogo_base64Image = "Base64-Image";

// Define Paths
const subpath_nflTeamLogoImages = "NFL-Team Logos";
const subpath_nflTeamLogoImages_defaultLogos = path.join(subpath_nflTeamLogoImages, "Default Logos");
const subpath_nflTeamLogoImages_darkDefaultLogos = path.join(subpath_nflTeamLogoImages, "Default Logos (Dark)");
const subpath_nflTeamLogoImages_scoreboardLogos = path.join(subpath_nflTeamLogoImages, "Scoreboard Logos");
const subpath_nflTeamLogoImages_darkScoreboardLogos = path.join(subpath_nflTeamLogoImages, "Scoreboard Logos (Dark)");

// Define URLs
const url_espnAPI_nflTeams = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";

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
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));

		// Define globale variables
		this.nflTeams = null;
	}

	/**************************************************************************************************************************************
	 * This function is called when the adapter is ready
	 * (once databases are connected and the adapter has received configuration).
	 **************************************************************************************************************************************/
	async onReady() {
		// INITIALIZING THE ADAPTER

		// Reset the connection indicator during startup (to 'false')
		this.setState("info.connection", false, true);

		// Get NFL-Teams
		try {
			this.nflTeams = await this.get_NFLteams();
		} catch (error) {
			// TODO: Figure out what to do here besides just logging the error and returning. Maybe schedule another try or just set the connection state to false.
			this.log.error(error.message);
			return;
		}

		// Download and Store NFL-Team logo-images for all found NFL-Teams
		try {
			await this.downloadAndStoreNFLTeamLogoImages(this.nflTeams);
		} catch (error) {
			// TODO: Figure out what to do here besides just logging the error and returning. Maybe just set the connection state to false.
			this.log.error(error.message);
			return;
		}

		// Store NFL-Teams to object structure
		try {
			await this.store_NFLteams(this.nflTeams);
		} catch (error) {
			// TODO: Figure out what to do here besides just logging the error and returning. Maybe just set the connection state to false.
			this.log.error(error.message);
			return;
		}
	}

	/**************************************************************************************************************************************
	 * Fetches and processes a list of NFL teams from a specified API endpoint.
	 *
	 * The function performs the following steps:
	 * 1. Logs the beginning of the process and the URL being used.
	 * 2. Sends an HTTP GET request to the specified URL to fetch the NFL teams.
	 * 3. Validates the structure of the received JSON response.
	 * 4. Processes the response to create instances of the NFLTeam class, along with their associated logos.
	 * 5. Returns an array of NFLTeam instances.
	 *
	 * Throws an error if:
	 * - The HTTP request fails.
	 * - The received response is invalid or does not contain the expected structure.
	 * - An error occurs while creating NFLTeam instances.
	 *
	 * @returns {Promise<NFLTeam[]>} A promise that resolves to an array of NFLTeam instances.
	 * @throws {Error} If fetching or processing the NFL teams fails.
	 *
	 * @todo Recreate this documentation
	 **************************************************************************************************************************************/
	async get_NFLteams() {
		this.log.debug(`Getting NFL-Teams...`);
		this.log.debug(`Fetching NFL-Teams information using URL: ${url_espnAPI_nflTeams}...`);

		try {
			// Get the content from the NFL-Team information URL
			const response = await axios.get(url_espnAPI_nflTeams);
			const responseData = response.data;

			// Check if we received a valid response
			if (typeof responseData === "object" && responseData !== null) {
				// Check if the response has the expected JSON structure
				if (responseData.sports && Array.isArray(responseData.sports)) {
					this.log.debug(`Successfully fetched NFL-Teams information.`);
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
										newTeamLogo.localCopyMetaStorageSubPath = path.join(subpath_nflTeamLogoImages_defaultLogos, team.slug + ".png");
									} else if (!teamLogo.rel.includes("default") && teamLogo.rel.includes("full") && teamLogo.rel.includes("dark") && !teamLogo.rel.includes("scoreboard")) {
										newTeamLogo.localCopyMetaStorageSubPath = path.join(subpath_nflTeamLogoImages_darkDefaultLogos, team.slug + ".png");
									} else if (!teamLogo.rel.includes("default") && teamLogo.rel.includes("full") && !teamLogo.rel.includes("dark") && teamLogo.rel.includes("scoreboard")) {
										newTeamLogo.localCopyMetaStorageSubPath = path.join(subpath_nflTeamLogoImages_scoreboardLogos, team.slug + ".png");
									} else if (!teamLogo.rel.includes("default") && teamLogo.rel.includes("full") && teamLogo.rel.includes("dark") && teamLogo.rel.includes("scoreboard")) {
										newTeamLogo.localCopyMetaStorageSubPath = path.join(subpath_nflTeamLogoImages_darkScoreboardLogos, team.slug + ".png");
									}

									teamLogos.push(newTeamLogo);
								}

								// Create the NFLTeam object
								const newNFLTeam = new NFLTeam(Number(team.id), team.uid, team.slug, team.abbreviation, team.displayName, team.shortDisplayName, team.name, team.nickname, team.location, team.color, team.alternateColor, team.isActive, team.isAllStar, teamLogos);

								nflTeams.push(newNFLTeam);
							} catch (error) {
								const errorMessage = `Error while creating NFLTeam object: ${error.message}`;
								throw new Error(errorMessage);
							}

							this.log.debug(`Created NFLTeam object for NFL-Team: ${team.displayName}.`);
						});

						this.log.debug(`Created array for ${nflTeams.length} NFL-Teams.`);
						return nflTeams;
					} catch (error) {
						const errorMessage = `Error while creating array for NFL-Teams: ${error.message}`;
						throw new Error(errorMessage);
					}
				} else {
					const errorMessage = `Error while fetching NFL-Teams: Invalid JSON structure received!`;
					throw new Error(errorMessage);
				}
			} else {
				const errorMessage = `Error while fetching NFL-Teams: Invalid response received!`;
				throw new Error(errorMessage);
			}
		} catch (error) {
			const errorMessage = `Error while fetching NFL-Teams: ${error.message}`;
			throw new Error(errorMessage);
		}
	}

	/**************************************************************************************************************************************
	 * Downloads and stores NFL team logo images.
	 *
	 * This function takes an array of NFLTeam objects, validates the array, and then downloads the logos for each team based on the
	 * specified logo type (default, dark-default, scoreboard, dark-scoreboard). It stores the logos in both full-size and scaled-down
	 * versions. In case of errors, it logs the error and skips to the next team.
	 *
	 * @param {NFLTeam[]} nflTeams - Array of NFLTeam objects to process.
	 *
	 * @returns {Promise<void>} - Returns a promise that resolves when all logos have been processed.
	 * @throws {Error} - Throws an error if validation of the NFL teams array fails.
	 *
	 * @todo Recreate this documentation
	 **************************************************************************************************************************************/
	async downloadAndStoreNFLTeamLogoImages(nflTeams) {
		this.log.debug(`Downloading and storing NFL-Team logo-images...`);

		// Validate received parameter 'nflTeams'
		try {
			NFLTeam.validateNFLTeamsArray(nflTeams);
		} catch (error) {
			const errorMessage = `Error while downloading and storing NFL-Team logo-images: ${error.message}`;
			throw new Error(errorMessage);
		}

		// Download all NFL-Team logo images for all NFL-Teams

		// Iterate NFL-Teams
		for (const nflTeam of nflTeams) {
			this.log.debug(`Downloading and storing NFL-Team logo-images for NFL-Team '${nflTeam.displayName}'...`);

			// Iterate NFL-Team logo-images
			for (const nflTeamLogo of nflTeam.teamLogos) {
				try {
					const downloadSuccess = await this.downloadFileToAdapterFilesDataSubDir(nflTeamLogo.url, path.dirname(nflTeamLogo.localCopyMetaStorageSubPath), path.basename(nflTeamLogo.localCopyMetaStorageSubPath));

					if (downloadSuccess) {
						this.log.debug(`Successfully downloaded and stored NFL-Team logo-image of type '${NFLTeamLogo.getHumanReadableNFLTeamLogoType(nflTeamLogo)}' for NFL-Team '${nflTeam.displayName}'.`);
					} else {
						const errorMessage = `Error while downloading and storing NFL-Team logo-image of type '${NFLTeamLogo.getHumanReadableNFLTeamLogoType(nflTeamLogo)}' for NFL-Team '${nflTeam.displayName}': Unknown error!`;
						this.log.error(errorMessage);
						continue; // Skip to the next iteration
					}
				} catch (error) {
					const errorMessage = `Error while downloading and storing NFL-Team logo-image for NFL-Team '${nflTeam.displayName}': ${error.message}`;
					this.log.error(errorMessage);
					continue; // Skip to the next iteration
				}
			}
		}

		this.log.debug(`Finished downloading and storing NFL-Team logo-images.`);
	}

	/**************************************************************************************************************************************
	 * @todo add documentation for this function
	 **************************************************************************************************************************************/
	async store_NFLteams(nflTeams) {
		// Validate received parameter 'nflTeams'
		try {
			NFLTeam.validateNFLTeamsArray(nflTeams);
		} catch (error) {
			const errorMessage = `Error while storing NFL-Teams: ${error.message}`;
			throw new Error(errorMessage);
		}

		// CREATE FOLDER for NFL-TEAMS
		this.log.debug(`Creating folder for NFL-Teams...`);
		try {
			let folderCreationResult = null;
			folderCreationResult = await this.setObjectNotExistsAsync(ioBrokerObjectID_folder_nflTeams, {
				type: "folder",
				common: {
					name: ioBrokerObjectName_folder_nflTeams,
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
				const existingObject = await this.getObjectAsync(ioBrokerObjectID_folder_nflTeams);

				if (existingObject) {
					existingObject.common = {
						...existingObject.common,
						name: ioBrokerObjectName_folder_nflTeams,
					};

					await this.extendObjectAsync(ioBrokerObjectID_folder_nflTeams, existingObject)
						.then((folderUpdateResult) => {
							if (folderUpdateResult) {
								this.log.debug(`Successfully updated folder for NFL-Teams.`);
							} else {
								const warningMessage = `Folder for NFL-Teams could not be updated: Unknown error!`;
								this.log.warn(warningMessage);
							}
						})
						.catch(() => {
							const warningMessage = `Folder for NFL-Teams could not be updated: Updated folder information could not be stored!`;
							this.log.warn(warningMessage);
						});
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
		for (const nflTeam of nflTeams) {
			this.log.debug(`Creating objects and setting states for NFL-Team '${nflTeam.displayName}'...`);

			// CREATE: NFL-TEAM FOLDER
			try {
				const nflTeamLogoForNFLTeamFolder = NFLTeam.getNFLTeamLogoOfType(nflTeam, NFLTeamLogoTypes.Scoreboard_Logo);
				const icon = nflTeamLogoForNFLTeamFolder?.base64Image ?? ""; // Provide an empty string as a default value
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(nflTeam, ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug, nflTeam.displayName, "folder", undefined, undefined, undefined, undefined, icon, undefined, undefined, undefined, undefined);
			} catch (error) {
				throw new Error(error.message);
			}

			// CREATE: NFL-TEAM SUBFOLDER 'teamInfos'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos,
					ioBrokerObjectName_folder_nflTeam_teamInfos,
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
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'id'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_state_nflTeam_id,
					ioBrokerObjectName_state_nflTeam_id,
					"state",
					undefined,
					undefined,
					"number",
					"value",
					undefined,
					false,
					true,
					nflTeam.id,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'uid'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_state_nflTeam_uid,
					ioBrokerObjectName_state_nflTeam_uid,
					"state",
					undefined,
					undefined,
					"string",
					"value",
					undefined,
					false,
					true,
					nflTeam.uid,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'abbreviation'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_state_nflTeam_abbreviation,
					ioBrokerObjectName_state_nflTeam_abbreviation,
					"state",
					undefined,
					undefined,
					"string",
					"value",
					undefined,
					false,
					true,
					nflTeam.abbreviation,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'displayName'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_state_nflTeam_displayName,
					ioBrokerObjectName_state_nflTeam_displayName,
					"state",
					undefined,
					undefined,
					"string",
					"value",
					undefined,
					false,
					true,
					nflTeam.displayName,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'shortDisplayName'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_state_nflTeam_shortDisplayName,
					ioBrokerObjectName_state_nflTeam_shortDisplayName,
					"state",
					undefined,
					undefined,
					"string",
					"value",
					undefined,
					false,
					true,
					nflTeam.shortDisplayName,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'name'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_state_nflTeam_name,
					ioBrokerObjectName_state_nflTeam_name,
					"state",
					undefined,
					null,
					"string",
					"value",
					null,
					false,
					true,
					nflTeam.name,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'nickname'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_state_nflTeam_nickname,
					ioBrokerObjectName_state_nflTeam_nickname,
					"state",
					undefined,
					undefined,
					"string",
					"value",
					undefined,
					false,
					true,
					nflTeam.nickname,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'location'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_state_nflTeam_location,
					ioBrokerObjectName_state_nflTeam_location,
					"state",
					undefined,
					undefined,
					"string",
					"value",
					undefined,
					false,
					true,
					nflTeam.location,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// CREATE: NFL-TEAM SUBFOLDER 'teamColors'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_folder_nflTeam_teamColors,
					ioBrokerObjectName_folder_nflTeam_teamColors,
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
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'color'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_folder_nflTeam_teamColors + "." + ioBrokerObjectID_state_nflTeam_color,
					ioBrokerObjectName_state_nflTeam_color,
					"state",
					undefined,
					undefined,
					"string",
					"value",
					undefined,
					false,
					true,
					nflTeam.color,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'alternateColor'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_folder_nflTeam_teamColors + "." + ioBrokerObjectID_state_nflTeam_alternateColor,
					ioBrokerObjectName_state_nflTeam_alternateColor,
					"state",
					undefined,
					undefined,
					"string",
					"value",
					undefined,
					false,
					true,
					nflTeam.alternateColor,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'isActive'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_state_nflTeam_isActive,
					ioBrokerObjectName_state_nflTeam_isActive,
					"state",
					undefined,
					undefined,
					"boolean",
					"value",
					undefined,
					false,
					true,
					nflTeam.isActive,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// STORE: NFL-TEAM 'isAllStar'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_state_nflTeam_isAllStar,
					ioBrokerObjectName_state_nflTeam_isAllStar,
					"state",
					undefined,
					undefined,
					"boolean",
					"value",
					undefined,
					false,
					true,
					nflTeam.isAllStar,
					true,
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// CREATE: NFL-TEAM SUBFOLDER 'teamLogos'
			try {
				await this.createOrUpdateObjectAndSetState_for_NFLTeam(
					nflTeam,
					ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_folder_nflTeam_teamLogos,
					ioBrokerObjectName_folder_nflTeam_teamLogos,
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
				);
			} catch (error) {
				throw new Error(error.message);
			}

			// CREATE: NFL-TEAM - 'teamLogos' SUBFOLDERS
			for (const teamLogo of nflTeam.teamLogos) {
				if (teamLogo.isDefaultLogo && teamLogo.isFullLogo && !teamLogo.isDarkLogo && !teamLogo.isScoreboardLogo) {
					// CREATE: 'TEAM LOGOS' SUBFOLDER for 'defaultLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_folder_nflTeam_teamLogos + "." + ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogo,
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogo,
							"folder",
							undefined,
							undefined,
							undefined,
							undefined,
							teamLogo.base64Image,
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
							ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_folder_nflTeam_teamLogos + "." + ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogo + "." + ioBrokerObjectID_state_nflTeam_teamLogo_url,
							ioBrokerObjectName_state_nflTeam_teamLogo_url,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogo,
							undefined,
							"string",
							"text.url",
							undefined,
							false,
							true,
							teamLogo.url,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'alternativeURL'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogo +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_alternativeURL,
							ioBrokerObjectName_state_nflTeam_teamLogo_alternativeURL,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogo,
							undefined,
							"string",
							"text.url",
							undefined,
							false,
							true,
							teamLogo.alternativeURL,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'width'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_folder_nflTeam_teamLogos + "." + ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogo + "." + ioBrokerObjectID_state_nflTeam_teamLogo_width,
							ioBrokerObjectName_state_nflTeam_teamLogo_width,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogo,
							undefined,
							"number",
							"value",
							undefined,
							false,
							true,
							teamLogo.width,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'height'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_folder_nflTeam_teamLogos + "." + ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogo + "." + ioBrokerObjectID_state_nflTeam_teamLogo_height,
							ioBrokerObjectName_state_nflTeam_teamLogo_height,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogo,
							undefined,
							"number",
							"value",
							undefined,
							false,
							true,
							teamLogo.height,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isDefaultLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogo +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isDefaultLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isDefaultLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogo,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isDefaultLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isFullLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogo +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isFullLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isFullLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogo,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isFullLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isDarkLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogo +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isDarkLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isDarkLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogo,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isDarkLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isScoreboardLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogo +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isScoreboardLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isScoreboardLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogo,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isScoreboardLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'localCopyMetaStorageSubPath'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogo +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_localCopyMetaStorageSubPath,
							ioBrokerObjectName_state_nflTeam_teamLogo_localCopyMetaStorageSubPath,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogo,
							undefined,
							"string",
							"value",
							undefined,
							false,
							true,
							teamLogo.localCopyMetaStorageSubPath,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'base64Image'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogo +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_base64Image,
							ioBrokerObjectName_state_nflTeam_teamLogo_base64Image,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogo,
							undefined,
							"string",
							"value",
							undefined,
							false,
							true,
							teamLogo.base64Image,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}
				} else if (!teamLogo.isDefaultLogo && teamLogo.isFullLogo && teamLogo.isDarkLogo && !teamLogo.isScoreboardLogo) {
					// CREATE: 'TEAM LOGOS' SUBFOLDER for 'darkDefaultLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_folder_nflTeam_teamLogos + "." + ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogoDark,
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogoDark,
							"folder",
							undefined,
							undefined,
							undefined,
							undefined,
							teamLogo.base64Image,
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
							ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_folder_nflTeam_teamLogos + "." + ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogoDark + "." + ioBrokerObjectID_state_nflTeam_teamLogo_url,
							ioBrokerObjectName_state_nflTeam_teamLogo_url,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogoDark,
							undefined,
							"string",
							"text.url",
							undefined,
							false,
							true,
							teamLogo.url,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'alternativeURL'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_alternativeURL,
							ioBrokerObjectName_state_nflTeam_teamLogo_alternativeURL,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogoDark,
							undefined,
							"string",
							"text.url",
							undefined,
							false,
							true,
							teamLogo.alternativeURL,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'width'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_width,
							ioBrokerObjectName_state_nflTeam_teamLogo_width,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogoDark,
							undefined,
							"number",
							"value",
							undefined,
							false,
							true,
							teamLogo.width,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'height'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_height,
							ioBrokerObjectName_state_nflTeam_teamLogo_height,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogoDark,
							undefined,
							"number",
							"value",
							undefined,
							false,
							true,
							teamLogo.height,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isDefaultLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isDefaultLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isDefaultLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogoDark,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isDefaultLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isFullLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isFullLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isFullLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogoDark,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isFullLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isDarkLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isDarkLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isDarkLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogoDark,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isDarkLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isScoreboardLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isScoreboardLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isScoreboardLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogoDark,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isScoreboardLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'localCopyMetaStorageSubPath'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_localCopyMetaStorageSubPath,
							ioBrokerObjectName_state_nflTeam_teamLogo_localCopyMetaStorageSubPath,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogoDark,
							undefined,
							"string",
							"value",
							undefined,
							false,
							true,
							teamLogo.localCopyMetaStorageSubPath,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'base64Image'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_defaultLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_base64Image,
							ioBrokerObjectName_state_nflTeam_teamLogo_base64Image,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_defaultLogoDark,
							undefined,
							"string",
							"value",
							undefined,
							false,
							true,
							teamLogo.base64Image,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}
				} else if (!teamLogo.isDefaultLogo && teamLogo.isFullLogo && !teamLogo.isDarkLogo && teamLogo.isScoreboardLogo) {
					// CREATE: 'TEAM LOGOS' SUBFOLDER for 'scorebaordLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_folder_nflTeam_teamLogos + "." + ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogo,
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogo,
							"folder",
							undefined,
							undefined,
							undefined,
							undefined,
							teamLogo.base64Image,
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
							ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_folder_nflTeam_teamLogos + "." + ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogo + "." + ioBrokerObjectID_state_nflTeam_teamLogo_url,
							ioBrokerObjectName_state_nflTeam_teamLogo_url,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogo,
							undefined,
							"string",
							"text.url",
							undefined,
							false,
							true,
							teamLogo.url,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'alternativeURL'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogo +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_alternativeURL,
							ioBrokerObjectName_state_nflTeam_teamLogo_alternativeURL,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogo,
							undefined,
							"string",
							"text.url",
							undefined,
							false,
							true,
							teamLogo.alternativeURL,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'width'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_folder_nflTeam_teamLogos + "." + ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogo + "." + ioBrokerObjectID_state_nflTeam_teamLogo_width,
							ioBrokerObjectName_state_nflTeam_teamLogo_width,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogo,
							undefined,
							"number",
							"value",
							undefined,
							false,
							true,
							teamLogo.width,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'height'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogo +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_height,
							ioBrokerObjectName_state_nflTeam_teamLogo_height,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogo,
							undefined,
							"number",
							"value",
							undefined,
							false,
							true,
							teamLogo.height,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isDefaultLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogo +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isDefaultLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isDefaultLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogo,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isDefaultLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isFullLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogo +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isFullLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isFullLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogo,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isFullLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isDarkLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogo +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isDarkLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isDarkLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogo,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isDarkLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isScoreboardLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogo +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isScoreboardLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isScoreboardLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogo,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isScoreboardLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'localCopyMetaStorageSubPath'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogo +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_localCopyMetaStorageSubPath,
							ioBrokerObjectName_state_nflTeam_teamLogo_localCopyMetaStorageSubPath,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogo,
							undefined,
							"string",
							"value",
							undefined,
							false,
							true,
							teamLogo.localCopyMetaStorageSubPath,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'base64Image'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogo +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_base64Image,
							ioBrokerObjectName_state_nflTeam_teamLogo_base64Image,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogo,
							undefined,
							"string",
							"value",
							undefined,
							false,
							true,
							teamLogo.base64Image,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}
				} else if (!teamLogo.isDefaultLogo && teamLogo.isFullLogo && teamLogo.isDarkLogo && teamLogo.isScoreboardLogo) {
					// CREATE: 'TEAM LOGOS' SUBFOLDER for 'darkScorebaordLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams + "." + nflTeam.slug + "." + ioBrokerObjectID_folder_nflTeam_teamInfos + "." + ioBrokerObjectID_folder_nflTeam_teamLogos + "." + ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogoDark,
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogoDark,
							"folder",
							undefined,
							undefined,
							undefined,
							undefined,
							teamLogo.base64Image,
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
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_url,
							ioBrokerObjectName_state_nflTeam_teamLogo_url,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogoDark,
							undefined,
							"string",
							"text.url",
							undefined,
							false,
							true,
							teamLogo.url,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'alternativeURL'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_alternativeURL,
							ioBrokerObjectName_state_nflTeam_teamLogo_alternativeURL,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogoDark,
							undefined,
							"string",
							"text.url",
							undefined,
							false,
							true,
							teamLogo.alternativeURL,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'width'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_width,
							ioBrokerObjectName_state_nflTeam_teamLogo_width,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogoDark,
							undefined,
							"number",
							"value",
							undefined,
							false,
							true,
							teamLogo.width,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'height'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_height,
							ioBrokerObjectName_state_nflTeam_teamLogo_height,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogoDark,
							undefined,
							"number",
							"value",
							undefined,
							false,
							true,
							teamLogo.height,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isDefaultLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isDefaultLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isDefaultLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogoDark,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isDefaultLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isFullLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isFullLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isFullLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogoDark,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isFullLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isDarkLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isDarkLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isDarkLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogoDark,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isDarkLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'isScoreboardLogo'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_isScoreboardLogo,
							ioBrokerObjectName_state_nflTeam_teamLogo_isScoreboardLogo,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogoDark,
							undefined,
							"boolean",
							"indicator",
							undefined,
							false,
							true,
							teamLogo.isScoreboardLogo,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'localCopyMetaStorageSubPath'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_localCopyMetaStorageSubPath,
							ioBrokerObjectName_state_nflTeam_teamLogo_localCopyMetaStorageSubPath,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogoDark,
							undefined,
							"string",
							"value",
							undefined,
							false,
							true,
							teamLogo.localCopyMetaStorageSubPath,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}

					// STORE: TEAM LOGO 'base64Image'
					try {
						await this.createOrUpdateObjectAndSetState_for_NFLTeam(
							nflTeam,
							ioBrokerObjectID_folder_nflTeams +
								"." +
								nflTeam.slug +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamInfos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogos +
								"." +
								ioBrokerObjectID_folder_nflTeam_teamLogo_scoreboardLogoDark +
								"." +
								ioBrokerObjectID_state_nflTeam_teamLogo_base64Image,
							ioBrokerObjectName_state_nflTeam_teamLogo_base64Image,
							"state",
							ioBrokerObjectName_folder_nflTeam_teamLogo_scoreboardLogoDark,
							undefined,
							"string",
							"value",
							undefined,
							false,
							true,
							teamLogo.base64Image,
							true,
						);
					} catch (error) {
						throw new Error(error.message);
					}
				}
			}

			this.log.debug(`Successfully created objects and set states for NFL-Team '${nflTeam.displayName}'.`);
		}
	}

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
	 * Creates or updates an object for a given NFL-Team in the specified namespace, and sets its state if applicable.
	 *
	 * @param {Object} nflTeam - The NFL team for which the object is being created or updated. Must have a `displayName` property.
	 * @param {string} namespacePath - The namespace path where the object will be created or updated.
	 * @param {string} objectName - The name of the object to be created or updated.
	 * @param {string} objectType - The type of the object (e.g., "folder", "state").
	 * @param {string} [subCategory] - An optional sub-category. Used only for ioBroker logging.
	 * @param {string} [objectDescription] - A description of the object. If not provided, this field will be omitted.
	 * @param {string} [commonType] - The common type of the object. This is not applicable for "folder" objects.
	 * @param {string} [role] - The role of the object.
	 * @param {string} [icon] - The icon for the object.
	 * @param {boolean} [write] - Specifies if the object is writable.
	 * @param {boolean} [read] - Specifies if the object is readable.
	 * @param {*} [value] - The value to be set for the object if its type is "state".
	 * @param {boolean} [acknowledge] - Acknowledgment flag for setting the state.
	 *
	 * @returns {Promise<void>} - Returns a promise that resolves when the object creation or update, and state setting (if applicable) is complete.
	 * @throws {Error} - Throws an error if there is an issue with creating, updating, or setting the state of the object.
	 **************************************************************************************************************************************/
	async createOrUpdateObjectAndSetState_for_NFLTeam(nflTeam, namespacePath, objectName, objectType, subCategory, objectDescription, commonType, role, icon, write, read, value, acknowledge) {
		// CREATE OBJECT
		if (subCategory == undefined || subCategory == null || subCategory == "") {
			this.log.silly(`Creating ${objectType} '${objectName}' for NFL-Team '${nflTeam.displayName}'...`);
		} else {
			this.log.silly(`Creating ${objectType} '${objectName}' for '${subCategory}' for NFL-Team '${nflTeam.displayName}'...`);
		}
		try {
			let objectCreationResult = null;

			const common = {};
			common.name = objectName;
			if (objectDescription !== undefined && objectDescription !== null) {
				common.desc = objectDescription;
			}
			if (commonType !== undefined && commonType !== null && objectType != "folder") {
				common.type = commonType;
			}
			if (role !== undefined && role !== null) {
				common.role = role;
			}
			if (icon !== undefined && icon !== null) {
				common.icon = icon;
			}
			if (write !== undefined && write !== null) {
				common.write = write;
			}
			if (read !== undefined && read !== null) {
				common.read = read;
			}

			objectCreationResult = await this.setObjectNotExistsAsync(namespacePath, {
				type: objectType,
				common: common,
				native: {},
			});

			if (objectCreationResult) {
				if (subCategory == undefined || subCategory == null || subCategory == "") {
					this.log.silly(`Successfully created ${objectType} '${objectName}' for NFL-Team '${nflTeam.displayName}'.`);
				} else {
					this.log.silly(`Successfully created ${objectType} '${objectName}' for '${subCategory}' for NFL-Team '${nflTeam.displayName}'.`);
				}
			} else {
				if (subCategory == undefined || subCategory == null || subCategory == "") {
					this.log.silly(`${objectType.charAt(0).toUpperCase() + objectType.slice(1).toLowerCase()} '${objectName}' for NFL-Team '${nflTeam.displayName}' does already exist.`);
				} else {
					this.log.silly(`${objectType.charAt(0).toUpperCase() + objectType.slice(1).toLowerCase()} '${objectName}' for '${subCategory}' for NFL-Team '${nflTeam.displayName}' does already exist.`);
				}

				// Update the object
				if (subCategory == undefined || subCategory == null || subCategory == "") {
					this.log.silly(`Updating the ${objectType} '${objectName}' for NFL-Team '${nflTeam.displayName}'...`);
				} else {
					this.log.silly(`Updating the ${objectType} '${objectName}' for '${subCategory}' for NFL-Team '${nflTeam.displayName}'...`);
				}

				// Fetch the existing object to preserve its current properties
				const existingObject = await this.getObjectAsync(namespacePath);

				if (existingObject) {
					// Set values to update
					existingObject.common.name = objectName;
					if (objectDescription !== undefined && objectDescription !== null) {
						existingObject.common.desc = objectDescription;
					}
					if (commonType !== undefined && commonType !== null && objectType != "folder") {
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

					await this.extendObjectAsync(namespacePath, existingObject)
						.then((objectUpdateResult) => {
							if (objectUpdateResult) {
								if (subCategory == undefined || subCategory == null || subCategory == "") {
									this.log.silly(`Successfully updated ${objectType} '${objectName}' for NFL-Team '${nflTeam.displayName}'.`);
								} else {
									this.log.silly(`Successfully updated ${objectType} '${objectName}' for '${subCategory}' for NFL-Team '${nflTeam.displayName}'.`);
								}
							} else {
								if (subCategory == undefined || subCategory == null || subCategory == "") {
									const warningMessage = `${objectType.charAt(0).toUpperCase() + objectType.slice(1).toLowerCase()} '${objectName}' for NFL-Team '${nflTeam.displayName}' could not be updated: Unknown error!`;
									this.log.warn(warningMessage);
								} else {
									const warningMessage = `${objectType.charAt(0).toUpperCase() + objectType.slice(1).toLowerCase()} '${objectName}' for '${subCategory}' for NFL-Team '${nflTeam.displayName}' could not be updated: Unknown error!`;
									this.log.warn(warningMessage);
								}
							}
						})
						.catch(() => {
							if (subCategory == undefined || subCategory == null || subCategory == "") {
								const warningMessage = `${objectType.charAt(0).toUpperCase() + objectType.slice(1).toLowerCase()} '${objectName}' for NFL-Team '${nflTeam.displayName}' could not be updated: Updated object information could not be stored!`;
								this.log.warn(warningMessage);
							} else {
								const warningMessage = `${objectType.charAt(0).toUpperCase() + objectType.slice(1).toLowerCase()} '${objectName}' for '${subCategory}' for NFL-Team '${nflTeam.displayName}' could not be updated: Updated object information could not be stored!`;
								this.log.warn(warningMessage);
							}
						});
				} else {
					if (subCategory == undefined || subCategory == null || subCategory == "") {
						const warningMessage = `${objectType.charAt(0).toUpperCase() + objectType.slice(1).toLowerCase()} '${objectName}' for NFL-Team '${nflTeam.displayName}' could not be updated: Could not retrieve existing object information!`;
						this.log.warn(warningMessage);
					} else {
						const warningMessage = `${objectType.charAt(0).toUpperCase() + objectType.slice(1).toLowerCase()} '${objectName}' for '${subCategory}' for NFL-Team '${nflTeam.displayName}' could not be updated: Could not retrieve existing object information!`;
						this.log.warn(warningMessage);
					}
				}
			}
		} catch (error) {
			if (subCategory == undefined || subCategory == null || subCategory == "") {
				const errorMessage = `Error while creating ${objectType} '${objectName}' for NFL-Team '${nflTeam.displayName}': ${error.message}`;
				this.log.error(errorMessage);
				throw new Error(errorMessage);
			} else {
				const errorMessage = `Error while creating ${objectType} '${objectName}' for '${subCategory}' for NFL-Team '${nflTeam.displayName}': ${error.message}`;
				this.log.error(errorMessage);
				throw new Error(errorMessage);
			}
		}

		// SET STATE
		if (objectType == "state") {
			if (subCategory == undefined || subCategory == null || subCategory == "") {
				this.log.silly(`Setting ${objectType} '${objectName}' for NFL-Team '${nflTeam.displayName}'...`);
			} else {
				this.log.silly(`Setting ${objectType} '${objectName}' for '${subCategory}' for NFL-Team '${nflTeam.displayName}'...`);
			}
			try {
				await this.setStateAsync(namespacePath, {
					val: value,
					ack: acknowledge,
				})
					.then(() => {
						if (subCategory == undefined || subCategory == null || subCategory == "") {
							this.log.silly(`Successfully set ${objectType} '${objectName}' for NFL-Team '${nflTeam.displayName}'.`);
						} else {
							this.log.silly(`Successfully set ${objectType} '${objectName}' for '${subCategory}' for NFL-Team '${nflTeam.displayName}'.`);
						}
					})
					.catch((error) => {
						if (subCategory == undefined || subCategory == null || subCategory == "") {
							const errorMessage = `Error while setting ${objectType} '${objectName}' for NFL-Team '${nflTeam.displayName}':  ${error.message}`;
							this.log.error(errorMessage);
							throw new Error(errorMessage);
						} else {
							const errorMessage = `Error while setting ${objectType} '${objectName}' for '${subCategory}' for NFL-Team '${nflTeam.displayName}':  ${error.message}`;
							this.log.error(errorMessage);
							throw new Error(errorMessage);
						}
					});
			} catch (error) {
				if (subCategory == undefined || subCategory == null || subCategory == "") {
					const errorMessage = `Error while setting ${objectType} '${objectName}' for NFL-Team '${nflTeam.displayName}': ${error.message}`;
					this.log.error(errorMessage);
					throw new Error(errorMessage);
				} else {
					const errorMessage = `Error while setting ${objectType} '${objectName}' for '${subCategory}' for NFL-Team '${nflTeam.displayName}': ${error.message}`;
					this.log.error(errorMessage);
					throw new Error(errorMessage);
				}
			}
		}
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

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
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }
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
