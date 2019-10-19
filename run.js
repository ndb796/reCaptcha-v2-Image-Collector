const puppeteer = require('puppeteer-extra')
const pluginStealth = require('puppeteer-extra-plugin-stealth')
const Tor = require('tor-control-promise')
var fs = require('fs');
const request = require('request');

// Random number generator
function rdn (min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}

// Delay function for stable data collecting
function delay( timeout ) {
  return new Promise(( resolve ) => {
    setTimeout( resolve, timeout );
  });
}

// Download a specific image from url.
var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){    
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

// Make folder that contains images if the folder doesn't exist.
!fs.existsSync('images') && fs.mkdirSync('images');

// Given image URL and annotation, this function saves the image into the proper directory.
function process(imageUrl, annotation) {
    if(annotation.indexOf("If") != -1) {
      const question = annotation.split('If')[0];
      if(question.indexOf("Select all squares with") != -1) {
        category = annotation.split('If')[0].split('with ')[1];
        const dir = './images/' + category + '/';
        !fs.existsSync(dir) && fs.mkdirSync(dir);
        const file_length = fs.readdirSync(dir).length;
        download(imageUrl, dir + 'image' + file_length + '.png', function(){
          console.log('Image Saved: ' + dir + 'image' + file_length + '.png');
        });
      }
    }
}

// This is teh solving function for each browser tap.
async function solve (page) {
  // Waiting until the reCaptcha anchor appears.
  await page.waitForFunction(() => {
    const iframe = document.querySelector('iframe[src*="api2/anchor"]')
  if (!iframe) return false
    return !!iframe.contentWindow.document.querySelector('#recaptcha-anchor')
  })

  // Click check button for receiving reCaptcha image frame.
  let frames = await page.frames()
  const recaptchaFrame = frames.find(frame => frame.url().includes('api2/anchor'))
  const checkbox = await recaptchaFrame.$('#recaptcha-anchor')
  await checkbox.click({ delay: rdn(30, 150) })

  // Collecting the reCaptcha image infinitely.
  while(true) {
    // Waiting until the reCaptcha image frame appears.
    await page.waitForFunction(() => {
      const iframe = document.querySelector('iframe[src*="api2/bframe"]')
      if (!iframe) return false
      const img = iframe.contentWindow.document.querySelector('.rc-image-tile-wrapper img')
      return img && img.complete
    })

    // Obtaining reCaptcha image URL and annotation.
    const imageUrl = await page.evaluate(() => {
      const iframe = document.querySelector('iframe[src*="api2/bframe"]')
      return iframe.contentWindow.document.querySelector('.rc-image-tile-wrapper img').src
    })
    const annotation = await page.evaluate(() => {
      const iframe = document.querySelector('iframe[src*="api2/bframe"]')
      return iframe.contentWindow.document.querySelector('.rc-imageselect-instructions').textContent
    })

    // Click the reload button.
    frames = await page.frames()
    const imageFrame = frames.find(frame => frame.url().includes('api2/bframe'))
    const audioButton = await imageFrame.$('#recaptcha-reload-button')
    await audioButton.click({ delay: rdn(30, 150) })

    // Download the previous image.
    await delay(rdn(750, 1000));
    await process(imageUrl, annotation);
    await delay(rdn(750, 1000));
  }
}
  
async function run () {
  // Setup for using Tor
  const tor = new Tor({
    host: '127.0.0.1',
    port: 9051,
    password: 'tor'
  })

  // Check whether the Tor is working.
  try {
    await tor.connect()
    await tor.signalNewnym()
  } catch (e) {
    console.error(e)
    console.log('Tor is not working.')
    process.exit()
  }

  puppeteer.use(pluginStealth())

  // Creating some browsers and downloading images.
  const browser1 = await puppeteer.launch({
    headless: false,
    args: ['--lang=en', '--window-size=360,500', '--proxy-server=socks5://127.0.0.1:9050', '--window-position=0,0']
  })
  const page1 = await browser1.newPage()
  await page1.setDefaultNavigationTimeout(0)
  page1.goto('https://www.google.com/recaptcha/api2/demo')
  solve(page1)

  const browser2 = await puppeteer.launch({
    headless: false,
    args: ['--lang=en', '--window-size=360,500', '--proxy-server=socks5://127.0.0.1:9050', '--window-position=0,0']
  })
  const page2 = await browser2.newPage()
  await page2.setDefaultNavigationTimeout(0)
  page2.goto('https://www.google.com/recaptcha/api2/demo')
  solve(page2)

  const browser3 = await puppeteer.launch({
    headless: false,
    args: ['--lang=en', '--window-size=360,500', '--proxy-server=socks5://127.0.0.1:9050', '--window-position=0,0']
  })
  const page3 = await browser3.newPage()
  await page3.setDefaultNavigationTimeout(0)
  page3.goto('https://www.google.com/recaptcha/api2/demo')
  solve(page3)

  /*
  const browser4 = await puppeteer.launch({
    headless: false,
    args: ['--lang=en', '--window-size=360,500', '--proxy-server=socks5://127.0.0.1:9050', '--window-position=0,0']
  })
  const page4 = await browser4.newPage()
  await page4.setDefaultNavigationTimeout(0)
  page4.goto('https://www.google.com/recaptcha/api2/demo')
  solve(page4)

  const browser5 = await puppeteer.launch({
    headless: false,
    args: ['--lang=en', '--window-size=360,500', '--proxy-server=socks5://127.0.0.1:9050', '--window-position=0,0']
  })
  const page5 = await browser5.newPage()
  await page5.setDefaultNavigationTimeout(0)
  page5.goto('https://www.google.com/recaptcha/api2/demo')
  solve(page5)

  const browser6 = await puppeteer.launch({
    headless: false,
    args: ['--lang=en', '--window-size=360,500', '--proxy-server=socks5://127.0.0.1:9050', '--window-position=0,0']
  })
  const page6 = await browser6.newPage()
  await page6.setDefaultNavigationTimeout(0)
  page6.goto('https://www.google.com/recaptcha/api2/demo')
  solve(page6)
  */
}

run()