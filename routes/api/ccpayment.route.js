const express = require('express');
const router = express.Router();

const ccpaymentController = require('../../controllers/ccpayment.controllers');
const requireAuth = require('../../middleware/requireAuth');

// Webhook endpoint - no auth required
router.post('/webhook', ccpaymentController.handleWebhook);

// Auth middleware for all other routes
router.use(requireAuth);

// Original endpoints
router.post('/get-permanent-deposit-address', ccpaymentController.getPermanentDepositAddress);
router.post('/get-deposit-record', ccpaymentController.getDepositRecord);

// Deposit endpoints
router.post('/deposit', ccpaymentController.createDepositOrder);
router.get('/deposit/status/:orderId', ccpaymentController.getDepositOrderStatus);
router.get('/deposit/history', ccpaymentController.getDepositHistory);

// Withdrawal endpoints
router.post('/withdraw', ccpaymentController.createWithdrawalRequest);
router.get('/withdraw/status/:withdrawalId', ccpaymentController.getWithdrawalStatus);
router.get('/withdraw/history', ccpaymentController.getWithdrawalHistory);

// Utility endpoints
router.get('/currencies', ccpaymentController.getSupportedCurrencies);
router.get('/rates', ccpaymentController.getExchangeRates);
router.get('/convert', ccpaymentController.convertAmount);

module.exports = router;