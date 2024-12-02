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
      logger.info(
        `Fetching emails from ${folder} with criteria: ${JSON.stringify(
          searchCriteria
        )}`
      );

      imap.search(searchCriteria, (err, results) => {
        if (err) {
          logger.error(`Error searching ${folder}:`, err);
          return reject(err);
        }

        if (!results || results.length === 0) {
          logger.info(`No emails found in ${folder}.`);
          return resolve([]);
        }

        const f = imap.fetch(results, { bodies: "" });
        const emails = [];

        f.on("message", (msg) => {
          msg.on("body", (stream) => {
            simpleParser(stream, (err, parsed) => {
              if (err) {
                logger.error("Error parsing email:", err);
                return;
              }

              emails.push({
                from: getEmailAddress(parsed.from?.text?.trim() || ""),
                to: getEmailAddress(parsed.to?.text?.trim() || ""),
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

const processStoreEmails = async (store) => {
  const imapConfig = {
    user: store.UserEmailId,
    password: store.Password,
    host: store.IMAP,
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 3000,
  };

  const imap = new Imap(imapConfig);

  return new Promise((resolve, reject) => {
    imap.once("ready", async () => {
      try {
        const lastFetchedDate = getLastFetchedDate(store.LastFetchedDate);
        const inboxEmails = await fetchEmailsFromFolder(
          imap,
          "INBOX",
          lastFetchedDate
        );

        logger.info(
          `Total emails fetched for ${store.UserEmailId}: ${inboxEmails.length}`
        );

        for (const emailData of inboxEmails) {
          try {
            const customer = await Customer.findOne({
              where: { EmailId: emailData.from },
            });

            if (!customer) {
              logger.info(
                `No matching customer found for email from ${emailData.from}`
              );
              continue;
            }

            const existingTopic = await TopicMaster.findOne({
              where: {
                CustomerId: customer.Id,
                EmailSubject: emailData.subject,
              },
            });

            const topicId = existingTopic
              ? (await existingTopic.update({
                  DateOfLastCommunication: emailData.date,
                })).TopicId
              : (
                  await TopicMaster.create({
                    CustomerId: customer.Id,
                    EmailSubject: emailData.subject,
                    DateOfFirstEmail: emailData.date,
                    DateOfLastCommunication: emailData.date,
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

            logger.info(
              `Saved email for customer ${customer.Id}, topic ${topicId}`
            );
          } catch (error) {
            logger.error(
              `Error processing email ${emailData.subject} for store ${store.SettingsId}:`,
              error
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

const getEmails = async () => {
  try {
    const settings = await StoreSettings.findAll();

    for (const setting of settings) {
      await processStoreEmails(setting).catch((error) => {
        logger.error(
          `Error while processing store ${setting.UserEmailId}:`,
          error
        );
      });
    }

    logger.info("Completed processing all stores.");
  } catch (ex) {
    logger.error("An error occurred while fetching stores:", ex);
  }
};

getEmails();


