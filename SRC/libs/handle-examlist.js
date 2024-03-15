const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');

async function generateChecksum() {
    try {
        const response = await axios.get('https://stdportal.emu.edu.tr/examlist.asp');
        const html = response.data;
        const examList = cheerio.load(html);
        const checksum = crypto.createHash('md5').update(examList.html()).digest('hex');
        return checksum;
    } catch (error) {
        console.error('Error generating checksum:', error);
        return null;
    }
}

// Usage example
generateChecksum().then(checksum => {
    console.log('Checksum:', checksum);
});