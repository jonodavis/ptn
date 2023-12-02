import { Hono } from "hono";
import { cache } from "hono/cache";
import { logger } from "hono/logger";
import { parseFeed } from "htmlparser2";
import { generateHtml, type Slug } from "./utils";

const URLS: Record<Slug, string> = {
  rnz: "https://www.rnz.co.nz/rss/top",
  nzh: "https://www.nzherald.co.nz/arc/outboundfeeds/rss/curated/78/?outputType=xml&_website=nzh",
  stuff: "https://www.stuff.co.nz/rss",
};
const SLUGS: Slug[] = ["nzh", "rnz", "stuff"];

async function fetchFeed(slug: Slug) {
  const res = await fetch(URLS[slug]);
  const text = await res.text();
  const feed = parseFeed(text, { xmlMode: true });
  if (!feed) throw new Error("Error parsing news feed");
  return generateHtml(feed, slug);
}

const app = new Hono();
app.get(
  "*",
  cache({
    cacheName: "news",
    cacheControl: "max-age=0, stale-while-revalidate=60",
  })
);
app.use("*", logger());
app.get("/", (c) => c.redirect("/rnz"));
app.get("/:slug", (c) => {
  const slug = c.req.param("slug") as Slug;
  if (!SLUGS.includes(slug)) throw new Error("Not supported");
  return c.html(fetchFeed(slug));
});

export default app;
