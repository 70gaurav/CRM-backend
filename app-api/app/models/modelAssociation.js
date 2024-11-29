import Customer from "./customer.js";
import CustomerEmail from "./customerEmail.js";
import Store from "./store.js";
import StoreSettings from "./storeSettings.js";
import Notes from "./notes.js";
import TopicMaster from "./topicMaster.js";

const db = {};

db.Customer = Customer;
db.CustomerEmail = CustomerEmail;
db.Store = Store;
db.StoreSettings = StoreSettings;
db.Notes = Notes;
db.TopicMaster = TopicMaster;

db.CustomerEmail.belongsTo(db.Customer, { foreignKey: "CustomerId" });
db.Customer.hasMany(db.CustomerEmail, { foreignKey: "CustomerId" });

db.Notes.belongsTo(db.CustomerEmail, { foreignKey: "CustomerEmailId" });
db.CustomerEmail.hasMany(db.Notes, { foreignKey: "CustomerEmailId" });

db.TopicMaster.belongsTo(db.Customer, { foreignKey: "CustomerId" });
db.Customer.hasMany(db.TopicMaster, { foreignKey: "CustomerId" });

db.CustomerEmail.belongsTo(db.TopicMaster, { foreignKey: "TopicId" });
db.TopicMaster.hasMany(db.CustomerEmail, { foreignKey: "TopicId" });

export default db;
