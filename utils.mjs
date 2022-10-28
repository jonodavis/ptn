import fetch from "node-fetch";
import * as cheerio from "cheerio";

const getStoryPage = async (link) => {
  return await fetch(link).then((res) => res.text());
};

const getMetaDescription = (res) => {
  const $ = cheerio.load(res);
  return String($('meta[name="description"]').attr("content")).trim();
};

const getMetaTitle = (res) => {
  const $ = cheerio.load(res);
  return $('meta[property="og:title"]').attr("content");
};

export const getNZHerald = async () => {
  try {
    let proms = [];
    let stories = [];
    // load nzherald homepage
    const $ = cheerio.load(
      await fetch("https://www.nzherald.co.nz/").then((res) => res.text())
    );
    // loop through all the story links
    $(".story-card__heading__link").each((i, link) => {
      // promise for getting meta description from link
      proms.push(getStoryPage($(link).attr("href")));
      // push the link to the stories array if there is still space
      if (stories.length < 20) {
        stories.push({
          url: $(link).attr("href"),
        });
      } else {
        return false; // exit our loop early, we already have the top 20 stories
      }
    });
    // wait for all our meta descriptions to be fetched before we return stories
    const pages = await Promise.all(proms);
    stories.map((story, i) => {
      story.description = getMetaDescription(pages[i]);
      story.title = getMetaTitle(pages[i]);
      if (pages[i].includes("article__header-premium")) story.paywall = true;
      if (
        cheerio.load(pages[i])(".article-bigread__label").text() === "Premium"
      )
        story.paywall = true;
    });
    return {
      lastUpdate: Date.now(),
      stories,
    };
  } catch (err) {
    console.error(err);
  }
};

export const getRNZ = async () => {
  try {
    let proms = [];
    let stories = [];
    // load rnz homepage
    const $ = cheerio.load(
      await fetch("https://www.rnz.co.nz/").then((res) => res.text())
    );
    // loop through all the story links
    $(".faux-link").each((i, link) => {
      // promise for getting meta description from link
      proms.push(getStoryPage(`https://www.rnz.co.nz${$(link).attr("href")}`));
      // push the link to the stories array if there is still space
      if (stories.length < 20) {
        stories.push({
          url: `https://www.rnz.co.nz${$(link).attr("href")}`,
        });
      } else {
        return false; // exit our loop early, we already have the top 20 stories
      }
    });
    // wait for all our meta descriptions to be fetched before we return stories
    const pages = await Promise.all(proms);
    stories.map((story, i) => {
      story.description = getMetaDescription(pages[i]);
      story.title = getMetaTitle(pages[i]);
    });
    return {
      lastUpdate: Date.now(),
      stories,
    };
  } catch (err) {
    console.error(err);
  }
};

export const getStuff = async () => {
  try {
    let proms = [];
    let stories = [];
    // load stuff homepage
    const $ = cheerio.load(
      await fetch("https://www.stuff.co.nz/").then((res) => res.text())
    );
    // loop through all the story links
    $("[itemprop='url']").each((i, link) => {
      // promise for getting meta description from link
      const url = $(link).attr("href").startsWith("https://")
        ? $(link).attr("href")
        : `https://www.stuff.co.nz${$(link).attr("href")}`;
      proms.push(getStoryPage(url));
      // push the link to the stories array if there is still space
      if (stories.length < 20) {
        stories.push({
          url: url,
        });
      } else {
        return false; // exit our loop early, we already have the top 20 stories
      }
    });
    // wait for all our meta descriptions to be fetched before we return stories
    const pages = await Promise.all(proms);
    stories.map((story, i) => {
      story.description = getMetaDescription(pages[i]);
      story.title = getMetaTitle(pages[i]);
    });
    return {
      lastUpdate: Date.now(),
      stories,
    };
  } catch (err) {
    console.error(err);
  }
};

export const get1News = async () => {
  try {
    let proms = [];
    let stories = [];
    // load stuff homepage
    const $ = cheerio.load(
      await fetch("https://www.1news.co.nz/").then((res) => res.text())
    );
    // loop through all the story links
    $(".story").each((i, link) => {
      // promise for getting meta description from link
      link = $(link).find("a").first();
      const url = $(link).attr("href").startsWith("https://")
        ? $(link).attr("href")
        : `https://www.1news.co.nz${$(link).attr("href")}`;
      // push the link to the stories array if there is still space
      if (stories.length < 20) {
        if (!stories.some((story) => story.url === url)) {
          console.log("adding story", i);
          stories.push({
            url: url,
          });
          proms.push(getStoryPage(url));
        }
      } else {
        return false; // exit our loop early, we already have the top 20 stories
      }
    });
    // wait for all our meta descriptions to be fetched before we return stories
    const pages = await Promise.all(proms);
    stories.map((story, i) => {
      story.description = getMetaDescription(pages[i]);
      story.title = getMetaTitle(pages[i]);
    });
    return {
      lastUpdate: Date.now(),
      stories,
    };
  } catch (err) {
    console.error(err);
  }
};

export const getNewshub = async () => {
  try {
    let proms = [];
    let stories = [];
    // load stuff homepage
    const $ = cheerio.load(
      await fetch("https://www.newshub.co.nz/").then((res) => res.text())
    );
    // loop through all the story links
    $(".c-NewsTile").each((i, link) => {
      // promise for getting meta description from link
      link = $(link).find("a").first();
      const url = $(link).attr("href").startsWith("https://")
        ? $(link).attr("href")
        : `https://www.newshub.co.nz${$(link).attr("href")}`;
      proms.push(getStoryPage(url));
      // push the link to the stories array if there is still space
      if (stories.length < 20) {
        stories.push({
          url: url,
        });
      } else {
        return false; // exit our loop early, we already have the top 20 stories
      }
    });
    // wait for all our meta descriptions to be fetched before we return stories
    const pages = await Promise.all(proms);
    stories.map((story, i) => {
      story.description = getMetaDescription(pages[i]);
      story.title = getMetaTitle(pages[i]);
    });
    return {
      lastUpdate: Date.now(),
      stories,
    };
  } catch (err) {
    console.error(err);
  }
};

const main = async () => {
  const news = await get1News();
  console.log(news);
};

main();
