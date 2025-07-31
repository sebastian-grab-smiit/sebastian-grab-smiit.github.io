import React from "react";
import DeckGL from "@deck.gl/react";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { Map } from "react-map-gl";

// Nutze eine kostenlose Mapbox Style-URL (keinen eigenen Key nötig!)
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  longitude: 10.5,
  latitude: 51.2,
  zoom: 5.6,
  pitch: 45,
  bearing: 10,
};

export default function ProjectsMap({ projects }) {
  const hexLayer = new HexagonLayer({
    id: "hex-layer",
    data: projects,
    getPosition: d => [d.longitude, d.latitude],
    radius: 18000,
    elevationScale: 1000,
    extruded: true,
    pickable: true,
    elevationRange: [0, 4000],
    opacity: 0.7,
    coverage: 0.85,
    getColorValue: points => points.length,
    getElevationValue: points => points.length,
  });

  return (
    <div style={{ width: "100%", height: "440px", borderRadius: "1.2rem", overflow: "hidden", margin: "2rem 0" }}>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[hexLayer]}
        style={{ width: '100%', height: '100%' }}
      >
        <Map
          StyleSpecification={MAP_STYLE}
        />
      </DeckGL>
    </div>
  );
}
