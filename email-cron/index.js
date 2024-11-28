// import Imap from "imap";
// import { simpleParser } from "mailparser";
// import Customer from "./models/customer.js";
// import CustomerEmail from "./models/customerEmail.js";
// import TopicMaster from "./models/topicMaster.js";
// import StoreSettings from "./models/storeSettings.js";
// import logger from "./lib/logger.js";

// const getEmailAddress = (input) => {
//   const match = input.match(/<([^>]+)>/);
//   return match ? match[1] : input.trim();
// };

// const cleanSubject = (subject) => {
//   if (!subject || typeof subject !== "string") {
//     return "No Subject";
//   }
//   return subject.replace(/^(Re:\s*|re:\s*|RE:\s*)+/i, "").trim();
// };

// const fetchEmailsFromFolder = async (imap, folder, lastFetchedDate) => {
//   return new Promise((resolve, reject) => {
//     imap.openBox(folder, false, (err) => {
//       if (err) {
//         logger.error(`Error opening ${folder} for fetching:`, err);
//         return reject(err);
//       }

//       const searchCriteria = lastFetchedDate
//         ? [["SINCE", lastFetchedDate]]
//         : ["ALL"];

//       imap.search(searchCriteria, (err, results) => {
//         if (err) {
//           logger.error(`Error searching ${folder}:`, err);
//           return reject(err);
//         }
//         console.log("results", results);
//         if (results.length === 0) {
//           logger.info(`No emails found in ${folder}.`);
//           return resolve([]);
//         }

//         const f = imap.fetch(results, { bodies: "" });
//         // const f = imap.fetch(results, { bodies: "", struct: true, uid: true });
//         const emails = [];

//         f.on("message", (msg) => {
//           // let emailUID;

//           // // Get UID from message attributes
//           // msg.on("attributes", (attrs) => {
//           //   emailUID = attrs.uid; // Store the UID from attributes
//           // });

//           // console.log("emailUID", emailUID);

//           msg.on("body", (stream) => {
//             simpleParser(stream, (err, parsed) => {
//               if (err) {
//                 logger.error(`Error parsing email from ${folder}:`, err);
//                 return;
//               }
//               const emailData = {
//                 from: getEmailAddress(parsed.from.text.trim()),
//                 to: getEmailAddress(parsed.to.text.trim()),
//                 subject: cleanSubject(parsed.subject),
//                 date: parsed.date || new Date(),
//                 body: (parsed.text || parsed.html || "No Content")
//                   .replace(/\n/g, " ")
//                   .replace(/\s+/g, " ")
//                   .trim(),
//               };
//               emails.push(emailData);
//             });
//           });
//         });

//         f.once("end", () => {
//           logger.info(`Done fetching emails from ${folder}.`);
//           resolve(emails);
//         });

//         f.once("error", (ex) => {
//           logger.error(`Fetch error for ${folder}:`, ex);
//           reject(ex);
//         });
//       });
//     });
//   });
// };

// const processStoreEmails = async (store) => {
//   const imapConfig = {
//     user: store.UserEmailId,
//     password: store.Password,
//     host: store.IMAP,
//     port: 993,
//     tls: true,
//     tlsOptions: {
//       rejectUnauthorized: false,
//     },
//     authTimeout: 3000,
//   };

//   const imap = new Imap(imapConfig);

//   return new Promise((resolve, reject) => {
//     imap.once("ready", async () => {
//       try {
//         // Fetch LastFetchedDate
//         const fetchedDate = store.LastFetchedDate
//           ? store.LastFetchedDate
//           : null;
//         // console.log("fetchedDate", fetchedDate);
//         const dateInUTC = new Date(fetchedDate);

//         // Convert to IST
//         const istOffset = 5.5 * 60 * 60 * 1000;
//         const dateInIST = new Date(dateInUTC.getTime() + istOffset);

//         const lastFetchedDate = store.LastFetchedDate ? dateInIST : null;

//         // console.log("lastfetchedDate", lastFetchedDate);
//         // Fetch emails from Inbox
//         const inboxEmails = await fetchEmailsFromFolder(
//           imap,
//           "INBOX",
//           lastFetchedDate
//         );

//         console.log("inbox", store.UserEmailId, inboxEmails);
//         // Fetch emails from Sent folder
//         // const sentEmails = await fetchEmailsFromFolder(
//         //   imap,
//         //   "SENT ITEMS",
//         //   lastFetchedDate
//         // );

