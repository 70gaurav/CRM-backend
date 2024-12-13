import axios from "axios";
import Store from "../models/store.js";
import Customer from "../models/customer.js";
import logger from "../lib/logger.js";

//get orders by customer id
export const getOrders = async (req, res) => {
  const { id } = req.params;

  const customerData = await Customer.findOne({ where: { Id: id } });

  if (!customerData) {
    return res
      .status(400)
      .send({ message: "No customer found with the given id" });
  }
  const storeId = customerData.StoreId;
  const customerId = customerData.CustomerId;

  const storeData = await Store.findOne({ where: { StoreId: storeId } });

  if (!storeData) {
    return res
      .status(400)
      .send({ message: "No store found with the given customer" });
  }

  const { StoreHash, AccessToken } = storeData;

  try {
    let url = `https://api.bigcommerce.com/stores/${StoreHash}/v2/orders?customer_id=${customerId}`;
    const response = await axios.get(url, {
      headers: {
        "X-Auth-Token": AccessToken,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = response.data;

    if (data.length > 0) {
      return res.status(200).send({
        message: "request success",
        data: { customerData: customerData, orderData: data },
      });
    }

    return res.status(200).send({ message: "No orders found" });
  } catch (error) {
    logger.error("error in function getOrders", error)
    return res.status(500).send({ message: "Internal server error" });
  }
};
