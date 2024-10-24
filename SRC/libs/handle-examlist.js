import axios from "axios";
import * as cheerio from "cheerio";
import crypto from "crypto";

const ExamListURL = "https://stdportal.emu.edu.tr/examlist.asp";

var Cache = [];
var Checksum = "";

export default function EMUInfo() {
  return {
    name: "EMU Exam List",
  };
}

export async function generateChecksum() {
  try {
    const response = await axios.get(ExamListURL);
    const html = response.data;
    const examList = cheerio.load(html);
    const checksum = crypto
      .createHash("md5")
      .update(examList.html())
      .digest("hex");
    return checksum;
  } catch (error) {
    console.error("Error generating checksum:", error);
    return null;
  }
}

async function generateExamListObjects() {
  var avalibleDates = [];
  var avalibleExams = [];
  var avaliblePeriods = [];
  var avalibleCourses = [];
  var avalibleTables = 0;
  var avalibleColumns = 0;
  var eachTableMaxColumns = [];

  try {
    const response = await axios.get(ExamListURL);
    const html = response.data;

    const $ = cheerio.load(html);
    avalibleTables = $("table").length;

    // Get Possible Exam Dates
    $("table")
      .first()
      .find("font")
      .each((i, el) => {
        avalibleDates.push($(el).text().trim());
      });

    // Get Possible Maximum Columns
    avalibleColumns = avalibleDates.length;

    // Get Possible Exam Periods
    $("body")
      .find("b")
      .each((i, el) => {
        var period = $(el).text().split("Period : ")[1];
        if (period != undefined) {
          avaliblePeriods.push(period);
        }
      });

    // Get Possible Exam Courses
    $("table")
      .find("font")
      .each((i, el) => {
        var course = $(el).text().trim();
        if (course != undefined) {
          avalibleCourses.push(course);
        }
      });

    // Get Maximum Columns for each table
    $("table").each((i, el) => {
      var maxColumns = $(el).find("tr").length;
      eachTableMaxColumns.push({
        table: i,
        columns: maxColumns,
      });
    });
    eachTableMaxColumns.shift();

    // Generate Exam list by finding avalibleCourses in the tables according to possition of the courses in the table
    avalibleCourses.forEach((element) => {
      // find element in the table and get the possition
      var course = element;
      var courseIndex = avalibleCourses.indexOf(course);
      var courseColumn = courseIndex % avalibleColumns;
      var courseRow = Math.floor(courseIndex / avalibleColumns);

      var rangeOfPeriods = [];
      var currentMaxPeriod = 0;

      eachTableMaxColumns.forEach((element) => {
        if (courseRow <= currentMaxPeriod) {
          return;
        } else {
          currentMaxPeriod += element.columns;
          rangeOfPeriods.push(element);
        }
      });

      var courseDate = avalibleDates[courseColumn];
      var courseObject = {
        course: course,
        period: avaliblePeriods[rangeOfPeriods.length - 1],
        date: courseDate,
      };
      avalibleExams.push(courseObject);
    });

    return avalibleExams;
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function EMUExamList() {
  var checksum = await generateChecksum();
  if (checksum != Checksum) {
    Cache = await generateExamListObjects();
    Checksum = checksum;
  }
  return {
    checksum: Checksum,
    examList: Cache,
  };
}
