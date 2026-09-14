export interface BusService {
  serviceNo: string;
  next: number[]; // 0 means "Arriving", 1 or 2 whole numbers
}

export interface BusArrivalData {
  stopCode: string;
  fetchedAt: string;
  services: BusService[];
}

export interface RainArea {
  area: string;
  forecast: string;
  rainExpected: boolean;
}

export interface RainData {
  validPeriod: string;
  updatedAt: string;
  areas: RainArea[];
}

export interface FavouriteStop {
  stopCode: string;
  stopName: string;
  area: string;
  services: string[]; // List of starred bus service numbers at this stop
}

export type FetchState = 'idle' | 'loading' | 'success' | 'empty' | 'refused' | 'unreachable' | 'not_found';

export const SENTENCES = {
  BUS: {
    loading: 'Checking for arriving buses...',
    empty: 'No bus services are currently operating from this stop.',
    refused: 'Unable to retrieve bus arrivals: service request was not accepted.',
    unreachable: 'Unable to reach bus arrival servers. Please check your connection.',
  },
  RAIN: {
    loading: 'Checking the latest weather forecast...',
    empty: 'No forecast data is currently available for this area.',
    refused: 'Unable to retrieve weather forecast: request was not accepted.',
    unreachable: 'Unable to reach weather forecast servers. Please check your connection.',
  },
  FAVOURITES: {
    savedBusNotRunning: 'This bus is not currently in service.',
    stopCodeNotFound: 'This bus stop code could not be found.',
    noFavourites: 'No favourite bus stops saved yet. Tap the star on any bus arrival in Live Bus Arrivals to add it here.',
  },
};
