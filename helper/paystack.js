const axios = require("axios");

const initializePayment = async (form) => {
  const options = {
    url: 'https://api.paystack.co/transaction/initialize',
    headers: {
      authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'content-type': 'application/json',
      'cache-control': 'no-cache',
    },
    method: 'POST',
    data: form,
  };
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.request(options);
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * @param {String} trxref The reference String to verify the transaction. It will be gotten after successfully
 * initializing a transaction.
 */

const verifyPayment = async (ref) => {
  const options = {
    url:
      'https://api.paystack.co/transaction/verify/' + encodeURIComponent(ref),
    headers: {
      authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'content-type': 'application/json',
      'cache-control': 'no-cache',
    },
    method: 'GET',
  };
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.request(options);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  initializePayment,
  verifyPayment
}