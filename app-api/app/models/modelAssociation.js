import Customer from "./customer.js";
import CustomerEmail from "./customerEmail.js";
import Store from "./store.js";
import StoreSettings from "./storeSettings.js";

const db = {};

db.Customer = Customer;
db.CustomerEmail = CustomerEmail;
db.Store = Store;
db.StoreSettings = StoreSettings;

db.CustomerEmail.belongsTo(db.Customer, { foreignKey: "CustomerId" });
db.Customer.hasMany(db.CustomerEmail, { foreignKey: "CustomerId" });


export default db;
