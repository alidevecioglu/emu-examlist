import { generateChecksum, EMUExamList } from './libs/handle-examlist.js';

import ical, {ICalCalendarMethod} from 'ical-generator';
import express from 'express';
import { rateLimit } from 'express-rate-limit'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const cacheTime = 30 * 60 * 1000; // 30 minutes

var Checksum = '';
var Cache = {};

async function Update() {
    var checksum = await EMUExamList();
    if (checksum.checksum != Checksum) {
        console.log('[U] Checksum changed, updating exam list...');
        Cache = await EMUExamList();
        Checksum = checksum.checksum;
    } else {
        console.log('[S] Checksum is the same, no need to update');
    }
}

function parseDate(dateObj) {
    const { course, period, date } = dateObj;
    const [day, month, year] = date.split(' ');
    const [hour, minute] = period.split(':');
    const formattedDate = new Date(`${month} ${day}, ${year} ${hour}:${minute}`);
    return { course, period:dateObj.period, date: dateObj.date, ParsedDate: formattedDate };
}

// function to accept array of Course Codes and return the exam list in JSON format
async function GetExamList(codes) {
    var examList = [];
    for (const code of codes) {
        var course = Cache.examList.find(x => x.course == code);
        if (course) {
            examList.push(parseDate(course));
        } else {
            examList.push({ course: code, period: 'Not Available', date: 'Not Available', ParsedDate: 0});
        }
    }
    return examList;
}

// function to create ical from course code array
async function CreateICal(codes) {
    const calendar = ical({name: 'EMU Exam Calendar'});
    calendar.method(ICalCalendarMethod.REQUEST);
    var examList = await GetExamList(codes);
    examList.forEach(element => {
        if (element.ParsedDate !== 0) {
            calendar.createEvent({
                start: element.ParsedDate,
                end: new Date(element.ParsedDate.getTime() + 2 * 60 * 60 * 1000),
                summary: element.course,
                description: `Exam for ${element.course} at ${element.period}`,
                location: 'EMU Campus',
                timezone: 'Asia/Famagusta'
            });
        }
    });
    return calendar;
}

await Update();

setInterval(async () => {
    await Update();
}, cacheTime);

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
});

app.use(limiter);
app.set('view engine', 'ejs');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
  });

app.get('/cal/:codes', async (req, res) => {
    const codes = req.params.codes.split(',');
    const ical = await CreateICal(codes);
    res.set({
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="calendar.ics"'
    });
    res.send(ical.toString());
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