//         // console.log("inbox", inboxEmails);
//         // console.log("sentBox", sentEmails);

//         // Process Inbox emails (check 'from' email)
//         for (const emailData of inboxEmails) {
//           console.log("in save data");
//           const customer = await Customer.findOne({
//             where: {
//               EmailId: emailData.from,
//             },
//           });

//           // const subject = emailData.subject.split(":")[1];
//           // console.log("subject", subject);

//           if (customer) {
//             const existingTopic = await TopicMaster.findOne({
//               where: {
//                 CustomerId: customer.Id,
//                 EmailSubject: emailData.subject,
//               },
//             });

//             let topicId;

//             if (!existingTopic) {
//               const data = await TopicMaster.create({
//                 CustomerId: customer.Id,
//                 EmailSubject: emailData.subject,
//                 DateOfFirstEmail: inboxEmails[0].date,
//                 DateOfLastCommunication:
//                   inboxEmails[inboxEmails.length - 1].date,
//                 Status: "Open",
//               });

//               topicId = data.TopicId;
//             } else {
//               topicId = existingTopic.TopicId;
//             }

//             try {
//               await CustomerEmail.create({
//                 CustomerId: customer.Id,
//                 Subject: emailData.subject,
//                 Content: emailData.body,
//                 DateTime: emailData.date,
//                 EmailStatus: "received",
//                 TopicId: topicId,
//               });
//               console.log("email saved for", emailData.from);
//               logger.info(
//                 `Email saved for customer ID: ${customer.Id} from inbox.`
//               );
//             } catch (error) {
//               console.log("error", error);
//             }
//           } else {
//             logger.info(
//               `No matching customer found for inbox email in store ${store.SettingsId}:`,
//               emailData.from
//             );
//           }
//         }

//         // Process Sent emails (check 'to' email)
//         // for (const emailData of sentEmails) {
//         //   const customer = await Customer.findOne({
//         //     where: {
//         //       EmailId: emailData.to,
//         //     },
//         //   });

//         //   if (customer) {
//         //     await CustomerEmail.create({
//         //       CustomerId: customer.Id,
//         //       Subject: emailData.subject,
//         //       Content: emailData.body,
//         //       DateTime: emailData.date,
//         //       EmailStatus: "sent",
//         //     });

//         //     logger.info(
//         //       `Email saved for customer ID: ${customer.Id} from sent emails.`
//         //     );
//         //   } else {
//         //     logger.info(
//         //       `No matching customer found for sent email in store ${store.SettingsId}:`,
//         //       emailData.to
//         //     );
//         //   }
//         // }

//         // Update LastFetchedDate to the current date
//         store.LastFetchedDate = new Date();
//         await store.save();

//         imap.end();
//         resolve();
//       } catch (error) {
//         console.log("error:", error);
//         logger.error(
//           `Error processing emails for store ${store.SettingsId}:`,
//           error
//         );
//         imap.end();
//         reject(error);
//       }
//     });

//     imap.once("error", (err) => {
//       logger.error(`IMAP Error for store ${store.SettingsId}:`, err);
//       reject(err);
//     });

//     imap.once("end", () => {
//       logger.info(`Connection ended for store ${store.SettingsId}`);
//     });

//     imap.connect();
//   });
// };

// const getEmails = async () => {
//   try {
//     const settings = await StoreSettings.findAll();

//     for (const setting of settings) {
//       try {
//         // console.log("setting:", setting);
//         await processStoreEmails(setting);
//       } catch (error) {
//         logger.error(
//           `Failed to process emails for store ${setting.SettingsId}:`,
//           error
//         );
//       }
//     }
//   } catch (ex) {
//     // console.log("ex",ex)
//     logger.error("An error occurred while fetching stores:", ex);
//   }
// };

// getEmails();

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
       console.log("fetchedDates",store.lastFetchedDate , lastFetchedDate)
        const inboxEmails = await fetchEmailsFromFolder(
          imap,
          "INBOX",
          lastFetchedDate
        );

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

            let topicId = existingTopic
              ? existingTopic.TopicId
              : (
                  await TopicMaster.create({
                    CustomerId: customer.Id,
                    EmailSubject: emailData.subject,
                    DateOfFirstEmail: inboxEmails[0].date,
                    DateOfLastCommunication:
                      inboxEmails[inboxEmails.length - 1].date,
                    Status: "Open",
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
