const httpStatus = require("http-status");
const ccpaymentService = require("../services/ccpayment.services");
const walletUpdateService = require("../services/wallet-update.services");
const CCPaymentDeposit = require("../model/ccpayment-deposit");
const CCPaymentWithdrawal = require("../model/ccpayment-withdrawal");
const catchAsync = require("../utils/catchAsync");

// Original methods
const getPermanentDepositAddress = catchAsync(async (req, res) => {
    const { body: reqBody, reqId } = req;
    const reqData = {
        "referenceId": reqId + String(Math.floor(Date.now() / 1000)),
        "chain": reqBody.chain,
    }
    try {
        const pda = await ccpaymentService.getOrCreateAppDepositAddress(reqData)
        res.send(pda)
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
            "message": "Internal Server Error",
        })
    }
});

const getDepositRecord = catchAsync(async (req, res) => {
    const { body: reqBody } = req;
    try {
        const record = await ccpaymentService.getDepositRecord(reqBody)
        res.send(record)
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
            "message": "Internal Server Error",
        })
    }
});

// Deposit Endpoints
const createDepositOrder = catchAsync(async (req, res) => {
    const { userId, amount, currency, returnUrl } = req.body;
    const user_id = req.id;

    if (!amount || !currency || !returnUrl) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Missing required parameters"
        });
    }

    try {
        // Create deposit order with CCPayment
        const ccpResponse = await ccpaymentService.createDepositOrder({
            userId: user_id,
            amount,
            currency,
            returnUrl
        });

        if (!ccpResponse.success) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: ccpResponse.message || "Failed to create deposit order"
            });
        }

        // Save deposit order to database
        const depositOrder = await CCPaymentDeposit.create({
            user_id,
            orderId: ccpResponse.data.orderId,
            amount,
            amountUSD: ccpResponse.data.amountUSD || amount, // Fallback if USD amount not provided
            currency,
            status: 'pending',
            paymentUrl: ccpResponse.data.paymentUrl,
            metadata: ccpResponse.data
        });

        return res.status(httpStatus.CREATED).json({
            success: true,
            orderId: depositOrder.orderId,
            paymentUrl: depositOrder.paymentUrl,
            status: depositOrder.status
        });
    } catch (error) {
        console.error('Create deposit order error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

const getDepositOrderStatus = catchAsync(async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Order ID is required"
        });
    }

    try {
        // Get deposit order from database
        const depositOrder = await CCPaymentDeposit.findOne({ orderId });

        if (!depositOrder) {
            return res.status(httpStatus.NOT_FOUND).json({
                success: false,
                message: "Deposit order not found"
            });
        }

        // If order is already completed or failed, return the status
        if (depositOrder.status !== 'pending') {
            return res.status(httpStatus.OK).json({
                success: true,
                status: depositOrder.status,
                walletUpdate: depositOrder.status === 'completed' ? {
                    userId: depositOrder.user_id,
                    currency: depositOrder.currency,
                    amount: depositOrder.amount
                } : null
            });
        }

        // Check status with CCPayment
        const ccpResponse = await ccpaymentService.getDepositOrderStatus(orderId);

        if (!ccpResponse.success) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: ccpResponse.message || "Failed to get deposit order status"
            });
        }

        // Update status in database if changed
        if (ccpResponse.data.status !== depositOrder.status) {
            depositOrder.status = ccpResponse.data.status === 'completed' ? 'completed' :
                                  ccpResponse.data.status === 'failed' ? 'failed' : 'pending';

            if (depositOrder.status === 'completed') {
                depositOrder.completedAt = new Date();
            }

            await depositOrder.save();
        }

        return res.status(httpStatus.OK).json({
            success: true,
            status: depositOrder.status,
            walletUpdate: depositOrder.status === 'completed' ? {
                userId: depositOrder.user_id,
                currency: depositOrder.currency,
                amount: depositOrder.amount
            } : null
        });
    } catch (error) {
        console.error('Get deposit order status error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

const getDepositHistory = catchAsync(async (req, res) => {
    const user_id = req.id;
    const { currency, page = 1, limit = 10 } = req.query;

    try {
        // Build query
        const query = { user_id };
        if (currency) {
            query.currency = currency;
        }

        // Get total count for pagination
        const total = await CCPaymentDeposit.countDocuments(query);

        // Get deposits with pagination
        const deposits = await CCPaymentDeposit.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return res.status(httpStatus.OK).json({
            success: true,
            data: deposits,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get deposit history error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

// Withdrawal Endpoints
const createWithdrawalRequest = catchAsync(async (req, res) => {
    const { amount, amountUSD, currency, address, networkFee } = req.body;
    const user_id = req.id;

    if (!amount || !currency || !address || networkFee === undefined) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Missing required parameters"
        });
    }

    try {
        // Check if user has sufficient balance
        // For simplicity, we're assuming the currency is USD here
        // You may need to adjust this based on your wallet structure
        const walletCurrency = currency === 'USDT' ? 'USD' : currency;

        // Subtract funds from wallet
        try {
            await walletUpdateService.updateWalletBalance({
                userId: user_id,
                currency: walletCurrency,
                amount,
                operation: 'subtract',
                transactionType: 'Withdrawal'
            });
        } catch (error) {
            if (error.statusCode === httpStatus.BAD_REQUEST) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    success: false,
                    message: error.message || "Insufficient balance"
                });
            }
            throw error;
        }

        // Create withdrawal request with CCPayment
        const ccpResponse = await ccpaymentService.createWithdrawalRequest({
            userId: user_id,
            amount,
            currency,
            address,
            networkFee
        });

        if (!ccpResponse.success) {
            // Refund the amount if withdrawal request fails
            await walletUpdateService.updateWalletBalance({
                userId: user_id,
                currency: walletCurrency,
                amount,
                operation: 'add',
                transactionType: 'Withdrawal Refund'
            });

            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: ccpResponse.message || "Failed to create withdrawal request"
            });
        }

        // Save withdrawal request to database
        const withdrawalRequest = await CCPaymentWithdrawal.create({
            user_id,
            withdrawalId: ccpResponse.data.withdrawalId,
            amount,
            amountUSD: amountUSD || amount, // Fallback if USD amount not provided
            currency,
            address,
            networkFee,
            status: 'pending',
            metadata: ccpResponse.data
        });

        return res.status(httpStatus.CREATED).json({
            success: true,
            withdrawalId: withdrawalRequest.withdrawalId,
            status: withdrawalRequest.status
        });
    } catch (error) {
        console.error('Create withdrawal request error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

const getWithdrawalStatus = catchAsync(async (req, res) => {
    const { withdrawalId } = req.params;

    if (!withdrawalId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Withdrawal ID is required"
        });
    }

    try {
        // Get withdrawal request from database
        const withdrawalRequest = await CCPaymentWithdrawal.findOne({ withdrawalId });

        if (!withdrawalRequest) {
            return res.status(httpStatus.NOT_FOUND).json({
                success: false,
                message: "Withdrawal request not found"
            });
        }

        // If request is already completed or failed, return the status
        if (withdrawalRequest.status !== 'pending' && withdrawalRequest.status !== 'processing') {
            return res.status(httpStatus.OK).json({
                success: true,
                status: withdrawalRequest.status
            });
        }

        // Check status with CCPayment
        const ccpResponse = await ccpaymentService.getWithdrawalStatus(withdrawalId);

        if (!ccpResponse.success) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: ccpResponse.message || "Failed to get withdrawal status"
            });
        }

        // Update status in database if changed
        if (ccpResponse.data.status !== withdrawalRequest.status) {
            withdrawalRequest.status = ccpResponse.data.status === 'completed' ? 'completed' :
                                      ccpResponse.data.status === 'processing' ? 'processing' :
                                      ccpResponse.data.status === 'failed' ? 'failed' : 'pending';

            if (withdrawalRequest.status === 'completed') {
                withdrawalRequest.completedAt = new Date();
            }

            await withdrawalRequest.save();
        }

        return res.status(httpStatus.OK).json({
            success: true,
            status: withdrawalRequest.status
        });
    } catch (error) {
        console.error('Get withdrawal status error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

const getWithdrawalHistory = catchAsync(async (req, res) => {
    const user_id = req.id;
    const { currency, page = 1, limit = 10 } = req.query;

    try {
        // Build query
        const query = { user_id };
        if (currency) {
            query.currency = currency;
        }

        // Get total count for pagination
        const total = await CCPaymentWithdrawal.countDocuments(query);

        // Get withdrawals with pagination
        const withdrawals = await CCPaymentWithdrawal.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return res.status(httpStatus.OK).json({
            success: true,
            data: withdrawals,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get withdrawal history error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

// Utility Endpoints
const getSupportedCurrencies = catchAsync(async (req, res) => {
    try {
        const ccpResponse = await ccpaymentService.getSupportedCurrencies();

        if (!ccpResponse.success) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: ccpResponse.message || "Failed to get supported currencies"
            });
        }

        return res.status(httpStatus.OK).json({
            success: true,
            data: ccpResponse.data
        });
    } catch (error) {
        console.error('Get supported currencies error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

const getExchangeRates = catchAsync(async (req, res) => {
    const { currency } = req.query;

    if (!currency) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Currency is required"
        });
    }

    try {
        const ccpResponse = await ccpaymentService.getExchangeRates(currency);

        if (!ccpResponse.success) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: ccpResponse.message || "Failed to get exchange rates"
            });
        }

        return res.status(httpStatus.OK).json({
            success: true,
            data: ccpResponse.data
        });
    } catch (error) {
        console.error('Get exchange rates error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

const convertAmount = catchAsync(async (req, res) => {
    const { fromCurrency, toCurrency, amount } = req.query;

    if (!fromCurrency || !toCurrency || !amount) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "fromCurrency, toCurrency, and amount are required"
        });
    }

    try {
        const ccpResponse = await ccpaymentService.convertAmount({
            fromCurrency,
            toCurrency,
            amount: parseFloat(amount)
        });

        if (!ccpResponse.success) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: ccpResponse.message || "Failed to convert amount"
            });
        }

        return res.status(httpStatus.OK).json({
            success: true,
            data: ccpResponse.data
        });
    } catch (error) {
        console.error('Convert amount error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

// Webhook Handler
const handleWebhook = catchAsync(async (req, res) => {
    const payload = req.body;
    const signature = req.headers['x-ccpayment-signature'];

    if (!signature) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Missing signature header"
        });
    }

    try {
        // Verify webhook signature
        const isValid = ccpaymentService.verifyWebhookSignature(payload, signature);

        if (!isValid) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Invalid signature"
            });
        }

        // Process webhook based on event type
        const eventType = payload.eventType;

        if (eventType === 'deposit.completed') {
            // Handle deposit completion
            const orderId = payload.orderId;
            const depositOrder = await CCPaymentDeposit.findOne({ orderId });

            if (depositOrder && depositOrder.status !== 'completed') {
                // Update deposit status
                depositOrder.status = 'completed';
                depositOrder.completedAt = new Date();
                depositOrder.metadata = { ...depositOrder.metadata, webhook: payload };
                await depositOrder.save();

                // Update user wallet balance
                const walletCurrency = depositOrder.currency === 'USDT' ? 'USD' : depositOrder.currency;
                await walletUpdateService.updateWalletBalance({
                    userId: depositOrder.user_id,
                    currency: walletCurrency,
                    amount: depositOrder.amount,
                    operation: 'add',
                    transactionType: 'Deposit'
                });
            }
        } else if (eventType === 'deposit.failed') {
            // Handle deposit failure
            const orderId = payload.orderId;
            const depositOrder = await CCPaymentDeposit.findOne({ orderId });

            if (depositOrder && depositOrder.status !== 'failed') {
                depositOrder.status = 'failed';
                depositOrder.metadata = { ...depositOrder.metadata, webhook: payload };
                await depositOrder.save();
            }
        } else if (eventType === 'withdrawal.status_update') {
            // Handle withdrawal status update
            const withdrawalId = payload.withdrawalId;
            const status = payload.status;
            const withdrawalRequest = await CCPaymentWithdrawal.findOne({ withdrawalId });

            if (withdrawalRequest) {
                withdrawalRequest.status = status === 'completed' ? 'completed' :
                                         status === 'processing' ? 'processing' :
                                         status === 'failed' ? 'failed' : 'pending';

                if (withdrawalRequest.status === 'completed') {
                    withdrawalRequest.completedAt = new Date();
                } else if (withdrawalRequest.status === 'failed' && withdrawalRequest.status !== 'failed') {
                    // Refund the amount if withdrawal fails
                    const walletCurrency = withdrawalRequest.currency === 'USDT' ? 'USD' : withdrawalRequest.currency;
                    await walletUpdateService.updateWalletBalance({
                        userId: withdrawalRequest.user_id,
                        currency: walletCurrency,
                        amount: withdrawalRequest.amount,
                        operation: 'add',
                        transactionType: 'Withdrawal Refund'
                    });
                }

                withdrawalRequest.metadata = { ...withdrawalRequest.metadata, webhook: payload };
                await withdrawalRequest.save();
            }
        }

        return res.status(httpStatus.OK).json({
            success: true,
            message: "Webhook processed successfully"
        });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

module.exports = {
    // Original methods
    getPermanentDepositAddress,
    getDepositRecord,

    // Deposit endpoints
    createDepositOrder,
    getDepositOrderStatus,
    getDepositHistory,

    // Withdrawal endpoints
    createWithdrawalRequest,
    getWithdrawalStatus,
    getWithdrawalHistory,

    // Utility endpoints
    getSupportedCurrencies,
    getExchangeRates,
    convertAmount,

    // Webhook handler
    handleWebhook
}