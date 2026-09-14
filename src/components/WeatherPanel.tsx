import React from 'react';
import { RainData, FetchState, SENTENCES } from '../types.ts';
import { SG_WEATHER_AREAS } from '../data.js';

interface WeatherPanelProps {
  rainData: RainData | null;
  selectedArea: string;
  onSelectArea: (area: string) => void;
  fetchState: FetchState;
  idPrefix?: string;
}

export const WeatherPanel: React.FC<WeatherPanelProps> = ({
  rainData,
  selectedArea,
  onSelectArea,
  fetchState,
  idPrefix = 'main',
}) => {
  const currentAreaForecast = rainData?.areas.find(
    (a) => a.area.toLowerCase() === selectedArea.toLowerCase()
  );

  return (
    <section className="weather-panel" id={`${idPrefix}-weather-panel`}>
      <h2 className="weather-heading" id={`${idPrefix}-weather-heading`}>
        Forecast for the {selectedArea} area
      </h2>

      <div className="weather-select-group">
        <label htmlFor={`${idPrefix}-area-select`} className="input-label" style={{ fontSize: '16px' }}>
          Select forecast area:
        </label>
        <select
          id={`${idPrefix}-area-select`}
          className="area-dropdown"
          value={selectedArea}
          onChange={(e) => onSelectArea(e.target.value)}
        >
          {SG_WEATHER_AREAS.map((areaName) => (
            <option key={areaName} value={areaName}>
              {areaName}
            </option>
          ))}
        </select>
      </div>

      {fetchState === 'loading' && (
        <div className="status-banner loading" id={`${idPrefix}-rain-loading`}>
          {SENTENCES.RAIN.loading}
        </div>
      )}

      {fetchState === 'refused' && (
        <div className="status-banner error" id={`${idPrefix}-rain-refused`}>
          {SENTENCES.RAIN.refused}
        </div>
      )}

      {fetchState === 'unreachable' && (
        <div className="status-banner error" id={`${idPrefix}-rain-unreachable`}>
          {SENTENCES.RAIN.unreachable}
        </div>
      )}

      {fetchState === 'empty' && (
        <div className="status-banner empty" id={`${idPrefix}-rain-empty`}>
          {SENTENCES.RAIN.empty}
        </div>
      )}

      {fetchState === 'success' && currentAreaForecast && (
        <div className="weather-details" id={`${idPrefix}-weather-details`}>
          <div className="weather-condition" id={`${idPrefix}-weather-wording`}>
            {currentAreaForecast.forecast}
          </div>
          {rainData?.validPeriod && (
            <div className="weather-period" id={`${idPrefix}-weather-period`}>
              Valid: {rainData.validPeriod}
            </div>
          )}
          {rainData?.updatedAt && (
            <div className="weather-updated" id={`${idPrefix}-weather-updated`}>
              Last updated {rainData.updatedAt}
            </div>
          )}
        </div>
      )}

      {fetchState === 'success' && !currentAreaForecast && (
        <div className="status-banner empty">
          {SENTENCES.RAIN.empty}
        </div>
      )}
    </section>
  );
};
