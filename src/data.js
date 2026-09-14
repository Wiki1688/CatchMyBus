// PLACEHOLDER — to be replaced by live data in the next step

/**
 * SIMULATION_FLAG controls the placeholder behavior so you can test every state in Item 5:
 *  'normal'       - Regular mock data with arriving buses and rain forecast
 *  'empty'        - Empty stop (no services) & empty weather forecast
 *  'refused'      - Server refused request (403 / unaccepted)
 *  'unreachable'  - Network unreachable / server offline
 *  'not_running'  - Bus services exist at stop but none are currently running (next: [])
 *  'not_found'    - Bus stop code not found
 */
export let SIMULATION_FLAG = 'normal';

// Helper to let dev switch flag at runtime if needed, while keeping the top flag default
export function setSimulationFlag(flag) {
  SIMULATION_FLAG = flag;
  if (typeof window !== 'undefined') {
    window.__CMB_SIMULATION_FLAG__ = flag;
  }
}

// All 47 official Singapore data.gov.sg 2-hour weather forecast areas
export const SG_WEATHER_AREAS = [
  'Ang Mo Kio',
  'Bedok',
  'Bishan',
  'Boon Lay',
  'Bukit Batok',
  'Bukit Merah',
  'Bukit Panjang',
  'Bukit Timah',
  'Central Water Catchment',
  'Changi',
  'Choa Chu Kang',
  'City',
  'Clementi',
  'Geylang',
  'Hougang',
  'Jalan Bahar',
  'Jurong East',
  'Jurong Island',
  'Jurong West',
  'Kallang',
  'Lim Chu Kang',
  'Mandai',
  'Marine Parade',
  'Novena',
  'Pasir Ris',
  'Paya Lebar',
  'Pioneer',
  'Pulau Tekong',
  'Pulau Ubin',
  'Punggol',
  'Queenstown',
  'Seletar',
  'Sembawang',
  'Sengkang',
  'Sentosa',
  'Serangoon',
  'Southern Islands',
  'Sungei Kadut',
  'Tampines',
  'Tanglin',
  'Tengah',
  'Toa Payoh',
  'Tuas',
  'Western Islands',
  'Western Water Catchment',
  'Woodlands',
  'Yishun',
];

// Curated typical services for Bugis Cube (01039) and common stops
const DEFAULT_SERVICES_BY_STOP = {
  '01039': [
    { serviceNo: '7', next: [0, 8] },
    { serviceNo: '12', next: [4, 14] },
    { serviceNo: '175', next: [9, 21] },
    { serviceNo: '197', next: [1, 15] },
    { serviceNo: '851', next: [12, 25] },
    { serviceNo: '960', next: [5, 18] },
    { serviceNo: '980', next: [16] },
  ],
};

function formatCurrentTime() {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // "HH:MM"
}

function getValidForecastPeriod() {
  const now = new Date();
  const startHour = now.getHours();
  const endHour = (startHour + 2) % 24;
  const formatH = (h) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const civ = h % 12 || 12;
    return `${civ}:00 ${ampm}`;
  };
  return `${formatH(startHour)} – ${formatH(endHour)}`;
}

/**
 * getBus(stopCode)
 * Returns: { stopCode, fetchedAt, services: [ { serviceNo, next: [ 4, 11 ] } ] }
 * where next holds 0, 1 or 2 whole minutes and 0 means "Arriving".
 */
export async function getBus(stopCode) {
  // Required 1-second fake delay so loading sentences are clearly visible
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const activeFlag =
    (typeof window !== 'undefined' && window.__CMB_SIMULATION_FLAG__) ||
    SIMULATION_FLAG;

  if (activeFlag === 'unreachable') {
    const err = new Error('unreachable');
    err.code = 'unreachable';
    throw err;
  }

  if (activeFlag === 'refused') {
    const err = new Error('refused');
    err.code = 'refused';
    throw err;
  }

  if (activeFlag === 'not_found' || stopCode === '99999') {
    const err = new Error('not_found');
    err.code = 'not_found';
    throw err;
  }

  if (activeFlag === 'empty') {
    return {
      stopCode,
      fetchedAt: new Date().toISOString(),
      services: [],
    };
  }

  if (activeFlag === 'not_running') {
    return {
      stopCode,
      fetchedAt: new Date().toISOString(),
      services: [
        { serviceNo: '7', next: [] },
        { serviceNo: '12', next: [] },
        { serviceNo: '175', next: [] },
      ],
    };
  }

  // Normal mode:
  // If stop is 01039, use default set. Otherwise dynamically produce realistic services for that stop code.
  let services = DEFAULT_SERVICES_BY_STOP[stopCode];
  if (!services) {
    // Generate realistic arrivals based on stopCode digits
    const seed = parseInt(stopCode, 10) || 1039;
    const baseNums = ['2', '14', '33', '65', '147', '190', '857'];
    services = baseNums.slice(0, 4 + (seed % 4)).map((num, i) => {
      const first = (seed * 3 + i * 5) % 15;
      const second = first + 7 + ((seed + i) % 10);
      return {
        serviceNo: num,
        next: first === 0 ? [0, second] : [first, second],
      };
    });
  }

  return {
    stopCode,
    fetchedAt: new Date().toISOString(),
    services,
  };
}

/**
 * getRain()
 * Returns: { validPeriod, updatedAt, areas: [ { area, forecast, rainExpected } ] }
 * with all 47 area names, so the dropdown is real.
 */
export async function getRain() {
  // Required 1-second fake delay so loading sentences are clearly visible
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const activeFlag =
    (typeof window !== 'undefined' && window.__CMB_SIMULATION_FLAG__) ||
    SIMULATION_FLAG;

  if (activeFlag === 'unreachable') {
    const err = new Error('unreachable');
    err.code = 'unreachable';
    throw err;
  }

  if (activeFlag === 'refused') {
    const err = new Error('refused');
    err.code = 'refused';
    throw err;
  }

  if (activeFlag === 'empty') {
    return {
      validPeriod: '',
      updatedAt: '',
      areas: [],
    };
  }

  const sampleForecasts = [
    { forecast: 'Showers', rainExpected: true },
    { forecast: 'Passing Showers', rainExpected: true },
    { forecast: 'Thundery Showers', rainExpected: true },
    { forecast: 'Partly Cloudy', rainExpected: false },
    { forecast: 'Cloudy', rainExpected: false },
    { forecast: 'Fair', rainExpected: false },
  ];

  const areas = SG_WEATHER_AREAS.map((area, index) => {
    // Make City have "Showers" as specified in example ("Home · 01039 · next: 7 in 4 min · Showers")
    if (area === 'City') {
      return { area, forecast: 'Showers', rainExpected: true };
    }
    const sample = sampleForecasts[(index * 7) % sampleForecasts.length];
    return {
      area,
      forecast: sample.forecast,
      rainExpected: sample.rainExpected,
    };
  });

  return {
    validPeriod: getValidForecastPeriod(),
    updatedAt: formatCurrentTime(),
    areas,
  };
}
