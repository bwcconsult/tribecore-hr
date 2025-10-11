/**
 * Postcode/Zip Code Lookup Service
 * Supports UK, US, and Canadian postal code lookups
 */

export interface AddressResult {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postcode: string;
  country: string;
}

/**
 * Lookup UK postcode using ideal-postcodes.co.uk API
 * Note: Requires API key (free tier available)
 */
async function lookupUKPostcode(postcode: string): Promise<AddressResult[]> {
  // Remove spaces and convert to uppercase
  const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();
  
  // For demo purposes, return mock data
  // In production, replace with actual API call:
  // const apiKey = 'YOUR_IDEAL_POSTCODES_API_KEY';
  // const response = await fetch(`https://api.ideal-postcodes.co.uk/v1/postcodes/${cleanPostcode}?api_key=${apiKey}`);
  
  return [
    {
      line1: '10 Downing Street',
      city: 'London',
      postcode: cleanPostcode,
      country: 'United Kingdom',
    },
    {
      line1: '11 Downing Street',
      city: 'London',
      postcode: cleanPostcode,
      country: 'United Kingdom',
    },
  ];
}

/**
 * Lookup US ZIP code using USPS or Smarty Streets API
 * Note: Requires API key
 */
async function lookupUSZipcode(zipcode: string): Promise<AddressResult[]> {
  // Clean zipcode
  const cleanZip = zipcode.replace(/\s/g, '');
  
  // For demo purposes, return mock data
  // In production, replace with actual API call:
  // const response = await fetch(`https://api.smartystreets.com/...`);
  
  return [
    {
      line1: '1600 Pennsylvania Avenue NW',
      city: 'Washington',
      state: 'DC',
      postcode: cleanZip,
      country: 'United States',
    },
  ];
}

/**
 * Lookup Canadian postal code
 */
async function lookupCanadianPostcode(postcode: string): Promise<AddressResult[]> {
  // Clean and format Canadian postal code (A1A 1A1)
  const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();
  const formatted = `${cleanPostcode.slice(0, 3)} ${cleanPostcode.slice(3)}`;
  
  // For demo purposes, return mock data
  // In production, use Canada Post API or similar
  
  return [
    {
      line1: '111 Wellington Street',
      city: 'Ottawa',
      state: 'ON',
      postcode: formatted,
      country: 'Canada',
    },
  ];
}

/**
 * Main postcode lookup function
 * Detects country based on postcode format and routes to appropriate service
 */
export async function lookupPostcode(postcode: string, country?: string): Promise<AddressResult[]> {
  const cleanCode = postcode.trim();
  
  // If country is specified, use that
  if (country) {
    switch (country.toUpperCase()) {
      case 'GB':
      case 'UK':
      case 'UNITED KINGDOM':
        return lookupUKPostcode(cleanCode);
      case 'US':
      case 'USA':
      case 'UNITED STATES':
        return lookupUSZipcode(cleanCode);
      case 'CA':
      case 'CANADA':
        return lookupCanadianPostcode(cleanCode);
      default:
        throw new Error(`Postcode lookup not supported for ${country}`);
    }
  }
  
  // Auto-detect based on format
  
  // UK postcode pattern: AA9A 9AA, A9A 9AA, A9 9AA, A99 9AA, AA9 9AA, AA99 9AA
  const ukPattern = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
  if (ukPattern.test(cleanCode)) {
    return lookupUKPostcode(cleanCode);
  }
  
  // US ZIP code pattern: 12345 or 12345-6789
  const usPattern = /^\d{5}(-\d{4})?$/;
  if (usPattern.test(cleanCode)) {
    return lookupUSZipcode(cleanCode);
  }
  
  // Canadian postal code pattern: A1A 1A1 or A1A1A1
  const canadianPattern = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;
  if (canadianPattern.test(cleanCode)) {
    return lookupCanadianPostcode(cleanCode);
  }
  
  throw new Error('Invalid postcode format. Supported formats: UK, US ZIP, Canadian postal codes');
}

/**
 * Validate postcode format
 */
export function validatePostcode(postcode: string, country?: string): boolean {
  const cleanCode = postcode.trim();
  
  if (!cleanCode) return false;
  
  if (country) {
    switch (country.toUpperCase()) {
      case 'GB':
      case 'UK':
      case 'UNITED KINGDOM':
        return /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i.test(cleanCode);
      case 'US':
      case 'USA':
      case 'UNITED STATES':
        return /^\d{5}(-\d{4})?$/.test(cleanCode);
      case 'CA':
      case 'CANADA':
        return /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(cleanCode);
      default:
        return true; // Allow any format for other countries
    }
  }
  
  // Check if it matches any known pattern
  const ukPattern = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
  const usPattern = /^\d{5}(-\d{4})?$/;
  const canadianPattern = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;
  
  return ukPattern.test(cleanCode) || usPattern.test(cleanCode) || canadianPattern.test(cleanCode);
}
