import axios from "axios";
import { config } from "dotenv";
config();


const dummyData = {
  "customers": [
    {
      "Id": 1,
      "name": "John Doe",
      "totalSpent": 250.75,
      "emailid": "mailto:johndoe@example.com",
      "phone": "3333333",
      "emailStatus": "Subscribed", 
      "firstSeen": "2012-04-23T18:25:43.511Z", 
      "signedUp": "2012-04-23T18:25:43.511Z", 
      "firstContacted": "2012-04-23T18:25:43.511Z", 
      "firstOrderPlaced": "2012-04-23T18:25:43.511Z", 
      "lastOrderPlaced": "2012-04-23T18:25:43.511Z", 
      "totalOrderValue": 2500, 
      "totalOrderQuantity": 20,
      "orderSummaries": [
        {
          "orderDate": "2012-04-23T18:25:43.511Z",
          "orderId": "#101",
          "orderStatus": "Completed"
        },
        {
          "orderDate": "2012-04-23T18:25:43.511Z",
          "orderId": "#101",
          "orderStatus": "Completed"
        }
      ]
    },
    {
      "Id": 2,
      "name": "Jane Doe",
      "totalSpent": 2500.75,
      "emailid": "mailto:janedoe@example.com",
      "phone": "659898",
      "emailStatus": "Subscribed", 
      "firstSeen": "2013-04-23T18:25:43.511Z", 
      "signedUp": "2013-04-23T18:25:43.511Z", 
      "firstContacted": "2013-04-23T18:25:43.511Z", 
      "firstOrderPlaced": "2013-04-23T18:25:43.511Z", 
      "lastOrderPlaced": "2013-04-23T18:25:43.511Z", 
      "totalOrderValue": 3500, 
      "totalOrderQuantity": 50,
      "orderSummaries": [
        {
          "orderDate": "2013-04-23T18:25:43.511Z",
          "orderId": "#103",
          "orderStatus": "Completed"
        },
        {
          "orderDate": "2013-04-23T18:25:43.511Z",
          "orderId": "#104",
          "orderStatus": "Completed"
        }
      ]
    },
    {
      "Id": 3,
      "name": "John Martin",
      "totalSpent": 2770.75,
      "emailid": "mailto:john@example.com",
      "phone": "6598556",
      "emailStatus": "Subscribed", 
      "firstSeen": "2014-04-23T18:25:43.511Z", 
      "signedUp": "2014-04-23T18:25:43.511Z", 
      "firstContacted": "2014-04-23T18:25:43.511Z", 
      "firstOrderPlaced": "2014-04-23T18:25:43.511Z", 
      "lastOrderPlaced": "2014-04-23T18:25:43.511Z", 
      "totalOrderValue": 700, 
      "totalOrderQuantity": 5,
      "orderSummaries": [
        {
          "orderDate": "2014-04-23T18:25:43.511Z",
          "orderId": "#107",
          "orderStatus": "Completed"
        },
        {
          "orderDate": "2014-04-23T18:25:43.511Z",
          "orderId": "#108",
          "orderStatus": "Completed"
        }
      ]
    },
    {
      "Id": 4,
      "name": "William White",
      "totalSpent": 2300.75,
      "emailid": "mailto:will@example.com",
      "phone": "659885",
      "emailStatus": "Subscribed", 
      "firstSeen": "2015-04-23T18:25:43.511Z", 
      "signedUp": "2015-04-23T18:25:43.511Z", 
      "firstContacted": "2015-04-23T18:25:43.511Z", 
      "firstOrderPlaced": "2015-04-23T18:25:43.511Z", 
      "lastOrderPlaced": "2015-04-23T18:25:43.511Z", 
      "totalOrderValue": 3700, 
      "totalOrderQuantity": 8,
      "orderSummaries": [
        {
          "orderDate": "2015-04-23T18:25:43.511Z",
          "orderId": "#109",
          "orderStatus": "Completed"
        },
        {
          "orderDate": "2015-04-23T18:25:43.511Z",
          "orderId": "#110",
          "orderStatus": "Completed"
        }
      ]
    },
    {
      "Id": 5,
      "name": "Jack Leach",
      "totalSpent": 2800.75,
      "emailid": "mailto:janedoe@example.com",
      "phone": "659898",
      "emailStatus": "Subscribed", 
      "firstSeen": "2016-04-23T18:25:43.511Z", 
      "signedUp": "2016-04-23T18:25:43.511Z", 
      "firstContacted": "2016-04-23T18:25:43.511Z", 
      "firstOrderPlaced": "2016-04-23T18:25:43.511Z", 
      "lastOrderPlaced": "2016-04-23T18:25:43.511Z", 
      "totalOrderValue": 4500, 
      "totalOrderQuantity": 35,
      "orderSummaries": [
        {
          "orderDate": "2016-04-23T18:25:43.511Z",
          "orderId": "#111",
          "orderStatus": "Completed"
        },
        {
          "orderDate": "2016-04-23T18:25:43.511Z",
          "orderId": "#112",
          "orderStatus": "Completed"
        }
      ]
    }
  ]
}


export const getCustomersData = async (req, res) => {

  try {
    return res
      .status(200)
      .send({ message: "request success", data: dummyData });
  } catch (error) {
    return res.status(500).send({
      message : "Internal server error"
    })
    
  }
};


// export const getCustomers = async (req, res) => {
//   const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/customers`;

//   try {
//     const response = await axios.get(url, {
//       headers: {
//         "X-Auth-Token": process.env.ACCESS_TOKEN,
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//     });

//     const customers = response.data.data;
//     console.log(customers);

//     return res
//       .status(200)
//       .send({ message: "request success", data: customers });
//   } catch (error) {
//     console.error(
//       `Error fetching customers: ${
//         error.response ? error.response.data : error.message
//       }`
//     );
//   }
// };
