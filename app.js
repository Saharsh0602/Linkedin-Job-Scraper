var express = require("express");
const {
  events,
  IData,
  LinkedinScraper,
  ERelevanceFilterOptions,
  ETimeFilterOptions
} = require('linkedin-jobs-scraper');

(async () => {
  // Each scraper instance is associated with one browser.
  // Concurrent queries will run on different pages within the same browser instance.
  const scraper = new LinkedinScraper({
    headless: true,
    slowMo: 10,
  });

  // Add listeners for scraper events
  scraper.on(events.scraper.data, (data) => {
    console.log(
      data.description.length,
      `Query='${data.query}'`,
      `Location='${data.location}'`,
      `Title='${data.title}'`,
      `Company='${data.company}'`,
      `Place='${data.place}'`,
      `Date='${data.date}'`,
      `Link='${data.link}'`,
      `senorityLevel='${data.senorityLevel}'`,
      `function='${data.jobFunction}'`,
      `employmentType='${data.employmentType}'`,
      `industries='${data.industries}'`,
    );
  });

  scraper.on(events.scraper.error, (err) => {
    console.error(err);
  });
  scraper.on(events.scraper.end, () => {
    console.log('All done!');
  });

  // Add listeners for puppeteer browser events
  scraper.on(events.puppeteer.browser.targetcreated, () => {
  });
  scraper.on(events.puppeteer.browser.targetchanged, () => {
  });
  scraper.on(events.puppeteer.browser.targetdestroyed, () => {
  });
  scraper.on(events.puppeteer.browser.disconnected, () => {
  });

  // Custom function executed on browser side to extract job description
  const descriptionProcessor = () => document.querySelector(".description__text")
    .innerText
    .replace(/[\s\n\r]+/g, " ")
    .trim();

  // Run queries concurrently
  await Promise.all([
    scraper.run(
      "Web Developer",
      "Hyderabad",
      {
        paginationMax: 2,
      }
    ),
    scraper.run(
      ["App Developer"],
      ["San Francisco", "New York"],
      {
        paginationMax: 1,
        descriptionProcessor,
        filter: {
          relevance: ERelevanceFilterOptions.RECENT,
          time: ETimeFilterOptions.DAY,
        },
        optimize: true, // Block resources such as images, fonts etc to improve bandwidth usage
      }
    )
  ]);

  // Close browser
  await scraper.close();
})();