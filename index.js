const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cheerio = require('cheerio');
const schedule = require('node-schedule');
const moment = require('moment-timezone');

const apiToken = '7458060169:AAG7-MfOXwzUqiNNdA2X2tckOik0_XQWnRo';
const bot = new TelegramBot(apiToken, { polling: true });
const chatId = '-1001661952322';

// Get random dua
async function getRandomDua() {
    try {
        const { data } = await axios.get("https://kalemtayeb.com/adeiah/section/16");
        const $ = cheerio.load(data);
        const duaElements = $("div.item_nass").map((i, el) => $(el).text().trim().replace('*', '۞').replace(/"/g, '')).get();
        const validDuas = duaElements.filter(dua => dua.length > 0 && dua.length <= 150);
        const randomDua = validDuas[Math.floor(Math.random() * validDuas.length)];
        return randomDua;
    } catch (error) {
        console.error("Error fetching dua:", error);
        return "Error fetching dua";
    }
}

// Convert time to Arabic AM/PM
function arabicAmPm(timeStr) {
    if (timeStr.includes('AM')) {
        return timeStr.replace('AM', 'ص');
    } else if (timeStr.includes('PM')) {
        return timeStr.replace('PM', 'م');
    }
    return timeStr;
}

// Convert numbers to Arabic numerals
function arabicNumerals(text) {
    const arabicDigits = {
        '0': '٠',
        '1': '١',
        '2': '٢',
        '3': '٣',
        '4': '٤',
        '5': '٥',
        '6': '٦',
        '7': '٧',
        '8': '٨',
        '9': '٩'
    };
    return text.replace(/[0-9]/g, (d) => arabicDigits[d]);
}

// Update group info
async function updateGroupInfo() {
    try {
        const now = moment.tz('Africa/Cairo');
        const currentTime = now.format("hh:mm A");
        const currentTimeArabic = arabicAmPm(currentTime);
        const gregorianDate = now.format("YYYY/MM/DD");
        const gregorianDateArabic = arabicNumerals(gregorianDate);

        const arabicDayNames = {
            'Monday': 'الاثنين',
            'Tuesday': 'الثلاثاء',
            'Wednesday': 'الأربعاء',
            'Thursday': 'الخميس',
            'Friday': 'الجمعة',
            'Saturday': 'السبت',
            'Sunday': 'الأحد'
        };
        const dayName = now.format('dddd');
        const arabicDayName = arabicDayNames[dayName];

        const dua = await getRandomDua();
        const newAbout = `«${dua}»\n` +
                         "────────────────\n" +
                         `🕰╽الساعة الان بتوقيت مصر⇜ ${currentTimeArabic} ؛\n` +
                         `🌏╽التاريخ ⇜ ${gregorianDateArabic} ؛\n` +
                         `🌈╽اليوم⇜ ${arabicDayName} ؛`;

        await bot.setChatDescription(chatId, newAbout);
        console.log("Group info updated successfully");
    } catch (error) {
        console.error("Error updating group info:", error);
    }
}

// Update group info initially
updateGroupInfo();

// Schedule the update every minute
schedule.scheduleJob('* * * * *', updateGroupInfo);

console.log("Bot is running and will update group info every minute");
