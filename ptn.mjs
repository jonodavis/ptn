import * as utils from "./utils.mjs";
import aws from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

// Add timestamp to logging
console.logCopy = console.log.bind(console);
console.infoCopy = console.info.bind(console);
console.errorCopy = console.error.bind(console);

console.log = function (data) {
  let currentDate = "[" + new Date().toUTCString() + "] ";
  this.logCopy(currentDate, data);
};
console.info = function (data) {
  let currentDate = "[" + new Date().toUTCString() + "] ";
  this.infoCopy(currentDate, data);
};
console.error = function (data) {
  let currentDate = "[" + new Date().toUTCString() + "] ";
  this.errorCopy(currentDate, data);
};

// Setup AWS SDK
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const s3 = new aws.S3({ region: process.env.REGION });
const cloudFront = new aws.CloudFront();

// Variables used to store news data
let nzHerald = {};
let stuff = {};
let rnz = {};
let oneNews = {};
let newshub = {};
let highlights = {};

// Sleep util function
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Generates an HTML page for a source and uploads it to S3
 * @param {object} data News data to be used for populating the HTML page
 * @param {String} slug Slug of the HTML page to be generated
 */
const genSourcePage = async (data, slug) => {
  let styles = `
  <style>
  body {
    margin: 0;
    line-height: inherit;
    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
    --blue: rgb(37 99 235);
    --gray: rgb(107 114 128);
  }
  h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
  blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre {
    margin: 0;
  }
  a { text-decoration: inherit; color: var(--blue); }
  .container { width: 400px; margin: auto; }

  /* small tailwind-like styles */
  .mx-2 { margin-left: 0.5rem; margin-right: 0.5rem; }
  .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
  .text-center { text-align: center; }
  .font-bold { font-weight: 700; }
  .text-xs { font-size: 0.75rem; line-height: 1rem; }
  .flex { display: flex; }
  .text-blue { color: var(--blue); }
  .justify-between { justify-content: space-between; }
  .mb-6 { margin-bottom: 1.5rem; }
  .mb-4 { margin-bottom: 1rem; }
  .text-right { text-align: right; }
  .text-gray { color: var(--gray); }
  .w-full { width: 100%; }
  .mt-8 { margin-top: 2rem; }
  .my-8 { margin-top: 2rem; margin-bottom: 2rem; }
  .text-red-800 { color: rgb(153 27 27); }
  .bg-red-200 { background-color: rgb(254 202 202); }
  .bg-gray-200 { background-color: rgb(229 231 235); }
  .rounded-full { border-radius: 9999px; }
  .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
  .mt-1 { margin-top: 0.25rem; }
  .mr-1 { margin-right: 0.25rem; }
  .float-left { float: left; }
  </style>
  `;
  let head = `
  <meta name="viewport" content="width=device-width" />
  <meta charset="utf-8" />
  <title>Plain Text News</title>
  <meta name="description" content="Instant NZ News Headlines" />
  <link rel="icon" href="/favicon.ico" />
  ${styles}
  `;
  let nav = `
  <div class="flex justify-between mb-6 text-blue">
    <a href="/rnz" ${slug == "rnz" ? `class="font-bold"` : ""}>RNZ</a>
    <a href="/nzherald" ${
      slug == "nzherald" ? `class="font-bold"` : ""
    }>NZ Herald</a>
    <a href="/stuff" ${slug == "stuff" ? `class="font-bold"` : ""}>Stuff</a>
    <a href="/1news" ${slug == "1news" ? `class="font-bold"` : ""}>1News</a>
    <a href="/newshub" ${
      slug == "newshub" ? `class="font-bold"` : ""
    }>Newshub</a>
  </div> 
  `;
  let script = `
  <script type="text/javascript">
    let timeSinceElem = document.getElementById("time-since");
    let timeElem = document.getElementById("time");
    let dateElem = document.getElementById("date");
    timeElem.textContent = new Date(${data.lastUpdate}).toLocaleTimeString();
    dateElem.textContent = new Date(Date.now()).toDateString() 
    function calulateTimeString() {
      function updateTimeSince() {
        let seconds = Math.floor((Date.now() - ${data.lastUpdate}) / 1000);
        let interval = seconds / 3600;
        if (interval > 1) {
          return \`\${Math.floor(interval)} \${
            Math.floor(interval) === 1 ? " hour" : " hours"
          }\`;
        }
        interval = seconds / 60;
        if (interval > 1) {
          return \`\${Math.floor(interval)} \${
            Math.floor(interval) === 1 ? " minute" : " minutes"
          }\`;
        }
        return Math.floor(seconds) + " seconds";
      }
      timeSinceElem.textContent = updateTimeSince();
      setTimeout(() => calulateTimeString(), 10000);
    }
    calulateTimeString();
  </script>
  `;
  let body = `
  <div class="container">
    <div class="mx-2">
      <header class="my-4 text-center">
        <a href="/">
          <h1 class="font-bold">Plain Text News</h1>
        </a>
          <p class="text-xs" id="date">${new Date(
            Date.now()
          ).toDateString()}</p>
      </header>
      ${nav}
      <div class="flex justify-between text-xs">
        <p>Last Updated: <span id="time">${new Date(
          data.lastUpdate
        ).toLocaleTimeString()}</span></p>
        <p>~<span id="time-since">2 minutes</span> ago</p>
      </div>
      <p class="text-xs text-right text-gray mb-4">refresh to get latest</p>
      ${data.stories
        .map(
          (story) => `
          <div class="mb-4">
            ${
              story.paywall
                ? `
              <span class="text-red-800 text-xs bg-red-200 w-fit px-2 rounded-full mt-1 mr-1 float-left">
                PAYWALL
              </span>`
                : ""
            }
            ${
              story.source
                ? `
              <span class="text-xs bg-gray-200 w-fit px-2 rounded-full mt-1 mr-1 float-left">
                ${story.source}
              </span>`
                : ""
            }
            <a href="${story.url}" target="_blank" class="text-blue">${
            story.title
          }</a>
            <p class="text-xs">${story.description}</p>
          </div>
        `
        )
        .join("")}
      <div class="w-full mt-8 text-center">
        <a href="#">Back to top</a>
      </div>
      <footer class="my-8 text-center text-xs">
        <p>Made With 💜 in Tāmaki Makaurau</p>
        <a href="https://pancake.nz">pancake.nz</a>
      </footer>
    </div>
  </div>
  ${script}
  `;
  let final = `
  <!DOCTYPE html>
  <html lang="en">
    <head>${head}</head>
    <body>${body}</body>
  </html>
  `;

  // Upload HTML string as a file to S3 bucket
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: slug,
    Body: final,
    ContentType: "text/html",
  };
  await s3.upload(params).promise();
};

