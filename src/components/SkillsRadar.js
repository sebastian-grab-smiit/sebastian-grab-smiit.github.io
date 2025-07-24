import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import '../styles/SkillsRadar.css';

export default function SkillsRadar({ skills }) {
    return (
        <RadarChart outerRadius={150} width={300} height={300} data={skills}>
        <PolarGrid />
        <PolarAngleAxis dataKey="name" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar dataKey="level" fill="var(--accent-1)" fillOpacity={0.6} />
        </RadarChart>
    );
}