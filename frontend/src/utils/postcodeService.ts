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
 * Note: Requires API key (free tier available at https://ideal-postcodes.co.uk/)
 */
async function lookupUKPostcode(postcode: string): Promise<AddressResult[]> {
  // Remove spaces and convert to uppercase
  const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();
  const formatted = cleanPostcode.length > 3 
    ? `${cleanPostcode.slice(0, -3)} ${cleanPostcode.slice(-3)}`
    : cleanPostcode;
  
  // TODO: Replace with actual API call when you have an API key
  // Uncomment the code below and add your API key:
  /*
  const apiKey = process.env.REACT_APP_IDEAL_POSTCODES_API_KEY || 'YOUR_API_KEY_HERE';
  try {
    const response = await fetch(
      `https://api.ideal-postcodes.co.uk/v1/postcodes/${cleanPostcode}?api_key=${apiKey}`
    );
    const data = await response.json();
    
    if (data.result && data.result.length > 0) {
      return data.result.map((addr: any) => ({
        line1: addr.line_1,
        line2: addr.line_2,
        city: addr.post_town,
        postcode: addr.postcode,
        country: 'United Kingdom',
      }));
    }
  } catch (error) {
    console.error('Postcode lookup failed:', error);
    throw new Error('Failed to lookup postcode');
  }
  */
  
  // MOCK DATA - More realistic examples based on postcode area
  const postcodeArea = cleanPostcode.substring(0, 2);
  const mockAddresses: Record<string, AddressResult[]> = {
    'ME': [
      {
        line1: '1 High Street',
        city: 'Maidstone',
        postcode: formatted,
        country: 'United Kingdom',
      },
      {
        line1: '2 High Street',
        city: 'Maidstone',
        postcode: formatted,
        country: 'United Kingdom',
      },
      {
        line1: '15 Kent Avenue',
        city: 'Maidstone',
        postcode: formatted,
        country: 'United Kingdom',
      },
    ],
    'SW': [
      {
        line1: '10 Downing Street',
        city: 'London',
        postcode: formatted,
        country: 'United Kingdom',
      },
      {
        line1: '11 Downing Street',
        city: 'London',
        postcode: formatted,
        country: 'United Kingdom',
      },
    ],
    'EC': [
      {
        line1: '1 Bank Street',
        city: 'London',
        postcode: formatted,
        country: 'United Kingdom',
      },
    ],
    'M': [
      {
        line1: '1 Deansgate',
        city: 'Manchester',
        postcode: formatted,
        country: 'United Kingdom',
      },
    ],
  };
  
  // Return mock data based on postcode area, or generic if not found
  return mockAddresses[postcodeArea] || [
    {
      line1: `1 Sample Street`,
      city: 'Sample City',
      postcode: formatted,
      country: 'United Kingdom',
    },
    {
      line1: `2 Sample Street`,
      city: 'Sample City',
      postcode: formatted,
      country: 'United Kingdom',
    },
  ];
}

/**
 * Lookup US ZIP code using USPS or Smarty Streets API
 * Note: Requires API key from https://www.smarty.com/
 */
async function lookupUSZipcode(zipcode: string): Promise<AddressResult[]> {
  // Clean zipcode
  const cleanZip = zipcode.replace(/\s/g, '');
  
  // TODO: Replace with actual API call when you have an API key
  // Uncomment the code below and add your API key:
  /*
  const authId = process.env.REACT_APP_SMARTY_AUTH_ID || 'YOUR_AUTH_ID';
  const authToken = process.env.REACT_APP_SMARTY_AUTH_TOKEN || 'YOUR_AUTH_TOKEN';
  try {
    const response = await fetch(
      `https://us-zipcode.api.smarty.com/lookup?auth-id=${authId}&auth-token=${authToken}&zipcode=${cleanZip}`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return data[0].zipcodes.map((zip: any) => ({
        line1: '',
        city: zip.default_city,
        state: zip.state_abbreviation,
        postcode: zip.zipcode,
        country: 'United States',
      }));
    }
  } catch (error) {
    console.error('ZIP lookup failed:', error);
    throw new Error('Failed to lookup ZIP code');
  }
  */
  
  // MOCK DATA - Examples based on ZIP code
  const zipPrefix = cleanZip.substring(0, 3);
  const mockAddresses: Record<string, AddressResult[]> = {
    '200': [ // DC area
      {
        line1: '1600 Pennsylvania Avenue NW',
        city: 'Washington',
        state: 'DC',
        postcode: cleanZip,
        country: 'United States',
      },
    ],
    '100': [ // NYC area
      {
        line1: '350 Fifth Avenue',
        city: 'New York',
        state: 'NY',
        postcode: cleanZip,
        country: 'United States',
      },
    ],
    '941': [ // San Francisco
      {
        line1: '1 Market Street',
        city: 'San Francisco',
        state: 'CA',
        postcode: cleanZip,
        country: 'United States',
      },
    ],
  };
  
  return mockAddresses[zipPrefix] || [
    {
      line1: '123 Main Street',
      city: 'Sample City',
      state: 'XX',
      postcode: cleanZip,
      country: 'United States',
    },
  ];
}

/**
 * Lookup Canadian postal code
 * Note: Canada Post API requires business account
 */
async function lookupCanadianPostcode(postcode: string): Promise<AddressResult[]> {
  // Clean and format Canadian postal code (A1A 1A1)
  const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();
  const formatted = `${cleanPostcode.slice(0, 3)} ${cleanPostcode.slice(3)}`;
  
  // TODO: Replace with actual API call when you have Canada Post API access
  // Canada Post API requires a business account
  // Alternative: Use Geocoder.ca (free for Canada)
  /*
  try {
    const response = await fetch(
      `https://geocoder.ca/?postal=${cleanPostcode}&geoit=XML&json=1`
    );
    const data = await response.json();
    
    if (data && data.standard) {
      return [{
        line1: data.standard.stnumber + ' ' + data.standard.staddress,
        city: data.standard.city,
        state: data.standard.prov,
        postcode: formatted,
        country: 'Canada',
      }];
    }
  } catch (error) {
    console.error('Postal code lookup failed:', error);
    throw new Error('Failed to lookup postal code');
  }
  */
  
  // MOCK DATA - Examples based on postal code prefix
  const postalPrefix = cleanPostcode.substring(0, 1);
  const mockAddresses: Record<string, AddressResult[]> = {
    'K': [ // Ottawa area
      {
        line1: '111 Wellington Street',
        city: 'Ottawa',
        state: 'ON',
        postcode: formatted,
        country: 'Canada',
      },
    ],
    'M': [ // Toronto area
      {
        line1: '301 Front Street West',
        city: 'Toronto',
        state: 'ON',
        postcode: formatted,
        country: 'Canada',
      },
    ],
    'H': [ // Montreal area
      {
        line1: '1250 René-Lévesque Blvd',
        city: 'Montreal',
        state: 'QC',
        postcode: formatted,
        country: 'Canada',
      },
    ],
    'V': [ // Vancouver area
      {
        line1: '453 West 12th Avenue',
        city: 'Vancouver',
        state: 'BC',
        postcode: formatted,
        country: 'Canada',
      },
    ],
  };
  
  return mockAddresses[postalPrefix] || [
    {
      line1: '123 Main Street',
      city: 'Sample City',
      state: 'XX',
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
