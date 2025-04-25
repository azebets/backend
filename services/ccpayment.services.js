const crypto = require("crypto");
const { default: axios } = require("axios");
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
require("dotenv").config();

// CCPayment API Configuration
const appId = process.env.CCP_APP_ID;
const appSecret = process.env.CCP_APP_SECRET;
const merchantId = process.env.CCP_MERCHANT_ID;
const apiBaseUrl = process.env.CCP_API_BASE_URL || 'https://ccpayment.com/ccpayment/v2';
const webhookSecret = process.env.CCP_WEBHOOK_SECRET;

const getSignedText = (reqData, timestamp) => {
  try {
    const args = JSON.stringify(reqData);
    let signText = appId + timestamp;
    if (args.length !== 0) {
      signText += args;
    }

    const sign = crypto
      .createHmac("sha256", appSecret)
      .update(signText)
      .digest("hex");
    return sign
  } catch (error) {
    console.log('Error signing => ', error.message, appSecret, merchantId)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Can not sign');
  }

}

const getOrCreateAppDepositAddress = async (reqData = {}) => {
  const path = "https://ccpayment.com/ccpayment/v2/getOrCreateAppDepositAddress";
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = getSignedText(reqData, timestamp)
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Appid": appId,
      "Sign": sign,
      "Timestamp": timestamp.toString(),
    },
  };
  try {
    const res = await axios.post(path, reqData, options).then(res => res.data)
    return res
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Can not get ccpayment data');
  }
}

const getDepositRecord = async (reqData = {}) => {
  const path = "https://ccpayment.com/ccpayment/v2/getAppDepositRecord";
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = getSignedText(reqData, timestamp)
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Appid": appId,
      "Sign": sign,
      "Timestamp": timestamp.toString(),
    },
  };
  try {
    const res = await axios.post(path, reqData, options).then(res => res.data)
    return res
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Can not get ccpayment data');
  }
}


/**
 * Create a deposit order with CCPayment
 * @param {Object} data - Deposit order data
 * @param {string} data.userId - User ID
 * @param {number} data.amount - Amount to deposit
 * @param {string} data.currency - Currency code
 * @param {string} data.returnUrl - Return URL after payment
 * @returns {Promise<Object>} - Deposit order details
 */
const createDepositOrder = async (data) => {
  const { userId, amount, currency, returnUrl } = data;

  const reqData = {
    "merchantId": merchantId,
    "merchantOrderId": userId + String(Math.floor(Date.now() / 1000)),
    "amount": amount.toString(),
    "coinCode": currency,
    "returnUrl": returnUrl,
    "notifyUrl": `${process.env.APP_URL || 'http://localhost:8000'}/api/payment/ccpayment/webhook`
  };

  const path = `${apiBaseUrl}/createOrder`;
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = getSignedText(reqData, timestamp);

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Appid": appId,
      "Sign": sign,
      "Timestamp": timestamp.toString(),
    },
  };

  try {
    const response = await axios.post(path, reqData, options);
    return response.data;
  } catch (error) {
    console.error('CCPayment createDepositOrder error:', error.response?.data || error.message);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create deposit order');
  }
};

/**
 * Get deposit order status from CCPayment
 * @param {string} orderId - CCPayment order ID
 * @returns {Promise<Object>} - Order status details
 */
const getDepositOrderStatus = async (orderId) => {
  const reqData = {
    "orderId": orderId
  };

  const path = `${apiBaseUrl}/getOrderInfo`;
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = getSignedText(reqData, timestamp);

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Appid": appId,
      "Sign": sign,
      "Timestamp": timestamp.toString(),
    },
  };

  try {
    const response = await axios.post(path, reqData, options);
    return response.data;
  } catch (error) {
    console.error('CCPayment getDepositOrderStatus error:', error.response?.data || error.message);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to get deposit order status');
  }
};

/**
 * Create a withdrawal request with CCPayment
 * @param {Object} data - Withdrawal request data
 * @param {string} data.userId - User ID
 * @param {number} data.amount - Amount to withdraw
 * @param {string} data.currency - Currency code
 * @param {string} data.address - Destination wallet address
 * @param {number} data.networkFee - Network fee amount
 * @returns {Promise<Object>} - Withdrawal request details
 */
