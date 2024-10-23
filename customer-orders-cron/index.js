import axios from "axios";
import sequelize from "./models/index.js";
import Store from "./models/store.js";
import Customer from "./models/customer.js";
import logger from "./lib/logger.js";

export const saveCustomers = async () => {
  try {
    const stores = await Store.findAll({});
    const allResults = [];

    // Loop through each store
    for (const store of stores) {
      let customers = [];

      try {
        const customersUrl = `https://api.bigcommerce.com/stores/${store.StoreHash}/v3/customers`;
        const customersResponse = await axios.get(customersUrl, {
          headers: {
            "X-Auth-Token": store.AccessToken,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        customers = customersResponse.data.data;
      } catch (error) {
        logger.error(
          `Error fetching customers for store ${store.StoreHash}: ${error.message}`
        );
        continue; // Skip to the next store
      }

      // Loop through each customer
      const customerPromises = customers.map(async (customerData) => {
        let orders = [];

        try {
          const ordersResponse = await axios.get(
            `https://api.bigcommerce.com/stores/${store.StoreHash}/v2/orders?customer_id=${customerData.id}`,
            {
              headers: {
                "X-Auth-Token": store.AccessToken,
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            }
          );

          orders = ordersResponse.data;
          console.log("orders", orders);
        } catch (error) {
          logger.error(
            `Error fetching orders for customer ${customerData.id} in store ${store.StoreHash}: ${error.message}`
          );
          orders = [];
        }

        const totalOrders = orders.length > 0 ? orders.length : null;

        const totalOrderValue =
          orders.length > 0
            ? orders.reduce(
                (acc, order) => Number(acc) + Number(order.subtotal_inc_tax),
                0
              )
            : null;
        const totalOrderquantity =
          orders.length > 0
            ? orders.reduce((acc, order) => acc + order.items_total, 0)
            : null;

        const firstOrderDate =
          totalOrders > 0
            ? new Date(
                Math.min(...orders.map((order) => new Date(order.date_created)))
              )
            : null;
        const lastOrderDate =
          totalOrders > 0
            ? new Date(
                Math.max(...orders.map((order) => new Date(order.date_created)))
              )
            : null;

        console.log(
          totalOrders,
          totalOrderquantity,
          firstOrderDate,
          lastOrderDate
        );

        // Attempt to find or create the customer
        const [customer, created] = await Customer.findOrCreate({
          where: { CustomerId: customerData.id },
          defaults: {
            CustomerId: customerData.id,
            FirstName: customerData.first_name,
            LastName: customerData.last_name,
            Phone: customerData.phone,
            EmailId: customerData.email,
            Company: customerData.company || null,
            FirstSeenDate: customerData.date_created,
            TotalOrderPlaced: totalOrders,
            TotalOrderValue: totalOrderValue,
            FirstOrderPlaced: firstOrderDate,
            LastOrderPlaced: lastOrderDate,
            TotalOrderQuantity: totalOrderquantity,
            StoreId: store.StoreId,
          },
        });

        if (!created) {
          let updated = false;

          if (
            customer.TotalOrderPlaced !== totalOrders ||
            customer.TotalOrderValue !== totalOrderValue ||
            customer.FirstOrderPlaced !== firstOrderDate ||
            customer.LastOrderPlaced !== lastOrderDate
          ) {
            await customer.update({
              TotalOrderPlaced: totalOrders,
              TotalOrderValue: totalOrderValue,
              FirstOrderPlaced: firstOrderDate,
              LastOrderPlaced: lastOrderDate,
              TotalOrderQuantity: totalOrderquantity,
            });
            updated = true;
          }

          return {
            id: customer.CustomerId,
            created: false,
            updated,
          };
        }

        // Customer created successfully
        return {
          id: customer.CustomerId,
          created: true,
          updated: false,
        };
      });

      const storeResults = await Promise.all(customerPromises);
      allResults.push(...storeResults);
    }

    logger.info(allResults);
  } catch (error) {
    logger.error(error);
  }
};

saveCustomers();
