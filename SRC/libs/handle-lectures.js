import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.emu.edu.tr/courses?code=";

// Database to store lecture codes and names
const lectureCodeDB = [];

/**
 * Fetches the lecture name from the EMU website.
 * @param {string} code - The lecture code.
 * @returns {Promise<string>} - The lecture name.
 */
async function fetchLectureName(code) {
  console.log(`Fetching lecture name for code ${code}...`);
  try {
    const response = await axios.get(`${BASE_URL}${code}`);
    const $ = cheerio.load(response.data);
    const name = $("#content > h1").text().trim();
    return name || false;
  } catch (error) {
    console.error(`Error fetching lecture name for code ${code}:`, error);
    return false;
  }
}

/**
 * Saves a lecture code and name to the database.
 * @param {string} code - The lecture code.
 * @param {string} name - The lecture name.
 */
function saveLectureName(code, name) {
  if (!lectureCodeDB.some((entry) => entry.code === code)) {
    lectureCodeDB.push({ code, name });
  }
}

/**
 * Retrieves the lecture name for a given code.
 * - Checks the database first.
 * - If not found, fetches it from the website and saves it.
 * @param {string} code - The lecture code.
 * @returns {Promise<string>} - The lecture name.
 */
async function getLectureNameFromDB(code) {
  const cachedEntry = lectureCodeDB.find((entry) => entry.code === code);
  if (cachedEntry) {
    return cachedEntry.name;
  }

  const name = await fetchLectureName(code);
  saveLectureName(code, name);
  return name;
}

export { fetchLectureName, saveLectureName, getLectureNameFromDB };