const createWithdrawalRequest = async (data) => {
  const { userId, amount, currency, address, networkFee } = data;

  const reqData = {
    "merchantId": merchantId,
    "merchantOrderId": userId + String(Math.floor(Date.now() / 1000)),
    "amount": amount.toString(),
    "coinCode": currency,
    "address": address,
    "networkFee": networkFee.toString(),
    "notifyUrl": `${process.env.APP_URL || 'http://localhost:8000'}/api/payment/ccpayment/webhook`
  };

  const path = `${apiBaseUrl}/withdraw`;
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = getSignedText(reqData, timestamp);

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Appid": appId,
      "Sign": sign,
      "Timestamp": timestamp.toString(),
    },
  };

  try {
    const response = await axios.post(path, reqData, options);
    return response.data;
  } catch (error) {
    console.error('CCPayment createWithdrawalRequest error:', error.response?.data || error.message);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create withdrawal request');
  }
};

/**
 * Get withdrawal status from CCPayment
 * @param {string} withdrawalId - CCPayment withdrawal ID
 * @returns {Promise<Object>} - Withdrawal status details
 */
const getWithdrawalStatus = async (withdrawalId) => {
  const reqData = {
    "withdrawId": withdrawalId
  };

  const path = `${apiBaseUrl}/getWithdrawInfo`;
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = getSignedText(reqData, timestamp);

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Appid": appId,
      "Sign": sign,
      "Timestamp": timestamp.toString(),
    },
  };

  try {
    const response = await axios.post(path, reqData, options);
    return response.data;
  } catch (error) {
    console.error('CCPayment getWithdrawalStatus error:', error.response?.data || error.message);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to get withdrawal status');
  }
};

/**
 * Get supported currencies from CCPayment
 * @returns {Promise<Object>} - List of supported currencies
 */
const getSupportedCurrencies = async () => {
  const reqData = {};

  const path = `${apiBaseUrl}/getSupportedCurrencies`;
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = getSignedText(reqData, timestamp);

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Appid": appId,
      "Sign": sign,
      "Timestamp": timestamp.toString(),
    },
  };

  try {
    const response = await axios.post(path, reqData, options);
    return response.data;
  } catch (error) {
    console.error('CCPayment getSupportedCurrencies error:', error.response?.data || error.message);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to get supported currencies');
  }
};

/**
 * Get exchange rates from CCPayment
 * @param {string} currency - Base currency code
 * @returns {Promise<Object>} - Exchange rates
 */
const getExchangeRates = async (currency) => {
  const reqData = {
    "coinCode": currency
  };

  const path = `${apiBaseUrl}/getExchangeRates`;
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = getSignedText(reqData, timestamp);

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Appid": appId,
      "Sign": sign,
      "Timestamp": timestamp.toString(),
    },
  };

  try {
    const response = await axios.post(path, reqData, options);
    return response.data;
  } catch (error) {
    console.error('CCPayment getExchangeRates error:', error.response?.data || error.message);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to get exchange rates');
  }
};

/**
 * Convert amount between currencies
 * @param {Object} data - Conversion data
 * @param {string} data.fromCurrency - Source currency code
 * @param {string} data.toCurrency - Target currency code
 * @param {number} data.amount - Amount to convert
 * @returns {Promise<Object>} - Converted amount
 */
const convertAmount = async (data) => {
  const { fromCurrency, toCurrency, amount } = data;

  const reqData = {
    "fromCoinCode": fromCurrency,
    "toCoinCode": toCurrency,
    "amount": amount.toString()
  };

  const path = `${apiBaseUrl}/convertAmount`;
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = getSignedText(reqData, timestamp);

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Appid": appId,
      "Sign": sign,
      "Timestamp": timestamp.toString(),
    },
  };

  try {
    const response = await axios.post(path, reqData, options);
    return response.data;
  } catch (error) {
    console.error('CCPayment convertAmount error:', error.response?.data || error.message);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to convert amount');
  }
};

/**
 * Verify webhook signature from CCPayment
 * @param {Object} payload - Webhook payload
 * @param {string} signature - Webhook signature
 * @returns {boolean} - Whether the signature is valid
 */
const verifyWebhookSignature = (payload, signature) => {
  try {
    const calculatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return calculatedSignature === signature;
  } catch (error) {
    console.error('CCPayment verifyWebhookSignature error:', error);
    return false;
  }
};

module.exports = {
  getOrCreateAppDepositAddress,
  getDepositRecord,
  createDepositOrder,
  getDepositOrderStatus,
  createWithdrawalRequest,
  getWithdrawalStatus,
  getSupportedCurrencies,
  getExchangeRates,
  convertAmount,
  verifyWebhookSignature
}