const main = async () => {
  console.info("ptn daemon starting...");
  while (true) {
    try {
      console.info("Refreshing news data...");
      // Get news data from all sources
      let [newNZHerald, newStuff, newRNZ, new1News, newNewshub] =
        await Promise.all([
          utils.getNZHerald(),
          utils.getStuff(),
          utils.getRNZ(),
          utils.get1News(),
          utils.getNewshub(),
        ]);
      // If any of the sources have new changes, update the respective variable
      if (newNZHerald) nzHerald = newNZHerald;
      if (newStuff) stuff = newStuff;
      if (newRNZ) rnz = newRNZ;
      if (new1News) oneNews = new1News;
      if (newNewshub) newshub = newNewshub;
      // Generate a highlights object with top 5 stories from each source
      highlights = {
        lastUpdate: Date.now(),
        rnz: rnz.stories.slice(0, 5),
        nzHerald: nzHerald.stories.slice(0, 5),
        stuff: stuff.stories.slice(0, 5),
        oneNews: oneNews.stories.slice(0, 5),
        newshub: newshub.stories.slice(0, 5),
      };
      // Order the highlights so we have 1 story from each source
      let orderedHighlights = {
        stories: [],
        lastUpdate: highlights.lastUpdate,
      };
      for (let i = 0; i < 5; i++) {
        orderedHighlights.stories.push({
          source: "RNZ",
          ...highlights.rnz.shift(),
        });
        orderedHighlights.stories.push({
          source: "NZ Herald",
          ...highlights.nzHerald.shift(),
        });
        orderedHighlights.stories.push({
          source: "Stuff",
          ...highlights.stuff.shift(),
        });
        orderedHighlights.stories.push({
          source: "1News",
          ...highlights.oneNews.shift(),
        });
        orderedHighlights.stories.push({
          source: "Newshub",
          ...highlights.newshub.shift(),
        });
      }
      console.info("News data refreshed.");
      console.info("Generating HTML files...");
      // Use new data to generate HTML files
      await Promise.all([
        genSourcePage(rnz, "rnz"),
        genSourcePage(nzHerald, "nzherald"),
        genSourcePage(stuff, "stuff"),
        genSourcePage(oneNews, "1news"),
        genSourcePage(newshub, "newshub"),
        genSourcePage(orderedHighlights, "index.html"),
      ]);
      console.info("HTML files generated.");
      // Invalidate CloudFront cache
      console.info("Invalidating CloudFront cache...");
      await cloudFront
        .createInvalidation({
          DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
          InvalidationBatch: {
            CallerReference: Date.now().toString(),
            Paths: {
              Quantity: 1,
              Items: ["/*"],
            },
          },
        })
        .promise();
      console.info("CloudFront cache invalidated.");
    } catch (err) {
      console.error(err);
    }
    // Wait 15 minutes before refreshing again
    await sleep(900000);
  }
};

main();
