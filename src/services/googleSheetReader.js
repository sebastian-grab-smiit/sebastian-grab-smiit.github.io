// services/googleSheetReader.js
const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID
const GID_PERSONAL = process.env.REACT_APP_GOOGLE_SHEET_PERSONAL_GID
const GID_CERTIFICATES = process.env.REACT_APP_GOOGLE_SHEET_CERTIFICATES_GID
const GID_LANGUAGES = process.env.REACT_APP_GOOGLE_SHEET_LANGUAGES_GID
const GID_ACADEMICS = process.env.REACT_APP_GOOGLE_SHEET_ACADEMICS_GID
const GID_SKILLS = process.env.REACT_APP_GOOGLE_SHEET_SKILLS_GID
const GID_RESUME = process.env.REACT_APP_GOOGLE_SHEET_RESUME_GID
const GID_PROJECTS = process.env.REACT_APP_GOOGLE_SHEET_PROJECTS_GID

import Papa from 'papaparse';

function clean(cell) {
    return cell
        .replace(/^"+|"+$/g, '')
        .replace(/\r/g, '')
        .trim();
    }


if (!SHEET_ID) {
    throw new Error("Missing env var REACT_APP_GOOGLE_SHEET_ID");
}

export async function fetchSheetAsCsv(gid) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Fetch failed');
    const text = await res.text();
    const { data } = Papa.parse(text, {
        skipEmptyLines: true
    });
    return data.map(row => row.map(cell => clean(cell)));
}

export async function fetchPersonal() {
    const rows = await fetchSheetAsCsv(GID_PERSONAL);
    return rows.slice(1).map(r => ({
        language:           r[0],
        name:               r[1],
        job:                r[2],
        description:        r[3],
        address:            r[4],
        nationality:        r[5],
        email:              r[6],
        phone:              r[7],
        linkedInUrl:        r[8],
        imageUrl:           r[9],
    }));
}

export async function fetchCertificates() {
    const rows = await fetchSheetAsCsv(GID_CERTIFICATES);
    return rows.slice(1).map(r => ({
        language:           r[0],
        certificateName:    r[1],
        date:               new Date(r[2]),
        logoUrl:            r[3],
    }));
}

export async function fetchLanguages() {
    const rows = await fetchSheetAsCsv(GID_LANGUAGES);
    return rows.slice(1).map(r => ({
        language:       r[0],
        languageName:   r[1],
        level:          r[2],
        iconUrl:        r[3],
    }));
}

export async function fetchAcademics() {
    const rows = await fetchSheetAsCsv(GID_ACADEMICS);
    return rows.slice(1).map(r => ({
        language:       r[0],
        start:          new Date(r[1]),
        end:            new Date(r[2]),
        university:     r[3],
        logoUrl:        r[4],
        degree:         r[5],
        description:    r[6],
        grade:          parseFloat(r[7]),
    }));
}

export async function fetchSkills() {
    const rows = await fetchSheetAsCsv(GID_SKILLS);
    return rows.slice(1).map(r => ({
        language:   r[0],
        name:       r[1],
        level:      parseFloat(r[2]),
    }));
}

export async function fetchResume() {
    const rows = await fetchSheetAsCsv(GID_RESUME);
    return rows.slice(1).map(r => ({
        language:       r[0],
        start:          new Date(r[1]),
        end:            new Date(r[2]),
        company:        r[3],
        address:        r[4],
        logoUrl:        r[5],
        role:           r[6],
        description:    r[7],
        technologies:   r[8],
        sections:       r[9],
    }));
}

export async function fetchProjects() {
    const rows = await fetchSheetAsCsv(GID_PROJECTS);
    return rows.slice(1).map(r => ({
        language:       r[0],
        role:           r[1],
        description:    r[2],
        customer:       r[3],
        address:        r[4],
        logoUrl:        r[5],
        start:          new Date(r[6]),
        end:            new Date(r[7]),
        technologies:   r[8],
        sections:       r[9],
    }));
}