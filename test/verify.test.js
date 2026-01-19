const http = require("http");
const fs = require("fs");
const puppeteer = require("puppeteer");

let server;
let browser;
let page;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    fs.readFile(__dirname + "/.." + req.url, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  });

  server.listen(process.env.PORT || 3000);
});

afterAll(() => {
  server.close();
});

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  page = await browser.newPage();
  await page.goto("http://localhost:3000/index.html", { waitUntil: "domcontentloaded" });
});

afterEach(async () => {
  await browser.close();
});

describe('the javascript in the script element', () => {
  it('should be cut and moved to the index.js file', async () => {
    const scriptExists = await page.$('body script');
    expect(scriptExists).not.toBeNull();

    const innerHtml = await page.$eval('body script', (script) => script.innerHTML.trim());
    expect(innerHtml).toBe('');
  });

  it('should point to the index.js file', async () => {
    const scriptExists = await page.$('body script');
    expect(scriptExists).not.toBeNull();

    const src = await page.$eval('body script', (script) => script.getAttribute('src'));
    expect(src).toBe("index.js");
  });

  it('should set the result element to 50', async () => {
    await page.waitForSelector('#result', { visible: true });

    const innerHtml = await page.$eval('#result', (result) => result.innerHTML);
    expect(innerHtml).toBe('50');
  });
});

