import React, { useState, useEffect, useCallback } from 'react';
import { BusArrivalData, RainData, FavouriteStop, FetchState, SENTENCES } from '../types.ts';
import { getBus, getRain } from '../data.js';
import { getBusStopLocation } from '../busStopsData.ts';
import { WeatherPanel } from './WeatherPanel.tsx';

interface LiveArrivalsScreenProps {
  favourites: FavouriteStop[];
  onToggleFavourite: (
    stopCode: string,
    serviceNo: string,
    currentArea: string,
    locationDescription?: string
  ) => void;
}

export const LiveArrivalsScreen: React.FC<LiveArrivalsScreenProps> = ({
  favourites,
  onToggleFavourite,
}) => {
  // Remember last looked at stop code, defaulting to 01039 (Bugis Cube)
  const [stopCodeInput, setStopCodeInput] = useState<string>(() => {
    return localStorage.getItem('catchMyBus.lastStopCode') || '01039';
  });
  const [activeStopCode, setActiveStopCode] = useState<string>(() => {
    return localStorage.getItem('catchMyBus.lastStopCode') || '01039';
  });

  const [busData, setBusData] = useState<BusArrivalData | null>(null);
  const [busState, setBusState] = useState<FetchState>('loading');

  const [rainData, setRainData] = useState<RainData | null>(null);
  const [rainState, setRainState] = useState<FetchState>('loading');
  const [selectedArea, setSelectedArea] = useState<string>('City');

  // Location info for currently active bus stop
  const currentStopInfo = getBusStopLocation(activeStopCode);

  // Load weather and bus arrivals
  const fetchBusData = useCallback(async (code: string) => {
    setBusState('loading');
    try {
      const data = await getBus(code);
      if (!data || !data.services || data.services.length === 0) {
        setBusData(data);
        setBusState('empty');
      } else {
        setBusData(data);
        setBusState('success');
      }
    } catch (err: any) {
      const codeType = err?.code;
      if (codeType === 'refused') {
        setBusState('refused');
      } else if (codeType === 'unreachable') {
        setBusState('unreachable');
      } else if (codeType === 'not_found') {
        setBusState('not_found');
      } else {
        setBusState('unreachable');
      }
    }
  }, []);

  const fetchRainData = useCallback(async () => {
    setRainState('loading');
    try {
      const data = await getRain();
      if (!data || !data.areas || data.areas.length === 0) {
        setRainData(data);
        setRainState('empty');
      } else {
        setRainData(data);
        setRainState('success');
      }
    } catch (err: any) {
      const codeType = err?.code;
      if (codeType === 'refused') {
        setRainState('refused');
      } else if (codeType === 'unreachable') {
        setRainState('unreachable');
      } else {
        setRainState('unreachable');
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBusData(activeStopCode);
    fetchRainData();
  }, [activeStopCode, fetchBusData, fetchRainData]);

  // Refresh every 20 seconds, matching LTA update frequency
  useEffect(() => {
    const timer = setInterval(() => {
      fetchBusData(activeStopCode);
      fetchRainData();
    }, 20000);

    return () => clearInterval(timer);
  }, [activeStopCode, fetchBusData, fetchRainData]);

  // Handle stop code submission
  const handleShowBuses = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = stopCodeInput.trim();
    if (cleanCode.length > 0) {
      localStorage.setItem('catchMyBus.lastStopCode', cleanCode);
      setActiveStopCode(cleanCode);
      fetchBusData(cleanCode);
    }
  };

  // Quick switch when tapping a nearby bus stop
  const handleSelectNearbyStop = (nearbyCode: string) => {
    setStopCodeInput(nearbyCode);
    setActiveStopCode(nearbyCode);
    localStorage.setItem('catchMyBus.lastStopCode', nearbyCode);
    fetchBusData(nearbyCode);
  };

  // Check if a service is starred at the current stop
  const isStarred = (serviceNo: string) => {
    const existingStop = favourites.find((f) => f.stopCode === activeStopCode);
    return Boolean(existingStop?.services.includes(serviceNo));
  };

  // Format arrival times according to spec:
  // "0 means 'Arriving', showing 'Arriving' under one minute, and showing a plain sentence when a service has no buses running"
  const formatArrivals = (next: number[]) => {
    if (!next || next.length === 0) {
      return SENTENCES.FAVOURITES.savedBusNotRunning;
    }

    const parts = next.slice(0, 2).map((min) => {
      if (min <= 0) {
        return <span key={min} className="arrival-pill">Arriving</span>;
      }
      return `${min} min`;
    });

    if (parts.length === 1) {
      return parts[0];
    }

    return (
      <>
        {parts[0]}, {parts[1]}
      </>
    );
  };

  return (
    <div className="main-content" id="live-arrivals-screen">
      {/* 5-digit bus stop code input with "Show buses" button */}
      <section className="search-card" id="stop-search-card">
        <form onSubmit={handleShowBuses}>
          <label htmlFor="bus-stop-code" className="input-label">
            Bus stop code
          </label>
          <div className="input-group">
            <input
              type="text"
              id="bus-stop-code"
              className="stop-code-input"
              value={stopCodeInput}
              onChange={(e) => setStopCodeInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="01039"
              maxLength={5}
              pattern="[0-9]{5}"
              inputMode="numeric"
              aria-label="5-digit bus stop code"
            />
            <button type="submit" className="primary-btn" id="show-buses-btn">
              Show buses
            </button>
          </div>
        </form>
      </section>

      {/* Item (2): Nearby Bus Stops */}
      {currentStopInfo.nearbyStops && currentStopInfo.nearbyStops.length > 0 && (
        <section className="nearby-stops-card" id="nearby-stops-section" aria-label="Nearby bus stops">
          <div className="nearby-header">
            <h3 className="nearby-heading">Nearby Bus Stops</h3>
            <span className="nearby-hint">Tap to view</span>
          </div>
          <div className="nearby-stops-list" id="nearby-stops-list">
            {currentStopInfo.nearbyStops.map((nearby) => (
              <button
                key={nearby.stopCode}
                type="button"
                className="nearby-stop-chip"
                onClick={() => handleSelectNearbyStop(nearby.stopCode)}
                id={`nearby-stop-${nearby.stopCode}`}
              >
                <div className="nearby-chip-top">
                  <span className="nearby-badge">{nearby.stopCode}</span>
                  {nearby.distanceText && (
                    <span className="nearby-dist">{nearby.distanceText}</span>
                  )}
                </div>
                <div className="nearby-chip-desc">{nearby.description}</div>
                <div className="nearby-chip-road">{nearby.roadName}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Bus Services Panel with Item (1) Location Description */}
      <section className="services-panel" id="services-panel">
        <div className="panel-header">
          <div className="panel-header-main">
            <div className="panel-header-tag">
              <span className="panel-stop-num">Stop {activeStopCode}</span>
            </div>
            {/* Item (1): Description of the location of the bus stop code */}
            <h2 className="panel-stop-desc" id="current-stop-description">
              {currentStopInfo.description}
            </h2>
            <div className="panel-stop-road" id="current-stop-road">
              {currentStopInfo.roadName}
            </div>
          </div>
          <span className="refresh-indicator">Refreshes every 20s</span>
        </div>

        {/* States according to item 5 */}
        {busState === 'loading' && (
          <div className="status-banner loading" id="bus-loading-state" style={{ margin: '14px' }}>
            {SENTENCES.BUS.loading}
          </div>
        )}

        {busState === 'empty' && (
          <div className="status-banner empty" id="bus-empty-state" style={{ margin: '14px' }}>
            {SENTENCES.BUS.empty}
          </div>
        )}

        {busState === 'refused' && (
          <div className="status-banner error" id="bus-refused-state" style={{ margin: '14px' }}>
            {SENTENCES.BUS.refused}
          </div>
        )}

        {busState === 'unreachable' && (
          <div className="status-banner error" id="bus-unreachable-state" style={{ margin: '14px' }}>
            {SENTENCES.BUS.unreachable}
          </div>
        )}

        {busState === 'not_found' && (
          <div className="status-banner error" id="bus-not-found-state" style={{ margin: '14px' }}>
            {SENTENCES.FAVOURITES.stopCodeNotFound}
          </div>
        )}

        {busState === 'success' && busData && (
          <ul className="services-list" id="bus-services-list">
            {busData.services.map((svc) => {
              const starred = isStarred(svc.serviceNo);
              return (
                <li key={svc.serviceNo} className="service-row" id={`service-row-${svc.serviceNo}`}>
                  <div className="service-main">
                    <span className="service-badge">{svc.serviceNo}</span>
                    <span className="service-arrivals">
                      {formatArrivals(svc.next)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`star-btn ${starred ? 'starred' : ''}`}
                    onClick={() =>
                      onToggleFavourite(
                        activeStopCode,
                        svc.serviceNo,
                        selectedArea,
                        currentStopInfo.description
                      )
                    }
                    aria-label={
                      starred
                        ? `Remove service ${svc.serviceNo} from favourites`
                        : `Add service ${svc.serviceNo} to favourites`
                    }
                    title={starred ? 'Starred in favourites' : 'Star this bus'}
                    id={`star-btn-${svc.serviceNo}`}
                  >
                    {starred ? '★' : '☆'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Weather Panel */}
      <WeatherPanel
        rainData={rainData}
        selectedArea={selectedArea}
        onSelectArea={setSelectedArea}
        fetchState={rainState}
        idPrefix="live"
      />
    </div>
  );
};
