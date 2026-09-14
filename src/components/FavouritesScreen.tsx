import React, { useState, useEffect, useCallback } from 'react';
import { FavouriteStop, BusArrivalData, RainData, FetchState, SENTENCES } from '../types.ts';
import { getBus, getRain } from '../data.js';
import { WeatherPanel } from './WeatherPanel.tsx';

interface FavouritesScreenProps {
  favourites: FavouriteStop[];
  onUpdateFavourites: (updated: FavouriteStop[]) => void;
}

export const FavouritesScreen: React.FC<FavouritesScreenProps> = ({
  favourites,
  onUpdateFavourites,
}) => {
  // Collapsed by default (one at a time)
  const [expandedStopCode, setExpandedStopCode] = useState<string | null>(null);

  // Bus data per stop code: { [stopCode]: { data: BusArrivalData | null, state: FetchState } }
  const [stopsData, setStopsData] = useState<
    Record<string, { data: BusArrivalData | null; state: FetchState }>
  >({});

  const [rainData, setRainData] = useState<RainData | null>(null);
  const [rainState, setRainState] = useState<FetchState>('loading');

  // Stop being renamed: stopCode -> editing name
  const [editingStopCode, setEditingStopCode] = useState<string | null>(null);
  const [tempStopName, setTempStopName] = useState<string>('');

  // Fetch rain data (shared across all areas)
  const fetchRain = useCallback(async () => {
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
      const code = err?.code;
      if (code === 'refused') {
        setRainState('refused');
      } else {
        setRainState('unreachable');
      }
    }
  }, []);

  // Fetch bus arrivals for all favourite stops
  const fetchAllFavouritesBuses = useCallback(async () => {
    if (favourites.length === 0) return;

    // Set all to loading initially
    setStopsData((prev) => {
      const nextMap = { ...prev };
      favourites.forEach((fav) => {
        nextMap[fav.stopCode] = {
          data: prev[fav.stopCode]?.data || null,
          state: 'loading',
        };
      });
      return nextMap;
    });

    // Fetch each stop
    for (const fav of favourites) {
      try {
        const data = await getBus(fav.stopCode);
        setStopsData((prev) => ({
          ...prev,
          [fav.stopCode]: {
            data,
            state: !data || !data.services || data.services.length === 0 ? 'empty' : 'success',
          },
        }));
      } catch (err: any) {
        const code = err?.code;
        setStopsData((prev) => ({
          ...prev,
          [fav.stopCode]: {
            data: null,
            state: code === 'not_found' ? 'not_found' : code === 'refused' ? 'refused' : 'unreachable',
          },
        }));
      }
    }
  }, [favourites]);

  // Initial fetch and 20s auto-refresh while open
  useEffect(() => {
    fetchRain();
    fetchAllFavouritesBuses();

    const interval = setInterval(() => {
      fetchRain();
      fetchAllFavouritesBuses();
    }, 20000);

    return () => clearInterval(interval);
  }, [fetchRain, fetchAllFavouritesBuses]);

  // Card expansion toggle (one at a time)
  const toggleExpand = (stopCode: string) => {
    setExpandedStopCode((curr) => (curr === stopCode ? null : stopCode));
  };

  // Move up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const nextList = [...favourites];
    const item = nextList.splice(index, 1)[0];
    nextList.splice(index - 1, 0, item);
    onUpdateFavourites(nextList);
  };

  // Move down
  const handleMoveDown = (index: number) => {
    if (index >= favourites.length - 1) return;
    const nextList = [...favourites];
    const item = nextList.splice(index, 1)[0];
    nextList.splice(index + 1, 0, item);
    onUpdateFavourites(nextList);
  };

  // Start renaming
  const handleStartRename = (fav: FavouriteStop) => {
    setEditingStopCode(fav.stopCode);
    setTempStopName(fav.stopName);
  };

  // Save rename
  const handleSaveRename = (stopCode: string) => {
    const trimmed = tempStopName.trim();
    if (trimmed) {
      const updated = favourites.map((f) =>
        f.stopCode === stopCode ? { ...f, stopName: trimmed } : f
      );
      onUpdateFavourites(updated);
    }
    setEditingStopCode(null);
  };

  // Remove a single bus from favourite stop
  // "removing the last bus removes the card"
  const handleRemoveBus = (stopCode: string, serviceNo: string) => {
    const stop = favourites.find((f) => f.stopCode === stopCode);
    if (!stop) return;

    const remainingServices = stop.services.filter((s) => s !== serviceNo);

    if (remainingServices.length === 0) {
      // Removing the last bus removes the card entirely
      const nextList = favourites.filter((f) => f.stopCode !== stopCode);
      onUpdateFavourites(nextList);
      if (expandedStopCode === stopCode) {
        setExpandedStopCode(null);
      }
    } else {
      const nextList = favourites.map((f) =>
        f.stopCode === stopCode ? { ...f, services: remainingServices } : f
      );
      onUpdateFavourites(nextList);
    }
  };

  // Change weather area for a specific favourite stop
  const handleChangeStopArea = (stopCode: string, newArea: string) => {
    const nextList = favourites.map((f) =>
      f.stopCode === stopCode ? { ...f, area: newArea } : f
    );
    onUpdateFavourites(nextList);
  };

  // Generate the collapsed one-line summary:
  // "Home · 01039 · next: 7 in 4 min · Showers"
  const getCollapsedSummary = (fav: FavouriteStop) => {
    const stopEntry = stopsData[fav.stopCode];
    const weatherArea = rainData?.areas.find(
      (a) => a.area.toLowerCase() === fav.area.toLowerCase()
    );
    const weatherWord = weatherArea ? weatherArea.forecast : 'Weather pending';

    if (!stopEntry || stopEntry.state === 'loading') {
      return `${fav.stopName} · ${fav.stopCode} · next: checking... · ${weatherWord}`;
    }

    if (stopEntry.state === 'not_found') {
      return `${fav.stopName} · ${fav.stopCode} · Stop code not found · ${weatherWord}`;
    }

    if (stopEntry.state === 'refused' || stopEntry.state === 'unreachable') {
      return `${fav.stopName} · ${fav.stopCode} · Arrival unavailable · ${weatherWord}`;
    }

    const availableServices = stopEntry.data?.services || [];

    // Find soonest among the starred services
    let soonestBus: { serviceNo: string; min: number } | null = null;

    fav.services.forEach((serviceNo) => {
      const svc = availableServices.find((s) => s.serviceNo === serviceNo);
      if (svc && svc.next && svc.next.length > 0) {
        const firstMin = svc.next[0];
        if (soonestBus === null || firstMin < soonestBus.min) {
          soonestBus = { serviceNo, min: firstMin };
        }
      }
    });

    let nextBusStr = 'None running';
    if (soonestBus !== null) {
      if ((soonestBus as { serviceNo: string; min: number }).min <= 0) {
        nextBusStr = `${(soonestBus as { serviceNo: string; min: number }).serviceNo} Arriving`;
      } else {
        nextBusStr = `${(soonestBus as { serviceNo: string; min: number }).serviceNo} in ${(soonestBus as { serviceNo: string; min: number }).min} min`;
      }
    }

    return `${fav.stopName} · ${fav.stopCode} · next: ${nextBusStr} · ${weatherWord}`;
  };

  // Format arrival text for an individual starred bus row in expanded view
  const formatBusArrivals = (stopCode: string, serviceNo: string) => {
    const entry = stopsData[stopCode];

    if (!entry || entry.state === 'loading') {
      return SENTENCES.BUS.loading;
    }

    if (entry.state === 'not_found') {
      return SENTENCES.FAVOURITES.stopCodeNotFound;
    }

    if (entry.state === 'refused') {
      return SENTENCES.BUS.refused;
    }

    if (entry.state === 'unreachable') {
      return SENTENCES.BUS.unreachable;
    }

    const svc = entry.data?.services.find((s) => s.serviceNo === serviceNo);

    if (!svc || !svc.next || svc.next.length === 0) {
      return SENTENCES.FAVOURITES.savedBusNotRunning;
    }

    const arrivals = svc.next.slice(0, 2).map((m) => {
      if (m <= 0) {
        return <span key={m} className="arrival-pill">Arriving</span>;
      }
      return `${m} min`;
    });

    if (arrivals.length === 1) return arrivals[0];
    return <>{arrivals[0]}, {arrivals[1]}</>;
  };

  // Empty state when nothing is saved yet
  if (favourites.length === 0) {
    return (
      <div className="main-content" id="favourites-screen">
        <div className="status-banner empty" id="no-favourites-sentence">
          {SENTENCES.FAVOURITES.noFavourites}
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" id="favourites-screen">
      <div className="favourites-list" id="favourites-card-list">
        {favourites.map((fav, index) => {
          const isExpanded = expandedStopCode === fav.stopCode;
          const isEditing = editingStopCode === fav.stopCode;

          return (
            <article
              key={fav.stopCode}
              className={`fav-card ${isExpanded ? 'expanded' : ''}`}
              id={`fav-card-${fav.stopCode}`}
            >
              {/* Collapsed One-Line Button (tap to expand) */}
              <button
                type="button"
                className="fav-summary-btn"
                onClick={() => toggleExpand(fav.stopCode)}
                aria-expanded={isExpanded}
                id={`fav-summary-btn-${fav.stopCode}`}
              >
                <span className="fav-summary-line">{getCollapsedSummary(fav)}</span>
                <span className="expand-chevron" aria-hidden="true">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              {/* Expanded Card Body (one at a time) */}
              {isExpanded && (
                <div className="fav-expanded-body" id={`fav-expanded-${fav.stopCode}`}>
                  {/* Card Toolbar: Rename + Move Up / Move Down */}
                  <div className="fav-card-toolbar">
                    {isEditing ? (
                      <div className="rename-container">
                        <input
                          type="text"
                          className="rename-input"
                          value={tempStopName}
                          onChange={(e) => setTempStopName(e.target.value)}
                          placeholder="e.g. Home"
                          autoFocus
                          id={`rename-input-${fav.stopCode}`}
                        />
                        <button
                          type="button"
                          className="rename-btn"
                          onClick={() => handleSaveRename(fav.stopCode)}
                          id={`save-rename-btn-${fav.stopCode}`}
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="move-btn"
                        onClick={() => handleStartRename(fav)}
                        id={`start-rename-btn-${fav.stopCode}`}
                      >
                        Rename stop
                      </button>
                    )}

                    {/* Move order controls */}
                    <div className="order-controls">
                      <button
                        type="button"
                        className="move-btn"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        aria-label="Move stop up"
                        title="Move up"
                        id={`move-up-btn-${fav.stopCode}`}
                      >
                        ▲ Up
                      </button>
                      <button
                        type="button"
                        className="move-btn"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === favourites.length - 1}
                        aria-label="Move stop down"
                        title="Move down"
                        id={`move-down-btn-${fav.stopCode}`}
                      >
                        ▼ Down
                      </button>
                    </div>
                  </div>

                  {/* List of every starred bus at this stop */}
                  <div className="fav-buses-list" id={`fav-buses-list-${fav.stopCode}`}>
                    {fav.services.map((svcNo) => (
                      <div
                        key={svcNo}
                        className="fav-bus-row"
                        id={`fav-bus-row-${fav.stopCode}-${svcNo}`}
                      >
                        <div className="fav-bus-info">
                          <span className="service-badge">{svcNo}</span>
                          <span className="service-arrivals">
                            {formatBusArrivals(fav.stopCode, svcNo)}
                          </span>
                        </div>

                        {/* Remove (×) button on each saved bus */}
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => handleRemoveBus(fav.stopCode, svcNo)}
                          aria-label={`Remove bus ${svcNo} from ${fav.stopName}`}
                          title={`Remove bus ${svcNo}`}
                          id={`remove-bus-${fav.stopCode}-${svcNo}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Weather panel for the area chosen for this stop */}
                  <WeatherPanel
                    rainData={rainData}
                    selectedArea={fav.area || 'City'}
                    onSelectArea={(newArea) => handleChangeStopArea(fav.stopCode, newArea)}
                    fetchState={rainState}
                    idPrefix={`fav-${fav.stopCode}`}
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
