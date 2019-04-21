const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

const FILENAME = 'useragentstrings.txt';

let lines;
async function loadUserAgentFile() {
    if (!fs.existsSync(FILENAME)) {
        console.log(FILENAME + ' not found. Populating file with all user agent strings ...')
        await saveAllUserAgentsToFile();
    }
    lines = await fs.promises.readFile(FILENAME);
    lines += '';
    lines = lines.split('\n');
}

async function getRandomUserAgent() {
    if (!lines)
        await loadUserAgentFile();
    const getRandomUserAgentString = lines[Math.floor(Math.random()*lines.length)];
    console.log('Your random user agent string is ' + getRandomUserAgentString);
    return getRandomUserAgentString;
}

async function saveAllUserAgentsToFile() {
    const url = 'http://www.useragentstring.com/pages/useragentstring.php?name=All';
    const dom = await JSDOM.fromURL(url);  // JSDOM.fromURL(url returns a promise
    let links = dom.window.document.querySelectorAll('a');
    let BROWSER_AGENTS = {};
    processArray(links, processItem).then(function(result) {
        console.log('done');
        console.log(Object.values(BROWSER_AGENTS));
    }, function(err) {
        console.log(err);
    });

    async function processItem(item) {
        if (item.href.indexOf('http://www.useragentstring.com/index.php?id=') > -1) {
            let id = item.href.substring(item.href.indexOf('id=') + 3);
            console.log('Processing linkid = ' + id);
            const promise = JSDOM.fromURL(item.href)   // JSDOM.fromURL(url returns a promise
                .then(dom => {
                    const document = dom.window.document;
                    const textarea = document.querySelector('#uas_textfeld');
                    BROWSER_AGENTS[id] = textarea.textContent;
                    fs.appendFile(FILENAME, '\n' + textarea.textContent, (err) => {
                        if (err) throw err;
                    });
                    return textarea.textContent;
                })
                .catch(err =>
                    console.error(err + ' from ' + item.href)
                );

            return promise;
        }
    }

    async function processArray(array, fn) {
        let results = [];
        for (let i = 0; i < array.length; i++) {
            console.log('i = ' + i + ' of ' + array.length);
            results.push(await fn(array[i]));
        }
        return results;
    }

}

getRandomUserAgent();
