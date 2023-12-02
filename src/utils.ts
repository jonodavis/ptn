import { type Feed } from "htmlparser2";

export type Slug = "rnz" | "nzh" | "stuff";

const names: Record<Slug, string> = {
  rnz: "RNZ",
  nzh: "NZ Herald",
  stuff: "Stuff",
};

export function generateHtml(feed: Feed, slug: Slug) {
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
    .leading-5 { line-height: 1.25rem; }
    </style>
    `;
  let head = `
    <meta name="viewport" content="width=device-width" />
    <meta charset="utf-8" />
    <title>Plain Text News</title>
    <meta name="description" content="Instant NZ News Headlines" />
    ${styles}
    `;
  let nav = `
    <div class="flex justify-between mb-6 text-blue">
      <a href="/rnz" ${slug == "rnz" ? `class="font-bold"` : ""}>RNZ</a>
      <a href="/nzh" ${slug == "nzh" ? `class="font-bold"` : ""}>NZ Herald</a>
      <a href="/stuff" ${slug == "stuff" ? `class="font-bold"` : ""}>Stuff</a>
    </div> 
    `;
  let script = `
    <script type="text/javascript">
      let timeSinceElem = document.getElementById("time-since");
      let timeElem = document.getElementById("time");
      let dateElem = document.getElementById("date");
      timeElem.textContent = new Date(${Date.now()}).toLocaleTimeString();
      dateElem.textContent = new Date(Date.now()).toDateString() 
      function calulateTimeString() {
        function updateTimeSince() {
          let seconds = Math.floor((Date.now() - ${Date.now()}) / 1000);
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
          <p>Last Updated: <span id="time">${new Date().toLocaleTimeString()}</span></p>
          <p>~<span id="time-since">2 minutes</span> ago</p>
        </div>
        <p class="text-xs text-right text-gray mb-4">refresh to get latest</p>
        ${feed.items
          .map(
            (story) => `
            <div class="mb-4">
                <span class="text-xs bg-gray-200 w-fit px-2 rounded-full mt-1 mr-1 float-left">
                  ${names[slug]}
                </span>
              <a href="${story.link}" target="_blank" class="text-blue leading-5">${story.title}</a>
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
  return final;
}
