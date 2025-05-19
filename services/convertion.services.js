const axios = require('axios');

/**
 * Converts a cryptocurrency to USDT using the current market rate.
 * @param {string} cryptoSymbol - The symbol of the cryptocurrency (e.g., BTC, LTC, SOL, USDC, TRX, ETH).
 * @param {number} amount - The amount of the cryptocurrency to convert.
 * @returns {Promise<number>} - The equivalent amount in USDT.
 */
async function convertToUSDT(cryptoSymbol, amount) {
    // Normalize the crypto symbol
    const normalizedSymbol = cryptoSymbol.toUpperCase();
    
    // If already USDT, return the amount directly
    if (normalizedSymbol === 'USDT') {
        return amount;
    }
    
    try {
        // Try Binance API first (has good coverage for most cryptocurrencies)
        try {
            const binanceResponse = await axios.get('https://api.binance.com/api/v3/ticker/price', {
                params: { symbol: `${normalizedSymbol}USDT` }
            });
            
            if (binanceResponse.data && binanceResponse.data.price) {
                const marketRate = parseFloat(binanceResponse.data.price);
                return amount * marketRate;
            }
        } catch (binanceError) {
            console.log(`Binance API failed for ${normalizedSymbol}, trying CoinGecko...`);
        }
        
        // Fallback to CoinGecko API (has wider coverage)
        const geckoResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: getCoinGeckoId(normalizedSymbol),
                vs_currencies: 'usd'
            }
        });
        
        const coinId = getCoinGeckoId(normalizedSymbol);
        if (geckoResponse.data && geckoResponse.data[coinId] && geckoResponse.data[coinId].usd) {
            const marketRate = parseFloat(geckoResponse.data[coinId].usd);
            return amount * marketRate;
        }
        
        // If CoinGecko also fails, try CryptoCompare as a last resort
        const cryptoCompareResponse = await axios.get(`https://min-api.cryptocompare.com/data/price`, {
            params: {
                fsym: normalizedSymbol,
                tsyms: 'USDT'
            }
        });
        
        if (cryptoCompareResponse.data && cryptoCompareResponse.data.USDT) {
            const marketRate = parseFloat(cryptoCompareResponse.data.USDT);
            return amount * marketRate;
        }
        
        throw new Error(`Could not find exchange rate for ${normalizedSymbol}`);
    } catch (error) {
        console.error(`Error converting ${normalizedSymbol} to USDT:`, error.message);
        throw new Error(`Failed to convert ${normalizedSymbol} to USDT: ${error.message}`);
    }
}


/**
 * Maps cryptocurrency symbols to their CoinGecko IDs
 * @param {string} symbol - The cryptocurrency symbol
 * @returns {string} - The corresponding CoinGecko ID
 */
function getCoinGeckoId(symbol) {
    const symbolMap = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'USDC': 'usd-coin',
        'SOL': 'solana',
        'TRX': 'tron',
        'LTC': 'litecoin',
        'XRP': 'ripple',
        'ADA': 'cardano',
        'DOT': 'polkadot',
        'DOGE': 'dogecoin',
        'AVAX': 'avalanche-2',
        'MATIC': 'matic-network',
        'LINK': 'chainlink',
        'UNI': 'uniswap',
        'SHIB': 'shiba-inu',
        'ATOM': 'cosmos',
        'XLM': 'stellar',
        'ALGO': 'algorand',
        'FIL': 'filecoin',
        'ETC': 'ethereum-classic',
        'NEAR': 'near',
        'APE': 'apecoin',
        'FLOW': 'flow',
        'AXS': 'axie-infinity',
        'SAND': 'the-sandbox',
        'MANA': 'decentraland',
        'EGLD': 'elrond-erd-2',
        'XTZ': 'tezos',
        'EOS': 'eos',
        'ZEC': 'zcash',
        'CAKE': 'pancakeswap-token',
        'AAVE': 'aave',
        'KCS': 'kucoin-shares',
        'DASH': 'dash',
        'MKR': 'maker',
        'NEO': 'neo',
        'CRV': 'curve-dao-token',
        'BAT': 'basic-attention-token',
        'ENJ': 'enjincoin',
        'ZIL': 'zilliqa',
        'ONE': 'harmony',
        'COMP': 'compound-governance-token',
        'SUSHI': 'sushi',
        'YFI': 'yearn-finance',
        'QTUM': 'qtum',
        'WAVES': 'waves',
        'ZRX': '0x',
        'ICX': 'icon',
        'ONT': 'ontology',
        'IOTA': 'iota',
        'CELO': 'celo',
        'KAVA': 'kava',
        'THETA': 'theta-token',
        'VET': 'vechain',
        'FTM': 'fantom',
        'HBAR': 'hedera-hashgraph',
        'XMR': 'monero',
        'BCH': 'bitcoin-cash',
        'BSV': 'bitcoin-sv',
        'BTG': 'bitcoin-gold',
        'LUNA': 'terra-luna-2',
        'UST': 'terrausd',
        'BUSD': 'binance-usd',
        'DAI': 'dai',
        'TUSD': 'true-usd',
        'USDN': 'neutrino',
        'USDP': 'paxos-standard',
        'GUSD': 'gemini-dollar',
        'FRAX': 'frax',
        'LUSD': 'liquity-usd',
        'SUSD': 'nusd',
        'HUSD': 'husd',
        'OUSD': 'origin-dollar',
        'MUSD': 'musd',
        'DUSD': 'defidollar',
        'CUSD': 'celo-dollar',
        'ZUSD': 'zusd',
        'USDK': 'usdk',
        'USDX': 'usdx',
        'USDJ': 'just-stablecoin',
        'USDT': 'tether',
    };
    
    // Return the mapped ID or use the lowercase symbol as a fallback
    return symbolMap[symbol] || symbol.toLowerCase();
}

/**
 * Batch convert multiple cryptocurrencies to USDT
 * @param {Array<{symbol: string, amount: number}>} cryptoAmounts - Array of crypto symbols and amounts
 * @returns {Promise<number>} - The total equivalent amount in USDT
 */
async function batchConvertToUSDT(cryptoAmounts) {
    try {
        const conversionPromises = cryptoAmounts.map(item => 
            convertToUSDT(item.symbol, item.amount)
        );
        
        const convertedAmounts = await Promise.all(conversionPromises);
        return convertedAmounts.reduce((total, amount) => total + amount, 0);
    } catch (error) {
        console.error('Error in batch conversion:', error);
        throw new Error('Failed to perform batch conversion to USDT');
    }
}

module.exports = { convertToUSDT, batchConvertToUSDT };