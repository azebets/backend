const httpStatus = require("http-status");
const ccpaymentService = require("../services/ccpayment.services");
const walletUpdateService = require("../services/wallet-update.services");
const CCPaymentDeposit = require("../model/ccpayment-deposit");
const CCPaymentWithdrawal = require("../model/ccpayment-withdrawal");
const CCPaymentPermanentAddress = require("../model/ccpayment-permanent-address");
const catchAsync = require("../utils/catchAsync");

// Permanent Deposit Address methods
const getPermanentDepositAddress = catchAsync(async (req, res) => {
    const { body: reqBody } = req;
    const user_id = req.id;

    // Default to Ethereum if chain is not specified
    if (!reqBody.chain) {
        reqBody.chain = 'ETH';
    }

    try {
        // Create a unique reference ID for this user and chain
        // This ensures the same user always gets the same address for a specific chain
        const referenceId = `user_${user_id}_chain_${reqBody.chain}`;

        // Check if we already have this address stored
        let permanentAddress = await CCPaymentPermanentAddress.findOne({
            user_id,
            chain: reqBody.chain
        });

        // If we have an address and it's not flagged as risky, return it
        if (permanentAddress && !permanentAddress.isFlagged) {
            return res.status(httpStatus.OK).json({
                success: true,
                data: {
                    address: permanentAddress.address,
                    memo: permanentAddress.memo,
                    chain: permanentAddress.chain
                }
            });
        }

        // If address is flagged or doesn't exist, get a new one from CCPayment
        const reqData = {
            "referenceId": referenceId,
            "chain": reqBody.chain,
        };

        const ccpResponse = await ccpaymentService.getOrCreateAppDepositAddress(reqData);

        if (!ccpResponse.success) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: ccpResponse.message || "Failed to get deposit address"
            });
        }

        // Save or update the permanent address in our database
        if (permanentAddress) {
            // Update existing record
            permanentAddress.address = ccpResponse.data.address;
            permanentAddress.memo = ccpResponse.data.memo || "";
            permanentAddress.isFlagged = false;
            permanentAddress.flaggedAt = null;
            permanentAddress.metadata = { ...permanentAddress.metadata, ccpResponse };
            await permanentAddress.save();
        } else {
            // Create new record
            permanentAddress = await CCPaymentPermanentAddress.create({
                user_id,
                referenceId,
                chain: reqBody.chain,
                address: ccpResponse.data.address,
                memo: ccpResponse.data.memo || "",
                metadata: { ccpResponse }
            });
        }

        return res.status(httpStatus.OK).json({
            success: true,
            data: {
                address: permanentAddress.address,
                memo: permanentAddress.memo,
                chain: permanentAddress.chain
            }
        });
    } catch (error) {
        console.error('Get permanent deposit address error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

const getDepositRecord = catchAsync(async (req, res) => {
    const { body: reqBody } = req;
    const user_id = req.id;

    if (!reqBody.recordId && !reqBody.txid) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Either recordId or txid is required"
        });
    }

    try {
        const ccpResponse = await ccpaymentService.getDepositRecord(reqBody);

        if (!ccpResponse.success) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: ccpResponse.message || "Failed to get deposit record"
            });
        }

        return res.status(httpStatus.OK).json({
            success: true,
            data: ccpResponse.data
        });
    } catch (error) {
        console.error('Get deposit record error:', error);
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

        if (eventType === 'deposit.completed' && payload.recordId) {
            // This is a permanent address deposit
            // Get the deposit details from CCPayment
            const depositDetails = await ccpaymentService.getDepositRecord({ recordId: payload.recordId });

            if (depositDetails.success) {
                const depositData = depositDetails.data;

                // Find the permanent address in our database
                const permanentAddress = await CCPaymentPermanentAddress.findOne({
                    address: depositData.toAddress
                });

                if (permanentAddress) {
                    // Create a deposit record
                    const depositRecord = await CCPaymentDeposit.create({
                        user_id: permanentAddress.user_id,
                        orderId: `perm_${payload.recordId}`, // Use a prefix to distinguish from regular orders
                        amount: parseFloat(depositData.paidAmount),
                        amountUSD: parseFloat(depositData.paidValue || depositData.paidAmount),
                        currency: depositData.coinSymbol,
                        status: 'completed',
                        paymentUrl: '', // No payment URL for permanent address deposits
                        completedAt: new Date(),
                        metadata: { permanentDeposit: true, depositData, webhook: payload }
                    });

                    // Update user wallet balance
                    const walletCurrency = depositData.coinSymbol === 'USDT' ? 'USD' : depositData.coinSymbol;
                    await walletUpdateService.updateWalletBalance({
                        userId: permanentAddress.user_id,
                        currency: walletCurrency,
                        amount: parseFloat(depositData.paidAmount),
                        operation: 'add',
                        transactionType: 'Permanent Deposit'
                    });
                }
            }
        } else if (eventType === 'address.flagged_as_risky') {
            // Handle risky address flagging
            const address = payload.address;
            const chain = payload.chain;

            // Find and update the permanent address in our database
            const permanentAddress = await CCPaymentPermanentAddress.findOne({ address });

            if (permanentAddress) {
                permanentAddress.isFlagged = true;
                permanentAddress.flaggedAt = new Date();
                permanentAddress.metadata = { ...permanentAddress.metadata, flaggedWebhook: payload };
                await permanentAddress.save();

                // You might want to notify the user that their address has been flagged
                // and they should get a new one
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

// Get permanent deposit addresses for a user
const getUserPermanentAddresses = catchAsync(async (req, res) => {
    const user_id = req.id;
    const { chain } = req.query;

    try {
        // Build query
        const query = { user_id };
        if (chain) {
            query.chain = chain;
        }

        // Get permanent addresses
        const addresses = await CCPaymentPermanentAddress.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return res.status(httpStatus.OK).json({
            success: true,
            data: addresses.map(addr => ({
                chain: addr.chain,
                address: addr.address,
                memo: addr.memo,
                isFlagged: addr.isFlagged,
                createdAt: addr.createdAt
            }))
        });
    } catch (error) {
        console.error('Get user permanent addresses error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

// Unbind a flagged deposit address
const unbindDepositAddress = catchAsync(async (req, res) => {
    const user_id = req.id;
    const { address } = req.body;
    let { chain } = req.body;

    // Default to Ethereum if chain is not specified
    if (!chain) {
        chain = 'ETH';
    }

    if (!address) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Address is required"
        });
    }

    try {
        // Check if the address belongs to the user
        const permanentAddress = await CCPaymentPermanentAddress.findOne({
            user_id,
            address
        });

        if (!permanentAddress) {
            return res.status(httpStatus.NOT_FOUND).json({
                success: false,
                message: "Address not found or does not belong to you"
            });
        }

        // Call CCPayment to unbind the address
        const ccpResponse = await ccpaymentService.unbindAddress({
            chain,
            address
        });

        if (!ccpResponse.success) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: ccpResponse.message || "Failed to unbind address"
            });
        }

        // Update the address in our database
        await CCPaymentPermanentAddress.deleteOne({ _id: permanentAddress._id });

        return res.status(httpStatus.OK).json({
            success: true,
            message: "Address unbound successfully",
            data: ccpResponse.data
        });
    } catch (error) {
        console.error('Unbind deposit address error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

// Get permanent deposit history for a user
const getPermanentDepositHistory = catchAsync(async (req, res) => {
    const user_id = req.id;
    const { currency, page = 1, limit = 10 } = req.query;

    try {
        // First, get all permanent addresses for this user
        const permanentAddresses = await CCPaymentPermanentAddress.find({ user_id }).lean();
        const addressList = permanentAddresses.map(addr => addr.address);

        if (addressList.length === 0) {
            // No permanent addresses, return empty result
            return res.status(httpStatus.OK).json({
                success: true,
                data: [],
                pagination: {
                    total: 0,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: 0
                }
            });
        }

        // Build query for local deposits
        const localQuery = {
            user_id,
            'metadata.permanentDeposit': true
        };

        if (currency) {
            localQuery.currency = currency;
        }

        // Get local deposits with pagination
        const localDeposits = await CCPaymentDeposit.find(localQuery)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        // Also fetch recent deposits from CCPayment API
        try {
            const ccpResponse = await ccpaymentService.getDepositRecordsList({
                page: 1,
                limit: 50 // Fetch more to ensure we don't miss any
            });

            if (ccpResponse.success) {
                // Filter records for this user's addresses
                const apiDeposits = ccpResponse.data.records.filter(record =>
                    addressList.includes(record.toAddress));

                // Check if any new deposits need to be saved locally
                for (const deposit of apiDeposits) {
                    // Check if we already have this deposit
                    const existingDeposit = await CCPaymentDeposit.findOne({
                        orderId: `perm_${deposit.recordId}`
                    });

                    if (!existingDeposit) {
                        // Find the permanent address to get the user_id
                        const permanentAddress = permanentAddresses.find(addr =>
                            addr.address === deposit.toAddress);

                        if (permanentAddress && deposit.status === 'Success') {
                            // Create a new deposit record
                            await CCPaymentDeposit.create({
                                user_id: permanentAddress.user_id,
                                orderId: `perm_${deposit.recordId}`,
                                amount: parseFloat(deposit.paidAmount),
                                amountUSD: parseFloat(deposit.paidValue || deposit.paidAmount),
                                currency: deposit.coinSymbol,
                                status: 'completed',
                                paymentUrl: '',
                                completedAt: new Date(deposit.arrivedAt * 1000),
                                metadata: { permanentDeposit: true, depositData: deposit }
                            });

                            // Update user wallet balance
                            const walletCurrency = deposit.coinSymbol === 'USDT' ? 'USD' : deposit.coinSymbol;
                            await walletUpdateService.updateWalletBalance({
                                userId: permanentAddress.user_id,
                                currency: walletCurrency,
                                amount: parseFloat(deposit.paidAmount),
                                operation: 'add',
                                transactionType: 'Permanent Deposit'
                            });
                        }
                    }
                }

                // Refresh local deposits query after potential updates
                const refreshedDeposits = await CCPaymentDeposit.find(localQuery)
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(parseInt(limit))
                    .lean();

                const total = await CCPaymentDeposit.countDocuments(localQuery);

                return res.status(httpStatus.OK).json({
                    success: true,
                    data: refreshedDeposits,
                    pagination: {
                        total,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        pages: Math.ceil(total / limit)
                    }
                });
            }
        } catch (apiError) {
            console.error('Error fetching from CCPayment API:', apiError);
            // Continue with local data only
        }

        // If API call failed, return local data only
        const total = await CCPaymentDeposit.countDocuments(localQuery);

        return res.status(httpStatus.OK).json({
            success: true,
            data: localDeposits,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get permanent deposit history error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

module.exports = {
    // Permanent deposit address methods
    getPermanentDepositAddress,
    getDepositRecord,
    getUserPermanentAddresses,
    getPermanentDepositHistory,
    unbindDepositAddress,

    // Deposit history
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