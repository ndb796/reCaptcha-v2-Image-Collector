### Setup Tor Proxy for Windows 10

* You need to download [Tor Project](https://www.torproject.org/) Windows version.
* Install using default settings.
<pre>
cd C:\Users\User Name\Desktop\Tor Browser\Browser\TorBrowser\Tor
tor CookieAuthentication 1 ControlPort 9051 HashedControlPassword 16:DB4D0D522B4946F560DBA4D9B0E47C8BA3BC2A3F7CD69C4E30581900BF | more
</pre>

###  Usage

* This project requires Node.js
<pre>
npm install
node run.js
</pre>

### Discussion

* Selenium 및 Puppeteer를 그대로 이용하는 경우 Challenge 없이 Block 처리됩니다.
* Tor를 이용하여 우회 접속하면, 비로소 Image reCaptcha Challenge가 등장합니다.
* 3개의 브라우저에서 동시에 수집하도록 하면, 대략 2초에 1개 정도의 이미지가 수집됩니다.
* 기본적으로 브라우저 개수에 상관없이 정상적으로 reCaptcha v2 화면이 잘 등장합니다.
* 이 Repository는 단순히 reCaptcha v2의 Image를 수집하는 역할만 수행합니다.
* Tor를 이용하면 무한히 Image를 Reload할 수 있습니다. (2019-10-19)
* 이미지를 작정하고 수집하고자 하면, 하루에 10,000개 넘게 수집할 수 있습니다.
* 데이터 크롤링 도중에 강제 종료하면, 특정 이미지들이 제대로 저장이 안 될 수 있으므로 이를 처리해주어야 합니다. (크기 순으로 정렬하여 이상 이미지 지우기 가능)
