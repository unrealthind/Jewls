const MOCK_PRICE_PER_GRAM_CAD = 101.55; // A realistic mock price as a fallback

export interface GoldPriceResponse {
  price: number;
  isLive: boolean;
  message?: string;
}

/**
 * Fetches the live price of gold per gram in Canadian Dollars (CAD) using the FMP API.
 * It fetches the gold price in USD per troy ounce and the USDCAD exchange rate,
 * then performs the necessary conversion.
 * If a 401 Unauthorized error occurs, it returns a mock price instead.
 * @returns A promise that resolves to an object containing the price and its status (live or mock).
 */
export const fetchGoldPriceCAD = async (): Promise<GoldPriceResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API key is not configured.');
  }

  const goldPriceUrl = `https://financialmodelingprep.com/api/v3/quote/XAUUSD?apikey=${apiKey}`;
  const exchangeRateUrl = `https://financialmodelingprep.com/api/v3/fx/USDCAD?apikey=${apiKey}`;

  try {
    const [goldResponse, fxResponse] = await Promise.all([
      fetch(goldPriceUrl),
      fetch(exchangeRateUrl),
    ]);
    
    if (goldResponse.status === 401 || fxResponse.status === 401) {
      return {
        price: MOCK_PRICE_PER_GRAM_CAD,
        isLive: false,
        message: 'Live feed unavailable (premium API key required). Using a mock price for calculations.',
      };
    }

    if (!goldResponse.ok) {
        const errorData = await goldResponse.json().catch(() => ({}));
        const errorMessage = errorData['error-message'] || `Request failed with status ${goldResponse.status}`;
        throw new Error(`Gold API Error: ${errorMessage}`);
    }
     if (!fxResponse.ok) {
        const errorData = await fxResponse.json().catch(() => ({}));
        const errorMessage = errorData['error-message'] || `Request failed with status ${fxResponse.status}`;
        throw new Error(`FX API Error: ${errorMessage}`);
    }

    const goldData = await goldResponse.json();
    const fxData = await fxResponse.json();

    const goldPriceUSDPerOunce = goldData?.[0]?.price;
    const usdToCadRateString = fxData?.[0]?.bid;

    if (typeof goldPriceUSDPerOunce !== 'number' || typeof usdToCadRateString !== 'string') {
      console.error('Invalid data format received from FMP API.', { goldData, fxData });
      throw new Error('Invalid data format received from FMP API.');
    }
    
    const usdToCadRate = parseFloat(usdToCadRateString);

    if (isNaN(usdToCadRate)) {
        throw new Error('Could not parse exchange rate from API response.');
    }

    const goldPriceCADPerOunce = goldPriceUSDPerOunce * usdToCadRate;
    const TROY_OUNCE_IN_GRAMS = 31.1034768; // This is needed here for conversion calculation within this function
    const pricePerGramCAD = goldPriceCADPerOunce / TROY_OUNCE_IN_GRAMS;

    return { price: pricePerGramCAD, isLive: true };
  } catch (error) {
    console.error("Error in fetchGoldPriceCAD:", error);
    if (error instanceof Error) {
        throw error; // re-throw other errors
    }
    throw new Error('Could not fetch live gold price.');
  }
};