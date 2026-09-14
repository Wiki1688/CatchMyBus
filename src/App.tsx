import React, { useState, useEffect } from 'react';
import { FavouriteStop } from './types.ts';
import { SIMULATION_FLAG, setSimulationFlag } from './data.js';
import { GreetingHeader } from './components/GreetingHeader.tsx';
import { NameModal } from './components/NameModal.tsx';
import { LiveArrivalsScreen } from './components/LiveArrivalsScreen.tsx';
import { FavouritesScreen } from './components/FavouritesScreen.tsx';
import { TabBar, ScreenTab } from './components/TabBar.tsx';
import { LicenseFooter } from './components/LicenseFooter.tsx';

export default function App() {
  // Screen tab state: 'live' or 'favourites'
  const [activeTab, setActiveTab] = useState<ScreenTab>('live');

  // User's first name, stored in localStorage under 'catchMyBus.name'
  const [name, setName] = useState<string>(() => {
    return localStorage.getItem('catchMyBus.name') || '';
  });
  const [showNameModal, setShowNameModal] = useState<boolean>(() => {
    return !localStorage.getItem('catchMyBus.name');
  });

  // Favourites, stored under 'catchMyBus.favourites'
  const [favourites, setFavourites] = useState<FavouriteStop[]>(() => {
    try {
      const stored = localStorage.getItem('catchMyBus.favourites');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore parse error
    }
    return [];
  });

  // Simulation mode state for testing item 5 sentences
  const [activeSimulation, setActiveSimulation] = useState<string>(SIMULATION_FLAG);

  // Save name handler
  const handleSaveName = (newName: string) => {
    localStorage.setItem('catchMyBus.name', newName);
    setName(newName);
    setShowNameModal(false);
  };

  // Update favourites handler
  const handleUpdateFavourites = (updated: FavouriteStop[]) => {
    setFavourites(updated);
    localStorage.setItem('catchMyBus.favourites', JSON.stringify(updated));
  };

  // Toggle favourite bus at a stop from Screen 1
  const handleToggleFavourite = (stopCode: string, serviceNo: string, currentArea: string) => {
    const existingIndex = favourites.findIndex((f) => f.stopCode === stopCode);

    if (existingIndex >= 0) {
      const existingStop = favourites[existingIndex];
      const hasService = existingStop.services.includes(serviceNo);

      if (hasService) {
        // Remove service
        const remainingServices = existingStop.services.filter((s) => s !== serviceNo);
        if (remainingServices.length === 0) {
          // Removing the last bus removes the card
          const nextList = favourites.filter((f) => f.stopCode !== stopCode);
          handleUpdateFavourites(nextList);
        } else {
          const nextList = favourites.map((f) =>
            f.stopCode === stopCode ? { ...f, services: remainingServices } : f
          );
          handleUpdateFavourites(nextList);
        }
      } else {
        // Add service
        const nextList = favourites.map((f) =>
          f.stopCode === stopCode
            ? { ...f, services: [...f.services, serviceNo] }
            : f
        );
        handleUpdateFavourites(nextList);
      }
    } else {
      // New stop card
      const newStop: FavouriteStop = {
        stopCode,
        stopName: stopCode, // defaults to stopCode until renamed
        area: currentArea || 'City',
        services: [serviceNo],
      };
      handleUpdateFavourites([...favourites, newStop]);
    }
  };

  // Switch simulation flag for easy verification of item 5 sentences
  const handleSimChange = (flag: string) => {
    setSimulationFlag(flag);
    setActiveSimulation(flag);
    // Force re-render of active screen
    setActiveTab((prev) => prev);
  };

  return (
    <div className="app-container" id="app-root-container">
      {/* First-time first name prompt */}
      {showNameModal && (
        <NameModal
          currentName={name}
          onSaveName={handleSaveName}
          onCancel={name ? () => setShowNameModal(false) : undefined}
        />
      )}

      {/* Greeting by name and time of day at top of both screens */}
      {name && (
        <GreetingHeader
          name={name}
          onEditName={() => setShowNameModal(true)}
        />
      )}

      {/* Screen 1: Live Bus Arrivals */}
      {activeTab === 'live' && (
        <LiveArrivalsScreen
          key={`live-${activeSimulation}`}
          favourites={favourites}
          onToggleFavourite={handleToggleFavourite}
        />
      )}

      {/* Screen 2: My Favourites */}
      {activeTab === 'favourites' && (
        <FavouritesScreen
          key={`fav-${activeSimulation}`}
          favourites={favourites}
          onUpdateFavourites={handleUpdateFavourites}
        />
      )}

      {/* Simulation Mode Switcher to verify all Item 5 sentences */}
      <div className="main-content" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <aside className="dev-sim-box" id="dev-sim-box" aria-label="Test states">
          <div className="dev-sim-title">Test item 5 states (flag in src/data.js):</div>
          <div className="dev-sim-buttons">
            {[
              { id: 'normal', label: 'Normal' },
              { id: 'empty', label: 'Empty' },
              { id: 'refused', label: 'Refused' },
              { id: 'unreachable', label: 'Unreachable' },
              { id: 'not_running', label: 'Not running' },
              { id: 'not_found', label: 'Not found' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`dev-sim-btn ${activeSimulation === item.id ? 'active' : ''}`}
                onClick={() => handleSimChange(item.id)}
                id={`sim-btn-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* Mandatory licensing footer */}
      <LicenseFooter />

      {/* Fixed bottom two-tab bar */}
      <TabBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        favouritesCount={favourites.length}
      />
    </div>
  );
}
