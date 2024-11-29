import Imap from "imap";
import { simpleParser } from "mailparser";
import Customer from "./models/customer.js";
import CustomerEmail from "./models/customerEmail.js";
import TopicMaster from "./models/topicMaster.js";
import StoreSettings from "./models/storeSettings.js";
import logger from "./lib/logger.js";

const getEmailAddress = (input) => {
  const match = input.match(/<([^>]+)>/);
  return match ? match[1] : input.trim();
};

const cleanSubject = (subject) => {
  if (!subject || typeof subject !== "string") {
    return "No Subject";
  }
  return subject.replace(/^(Re:\s*|re:\s*|RE:\s*)+/i, "").trim();
};

const getLastFetchedDate = (lastFetchedDate) => {
  if (!lastFetchedDate) return null;

  const dateInUTC = new Date(lastFetchedDate);
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(dateInUTC.getTime() + istOffset).toISOString();
};

// Fetch Emails from Folder
const fetchEmailsFromFolder = async (imap, folder, lastFetchedDate) => {
  return new Promise((resolve, reject) => {
    imap.openBox(folder, false, (err) => {
      if (err) {
        logger.error(`Error opening ${folder} for fetching:`, err);
        return reject(err);
      }

      const searchCriteria = lastFetchedDate
        ? [["SINCE", lastFetchedDate]]
        : ["ALL"];
      console.log("searchCriteria", searchCriteria, lastFetchedDate);
      logger.info(
        `Fetching emails from ${folder} with criteria: ${searchCriteria}`
      );

      imap.search(searchCriteria, (err, results) => {
        if (err) {
          logger.error(`Error searching ${folder}:`, err);
          return reject(err);
        }

        if (results.length === 0) {
          logger.info(`No emails found in ${folder}.`);
          return resolve([]);
        }

        const f = imap.fetch(results, { bodies: "" });
        const emails = [];

        f.on("message", (msg) => {
          msg.on("body", (stream) => {
            simpleParser(stream, (err, parsed) => {
              if (err) {
                logger.error(`Error parsing email:`, err);
                return;
              }

              emails.push({
                from: getEmailAddress(parsed.from.text.trim()),
                to: getEmailAddress(parsed.to.text.trim()),
                subject: cleanSubject(parsed.subject),
                date: parsed.date || new Date(),
                body: (parsed.text || parsed.html || "No Content")
                  .replace(/\n/g, " ")
                  .replace(/\s+/g, " ")
                  .trim(),
              });
            });
          });
        });

        f.once("end", () => {
          logger.info(`Fetched ${emails.length} emails from ${folder}.`);
          resolve(emails);
        });

        f.once("error", (ex) => {
          logger.error(`Fetch error for ${folder}:`, ex);
          reject(ex);
        });
      });
    });
  });
};

// Process Emails for a Store
const processStoreEmails = async (store) => {
  const imapConfig = {
    user: store.UserEmailId,
    password: store.Password,
    host: store.IMAP,
    port: 993,
    tls: true,
    tlsOptions: {
      rejectUnauthorized: false,
    },
    authTimeout: 3000,
  };

  const imap = new Imap(imapConfig);

  return new Promise((resolve, reject) => {
    imap.once("ready", async () => {
      try {
        const lastFetchedDate = getLastFetchedDate(store.LastFetchedDate);
        console.log("fetchedDates", store.lastFetchedDate, lastFetchedDate);
        const inboxEmails = await fetchEmailsFromFolder(
          imap,
          "INBOX",
          lastFetchedDate
        );

        console.log("INBOXEMAILS", inboxEmails);

        logger.info(
          `Total emails fetched for ${store.UserEmailId}: ${inboxEmails.length}`
        );

        for (const emailData of inboxEmails) {
          const customer = await Customer.findOne({
            where: { EmailId: emailData.from },
          });

          if (customer) {
            const existingTopic = await TopicMaster.findOne({
              where: {
                CustomerId: customer.Id,
                EmailSubject: emailData.subject,
              },
            });

            if(existingTopic){
              await existingTopic.update({
                DateOfLastCommunication:
                emailData.date,
              })
            }

            let topicId = existingTopic
              ? existingTopic.TopicId
              : (
                  await TopicMaster.create({
                    CustomerId: customer.Id,
                    EmailSubject: emailData.subject,
                    DateOfFirstEmail: emailData.date,
                    DateOfLastCommunication:
                      emailData.date,
                    Status: "open",
                  })
                ).TopicId;

            await CustomerEmail.create({
              CustomerId: customer.Id,
              Subject: emailData.subject,
              Content: emailData.body,
              DateTime: emailData.date,
              EmailStatus: "received",
              TopicId: topicId,
            });
            logger.info(`Saved email for customer ${customer.Id}`);
          } else {
            logger.info(
              `No matching customer for email from ${emailData.from}`
            );
          }
        }

        await store.update({
          LastFetchedDate: new Date(),
        });

        imap.end();
        resolve();
      } catch (error) {
        logger.error(
          `Error processing emails for store ${store.SettingsId}:`,
          error
        );
        imap.end();
        reject(error);
      }
    });

    imap.once("error", (err) => {
      logger.error(`IMAP error for store ${store.SettingsId}:`, err);
      reject(err);
    });

    imap.once("end", () => {
      logger.info(`IMAP connection ended for store ${store.SettingsId}`);
    });

    imap.connect();
  });
};

// Main Function to Get Emails
const getEmails = async () => {
  try {
    const settings = await StoreSettings.findAll();

    for (const setting of settings) {
      try {
        await processStoreEmails(setting);
      } catch (error) {
        logger.error(
          `Failed to process emails for store ${setting.SettingsId}:`,
          error
        );
      }
    }
  } catch (ex) {
    logger.error("An error occurred while fetching stores:", ex);
  }
};

// Start Email Fetching
getEmails();
