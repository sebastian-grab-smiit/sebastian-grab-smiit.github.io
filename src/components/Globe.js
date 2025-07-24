import React, { useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import '../styles/Globe.css';

export default function GlobeViz({ projects }) {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    // map projects to { lat, lng, size } and filter out missing coords
    setPoints(
      projects
        .map((p) => ({
          lat: p.coords.lat,
          lng: p.coords.lng,
          size: 0.5,
          title: p.role,        // tooltip title on hover
        }))
        .filter((pt) => pt.lat != null && pt.lng != null)
    );
  }, [projects]);


  const accent = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent-1')
    .trim() || '#00ffd1';

  return (
    <div className="globe-wrapper">
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundColor="transparent"
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointAltitude="size"
        pointColor= {() => accent}
        pointLabel="title"           /* shows your project role on hover */
        // if you want to set a custom camera POV on load:
        pointOfView={{ lat: 0, lng: 0, altitude: 2 }}
      />
    </div>
  );
}
