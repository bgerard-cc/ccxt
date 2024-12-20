
// ---------------------------------------------------------------------------

import Exchange from './abstract/bullish.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { NotSupported, ArgumentsRequired, BadRequest, AuthenticationError, InvalidOrder, ExchangeError } from './base/errors.js';
import type {
    Dict,
    int,
    Num,
    Strings,
    Int,
    Str,
    Market,
    OrderType,
    OrderSide,
    Order,
    Ticker,
    Tickers,
    OHLCV,
    Trade,
    OrderBook,
    FundingRate,
    Balances,
    Position,
    LedgerEntry,
    Currency,
    Transaction,
    Leverage,
    Currencies, Dictionary,
} from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class bullish
 * @augments Exchange
 */
export default class bullish extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bullish',
            'name': 'Bullish',
            // 'countries': [ '' ],
            'rateLimit': 20,
            'version': 'v1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': false,
                'cancelOrder': true,
                'cancelWithdraw': false,
                'closeAllPositions': true,
                'closePosition': true,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMarkPrice': false,
                'fetchMarkPrices': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'sandbox': true,
                'setLeverage': true,
                'setMargin': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '30m': '30m',
                '1h': '1h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.exchange.bullish.com/trading-api',
                    'private': 'https://api.exchange.bullish.com/trading-api',
                },
                'test': {
                    'public': 'https://api.simnext.bullish-test.com/trading-api',
                    'private': 'https://api.simnext.bullish-test.com/trading-api',
                },
                'www': 'https://bullish.com',
                'doc': [
                    'https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview',
                ],
                'fees': [
                    '',
                ],
            },
            'api': {
                'public': {
                    'v1': {
                        'get': {
                            'nonce': 1,
                            'time': 1,
                            'markets': 1,
                            'markets/{symbol}': 1,
                            'markets/{symbol}/tick': 1,
                            'markets/{symbol}/candle': 1,
                            'markets/{symbol}/orderbook/hybrid': 1,
                            'history/markets/{symbol}/trades': 1,
                            'history/markets/{symbol}/funding-rate': 1,
                            'assets': 1,
                            'assets/{symbol}': 1,
                            'index-prices': 1,
                            'index-prices/{assetSymbol}': 1,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    // 'maker': this.parseNumber ('0.0002'),
                    // 'taker': this.parseNumber ('0.0005'),
                },
            },
            'options': {
                'sandboxMode': false,
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    '404': BadRequest, // {"errorCode":404,"errorMessage":"Not Found"}
                    'missing_auth_signature': AuthenticationError, // {"msg":"Missing auth signature","code":"missing_auth_signature"}
                    'order_rejected': InvalidOrder, // {"success":false,"err":{"msg":"Order has already been rejected","code":"order_rejected"}}
                    'invalid_order_id': InvalidOrder, // {"success":false,"err":{"msg":"Invalid order id","code":"invalid_order_id"}}
                    'filter_lotsize_maxqty': InvalidOrder, // {"errorCode":"filter_lotsize_maxqty","errorMessage":"LOT_SIZE filter failed, quantity more than maxQty","errorData":{"maxQty":"5000.00"}}
                    'filter_notional_min': InvalidOrder, // {"errorCode":"filter_notional_min","errorMessage":"NOTIONAL filter failed, Notional value of quote asset less than minNotional","errorData":{"minNotional":"100.00000000"}}
                    'failed_index_price_up_multiplier_filter': InvalidOrder, // {"errorCode":"failed_index_price_up_multiplier_filter","errorMessage":"failed_index_price_up_multiplier_filter","errorData":{"maxPrice":"307.81241042"}}
                    'no_open_orders': InvalidOrder, // {"errorMessage":"No open orders found","errorCode":"no_open_orders"}
                    'active_position_not_found': InvalidOrder, // {"errorCode":"active_position_not_found","errorMessage":"Active position not found"}
                    'position_inactive': InvalidOrder, // {"errorCode":"position_inactive","errorMessage":"Position is already inactive"}
                    'invalid_position_id': InvalidOrder, // {"errorCode":"invalid_position_id","errorMessage":"Position id is invalid"}
                    'Internal server error': ExchangeError, // {"msg":"Internal server error","code":"internal_server_error"}
                },
                'broad': {
                    'Bad Request': BadRequest, // {"errorMessage":"Bad Request","data":[{"param":"symbol","message":"\"symbol\" must be one of [ETH_USDC, BTC_USDC, BNB_USDC, SOL_USDC, DOGE_USDC, TON_USDC, AVAX_USDC, WIF_USDC, KPEPE_USDC, KSHIB_USDC, KBONK_USDC, MOODENG_USDC, POPCAT_USDC, MOTHER_USDC]"}]}
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }

    parseMarket (market: Dict): Market {
        const id = this.safeString (market, 'marketId');
        const baseId = this.safeString (market, 'baseSymbol');
        const base = this.safeCurrencyCode (baseId);
        const quoteId = this.safeString (market, 'quoteSymbol');
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const marketType = this.safeString (market, 'marketType');
        const type = marketType === 'SPOT' ? 'spot' : 'swap';
        const swap = type === 'swap';
        const settleId = this.safeString (market, 'settlementAssetSymbol');
        const settle = swap ? this.safeCurrencyCode (settleId) : undefined;
        const contractSize = swap ? 1 : undefined;
        const isLinear = settle === quote;
        const isInverse = settle === base;
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'baseId': baseId,
            'quoteId': quoteId,
            'quote': quote,
            'active': this.safeBool (market, 'marketEnabled'),
            'type': type,
            'spot': type === 'spot',
            'margin': false,
            'future': false,
            'swap': swap,
            'option': false,
            'contract': swap,
            'settle': settle,
            'settleId': settleId,
            'contractSize': contractSize,
            'linear': isLinear,
            'inverse': isInverse,
            'taker': this.safeNumber (market, 'takerFee') * 0.01,
            'maker': this.safeNumber (market, 'makerFee') * 0.01,
            'percentage': true,
            'tierBased': true,
            'feeSide': 'other',
            'precision': {
                'price': this.safeNumber (market, 'pricePrecision'),
                'amount': this.safeNumber (market, 'quantityPrecision'),
                'cost': this.safeNumber (market, 'costPrecision'),
            },
            'limits': {
                'amount': {
                    'min': this.safeNumber (market, 'minQuantityLimit'),
                    'max': this.safeNumber (market, 'maxQuantityLimit'),
                },
                'price': {
                    'min': this.safeNumber (market, 'minPriceLimit'),
                    'max': this.safeNumber (market, 'maxPriceLimit'),
                },
                'cost': {
                    'min': this.safeNumber (market, 'minCostLimit'),
                    'max': this.safeNumber (market, 'maxCostLimit'),
                },
            },
            'marginModes': {
                'cross': false,
                'isolated': false,
            },
            'info': market,
        });
    }

    /**
     * @method
     * @name bullish#fetchMarkets
     * @description retrieves data on all markets for bullish
     * @see https://api.exchange.bullish.com/trading-api/v1/markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicV1GetMarkets (params);
        return this.parseMarkets (response);
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicV1GetAssets (params);
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const currencyId = this.safeString (entry, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const name = this.safeString (entry, 'name');
            result[code] = {
                'id': currencyId,
                'code': code,
                'name': name,
                'active': true,
                'fee': undefined,
                'precision': this.safeNumber (entry, 'precision'),
                'networks': {},
                'info': entry,
            };
        }
        return result;
    }

    async fetchTradingLimits (symbols: Strings = undefined, params = {}) {
        // this method should not be called directly, use loadTradingLimits () instead
        const markets = await this.fetchMarkets ();
        const tradingLimits: Dict = {};
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const symbol = market['symbol'];
            if ((symbols === undefined) || (this.inArray (symbol, symbols))) {
                tradingLimits[symbol] = market['limits']['amount'];
            }
        }
        return tradingLimits;
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': this.safeInteger (ticker, 'createdAtTimestamp'),
            'datetime': this.safeString (ticker, 'createdAtDatetime'),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bestBid'),
            'bidVolume': this.safeString (ticker, 'bidVolume'),
            'ask': this.safeString (ticker, 'bestAsk'),
            'askVolume': this.safeString (ticker, 'askVolume'),
            'vwap': this.safeString (ticker, 'vwap'),
            'open': this.safeString (ticker, 'open'),
            'close': this.safeString (ticker, 'close'),
            'last': this.safeString (ticker, 'last'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'change'),
            'percentage': this.safeString (ticker, 'percentage'),
            'average': this.safeString (ticker, 'average'),
            'baseVolume': this.safeString (ticker, 'baseVolume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'markPrice': this.safeString (ticker, 'markPrice'),
            'indexPrice': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name bingx#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/market-api.html#Get%20Ticker
     * @see https://bingx-api.github.io/docs/#/en-us/spot/market-api.html#24-hour%20price%20changes
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Query%2024-Hour%20Price%20Change
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['info']['symbol'],
        };
        const response = await this.publicV1GetMarketsSymbolTick (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    normaliseLimit (limit: Int): Int {
        if (limit <= 5) {
            return 5;
        } else if (limit <= 25) {
            return 25;
        } else if (limit <= 50) {
            return 50;
        } else {
            return 100;
        }
    }

    /**
     * @method
     * @name bingx#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://bingx-api.github.io/docs/#/spot/market-api.html#Query%20depth%20information
     * @see https://bingx-api.github.io/docs/#/swapV2/market-api.html#Get%20Market%20Depth
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Query%20Depth%20Data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['info']['symbol'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicV1GetMarketsSymbolOrderbookHybrid (this.extend (request, params));
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, market['symbol'], timestamp, 'bids', 'asks', 'price', 'priceLevelQuantity');
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        const side = this.safeString (trade, 'side') === 'SELL' ? 'sell' : 'buy';
        const takerOrMaker = this.safeBool (trade, 'isTaker') ? 'taker' : 'maker';
        return this.safeTrade ({
            'id': this.safeString (trade, 'tradeId'),
            'timestamp': this.safeInteger (trade, 'createdAtTimestamp'),
            'datetime': this.safeString (trade, 'createdAtDatetime'),
            'symbol': market['symbol'],
            'order': undefined,
            'side': side,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'quantity'),
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    extractUrlParams (url: string): Dictionary<string> {
        const params = {};
        const queryString = url.split ('?')[1];
        if (queryString !== undefined) {
            const queryStringParams = queryString.split ('&');
            for (let i = 0; i < queryStringParams.length; i += 1) {
                const keyValue = queryStringParams[i].split ('=');
                params[keyValue[0]] = keyValue[1];
            }
        }
        return params;
    }

    /**
     * @method
     * @name bingx#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://bingx-api.github.io/docs/#/spot/market-api.html#Query%20transaction%20records
     * @see https://bingx-api.github.io/docs/#/swapV2/market-api.html#The%20latest%20Trade%20of%20a%20Trading%20Pair
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let paginate: boolean;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'paginate');
        if (paginate) {
            // Can only seem to work backwards
            return await this.fetchPaginatedCallCursor ('fetchTrades', symbol, since, limit, params, '_nextPage', '_nextPage', undefined, 100) as Trade[];
        }
        const market = this.market (symbol);
        let request: Dict = {
            'symbol': market['info']['symbol'],
            'createdAtDatetime[gte]': this.iso8601 (since),
            '_metaData': true,
        };
        if (limit !== undefined) {
            request['_pageSize'] = this.normaliseLimit (limit);
        }
        [ request, params ] = this.handleUntilOption ('createdAtDatetime[lte]', request, params);
        const response = await this.publicV1GetHistoryMarketsSymbolTrades (this.extend (request, params));
        const tradeArray = this.safeList (response, 'data');
        const links = this.safeDict (response, 'links');
        const nextUrl = this.safeString (links, 'next');
        if (nextUrl !== undefined && paginate) {
            const nextUrlParams = this.extractUrlParams (nextUrl);
            for (let i = 0; i < tradeArray.length; i++) {
                tradeArray[i]['_nextPage'] = nextUrlParams['_nextPage'];
            }
        }
        return this.parseTrades (tradeArray, market, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 'createdAtTimestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    /**
     * @method
     * @name bitfinex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.bitfinex.com/reference/rest-public-candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, default 100 max 10000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = 100, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, 100) as OHLCV[];
        }
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['info']['symbol'],
            'timeBucket': this.safeString (this.timeframes, timeframe, timeframe),
            '_pageSize': this.normaliseLimit (limit),
        };
        const now = this.milliseconds ();
        const duration = this.parseTimeframe (timeframe);
        const until = this.safeInteger2 (params, 'until', 'till', now);
        if (since !== undefined) {
            request['createdAtDatetime[gte]'] = this.iso8601 (since);
            if (limit !== undefined) {
                const endTs = this.sum (since, duration * (limit + 1) * 1000) - 1;
                request['createdAtDatetime[lte]'] = this.iso8601 (endTs);
            } else {
                request['createdAtDatetime[lte]'] = this.iso8601 (until);
            }
        } else {
            request['createdAtDatetime[lte]'] = this.iso8601 (until);
            if (limit !== undefined) {
                const startTs = until - duration * (limit + 1) * 1000 + 1;
                request['createdAtDatetime[gte]'] = this.iso8601 (startTs);
            } else {
                const startTs = until - duration * 101 * 1000 + 1;
                request['createdAtDatetime[gte]'] = this.iso8601 (startTs);
            }
        }
        const response = await this.publicV1GetMarketsSymbolCandle (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    sign (path, section = [ 'public', 'v1' ], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.implodeParams (path, params);
        const isSandbox = this.safeBool (this.options, 'sandboxMode', false);
        const urlsSection = isSandbox ? 'test' : 'api';
        let url = this.urls[urlsSection][section[0]] + '/' + section[1] + request;
        params = this.omit (params, this.extractParams (path));
        params = this.keysort (params);
        if (Object.keys (params).length) {
            url += '?' + this.urlencode (params);
        }
        // if (access === 'public') {
        //     if (Object.keys (params).length) {
        //         url += '?' + this.urlencode (params);
        //     }
        // } else if (access === 'private') {
        // this.checkRequiredCredentials ();
        // const isJsonContentType = ((type === 'subAccount') && (method === 'POST'));
        // const parsedParams = this.parseParams (params);
        // const signature = this.hmac (this.encode (this.rawencode (parsedParams)), this.encode (this.secret), sha256);
        // headers = {
        //     'X-BX-APIKEY': this.apiKey,
        //     'X-SOURCE-KEY': this.safeString (this.options, 'broker', 'CCXT'),
        // };
        // if (isJsonContentType) {
        //     headers['Content-Type'] = 'application/json';
        //     parsedParams['signature'] = signature;
        //     body = this.json (parsedParams);
        // } else {
        //     const query = this.urlencode (parsedParams);
        //     url += '?' + query + '&signature=' + signature;
        // }
        // }
        console.log ('url', url);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    nonce () {
        return this.milliseconds ();
    }

    setSandboxMode (enable: boolean) {
        super.setSandboxMode (enable);
        this.options['sandboxMode'] = enable;
    }
}
