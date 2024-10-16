import axios from "axios";
import { config } from "dotenv";
import Store from "../models/store.js";
import Customer from "../models/customer.js";
import StoreSettings from "../models/storeSettings.js";
import CustomerEmail from "../models/customerEmail.js";

config();

export const getCustomers = async (req, res) => {
  try {
    const data = await Customer.findAll();

    if (data.length < 1) {
      res.status(200).send({ message: "No customer found" });
    }

    return res.status(200).send({ message: "request success", data: data });
  } catch (error) {
    return res.status(500).send({
      message: "Internal server error",
    });
  }
};

// export const saveCustomers = async (req, res) => {
//   const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/customers`;

//   try {
//     const response = await axios.get(url, {
//       headers: {
//         "X-Auth-Token": process.env.ACCESS_TOKEN,
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//     });

//     const data = response.data.data;

//     const promises = data.map(async (customerData) => {
//       const [customer, created] = await Customer.findOrCreate({
//         where: { CustomerId: customerData.id },
//         defaults: {
//           CustomerId: customerData.id,
//           FirstName: customerData.first_name,
//           LastName: customerData.last_name,
//           Phone: customerData.phone,
//           Email: customerData.email,
//           Company: customerData.company ? customerData.company : null,
//           DateCreated: customerData.date_created,
//           DateModified: customerData.date_modified,
//         },
//       });

//       return {
//         id: customer.id,
//         created: created,
//       };
//     });

//     const results = await Promise.all(promises);
//     console.log(results);

//     return res.status(200).send({ message: "request success", data: data });
//   } catch (error) {
//     console.error(
//       `Error fetching customers: ${
//         error.response ? error.response.data : error.message
//       }`
//     );
//   }
// };
