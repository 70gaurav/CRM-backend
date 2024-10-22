import Imap from "imap";
import { simpleParser } from "mailparser";
import Customer from "./models/customer.js";
import CustomerEmail from "./models/customerEmail.js";
import StoreSettings from "./models/storeSettings.js";

const getEmailAddress = (input) => {
  const match = input.match(/<([^>]+)>/);
  return match ? match[1] : input.trim();
};

const fetchEmailsFromFolder = async (imap, folder, lastFetchedDate) => {
  return new Promise((resolve, reject) => {
    imap.openBox(folder, false, (err) => {
      if (err) {
        console.error(`Error opening ${folder} for fetching:`, err);
        return reject(err);
      }

      const searchCriteria = lastFetchedDate
        ? ["ALL", ["SINCE", lastFetchedDate]]
        : ["ALL"];

      imap.search(searchCriteria, (err, results) => {
        if (err) {
          console.error(`Error searching ${folder}:`, err);
          return reject(err);
        }

        if (results.length === 0) {
          console.log(`No emails found in ${folder}.`);
          return resolve([]);
        }

        const f = imap.fetch(results, { bodies: "" });
        const emails = [];

        f.on("message", (msg) => {
          msg.on("body", (stream) => {
            simpleParser(stream, (err, parsed) => {
              if (err) {
                console.error(`Error parsing email from ${folder}:`, err);
                return;
              }

              const emailData = {
                from: getEmailAddress(parsed.from.text.trim()),
                to: getEmailAddress(parsed.to.text.trim()),
                subject: parsed.subject || "No Subject",
                date: parsed.date || new Date(),
                body: (parsed.text || parsed.html || "No Content")
                  .replace(/\n/g, " ")
                  .replace(/\s+/g, " ")
                  .trim(),
              };
              console.log();
              emails.push(emailData);
            });
          });
        });

        f.once("end", () => {
          console.log(`Done fetching emails from ${folder}.`);
          resolve(emails);
        });

        f.once("error", (ex) => {
          console.error(`Fetch error for ${folder}:`, ex);
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
    tlsOptions: {
      rejectUnauthorized: false,
    },
    authTimeout: 3000,
  };

  const imap = new Imap(imapConfig);

  return new Promise((resolve, reject) => {
    imap.once("ready", async () => {
      try {
        // Fetch LastFetchedDate and convert it to a Date object
        const lastFetchedDate = store.LastFetchedDate
          ? store.LastFetchedDate
          : null;

        // Fetch emails from Inbox
        const inboxEmails = await fetchEmailsFromFolder(
          imap,
          "INBOX",
          lastFetchedDate
        );

        // Fetch emails from Sent folder
        const sentEmails = await fetchEmailsFromFolder(
          imap,
          "SENT ITEMS",
          lastFetchedDate
        );

        // Process Inbox emails (check 'from' email)
        for (const emailData of inboxEmails) {
          const customer = await Customer.findOne({
            where: {
              EmailId: emailData.from,
            },
          });

          if (customer) {
            await CustomerEmail.create({
              CustomerId: customer.Id,
              Subject: emailData.subject,
              Content: emailData.body,
              DateTime: emailData.date,
            });

            console.log(
              `Email saved for customer ID: ${customer.Id} from inbox.`
            );
          } else {
            console.log(
              `No matching customer found for inbox email in store ${store.SettingsId}:`,
              emailData.from
            );
          }
        }

        // Process Sent emails (check 'to' email)
        for (const emailData of sentEmails) {
          const customer = await Customer.findOne({
            where: {
              EmailId: emailData.to,
            },
          });

          if (customer) {
            await CustomerEmail.create({
              CustomerId: customer.Id,
              Subject: emailData.subject,
              Content: emailData.body,
              DateTime: emailData.date,
            });

            console.log(
              `Email saved for customer ID: ${customer.Id} from sent emails.`
            );
          } else {
            console.log(
              `No matching customer found for sent email in store ${store.SettingsId}:`,
              emailData.to
            );
          }
        }

        // Update LastFetchedDate to the current date
        store.LastFetchedDate = new Date();
        await store.save();

        imap.end();
        resolve();
      } catch (error) {
        console.error(
          `Error processing emails for store ${store.SettingsId}:`,
          error
        );
        imap.end();
        reject(error);
      }
    });

    imap.once("error", (err) => {
      console.error(`IMAP Error for store ${store.SettingsId}:`, err);
      reject(err);
    });

    imap.once("end", () => {
      console.log(`Connection ended for store ${store.SettingsId}`);
    });

    imap.connect();
  });
};

const getEmails = async () => {
  try {
    const settings = await StoreSettings.findAll();

    for (const setting of settings) {
      try {
        await processStoreEmails(setting);
      } catch (error) {
        console.error(
          `Failed to process emails for store ${setting.SettingsId}:`,
          error
        );
      }
    }
  } catch (ex) {
    console.error("An error occurred while fetching stores:", ex);
  }
};

getEmails();
