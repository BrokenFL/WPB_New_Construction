# Future Skyline Sandbox

A Cesium + Vite prototype for testing proposed building massing against a real city context.

## What it does

- Renders a 3D city scene in the browser
- Uses Google Photorealistic 3D Tiles when `VITE_GOOGLE_MAPS_API_KEY` is present
- Falls back to Cesium OSM buildings when the Google key is missing
- Loads sample proposed towers that you can toggle, select, and inspect
- Includes saved camera views for skyline and street-level comparisons

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

3. Add credentials:

   - `VITE_GOOGLE_MAPS_API_KEY`
     Use this if you want Google's photorealistic 3D city tiles.
   - `VITE_CESIUM_ION_TOKEN`
     Optional, but recommended if you want Cesium World Terrain.

4. Start the dev server:

   ```bash
   npm run dev
   ```

## Replace the sample skyline studies

Edit [src/proposals.ts](/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/New Construction/src/proposals.ts) and change:

- scenario metadata
- camera viewpoints
- tower coordinates
- building width, depth, height, color, and phase

The current prototype uses rectangular massing volumes. The next upgrade path is to swap those boxes for real `.glb` building models or parcel footprints from GeoJSON.
