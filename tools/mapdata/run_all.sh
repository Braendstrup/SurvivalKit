#!/usr/bin/env bash
# Genskaber hele kortpakken fra rådata. Kræver: python3 med osmium, shapely, pyproj, scikit-image, scipy, numpy,
# Pillow, mapbox-vector-tile, pmtiles (se requirements.txt) samt internetadgang til download-kilderne.
set -euo pipefail
cd "$(dirname "$0")"
WORK="${1:-./work}"; mkdir -p "$WORK/raw"
PBF="$WORK/raw/denmark.osm.pbf"
[ -f "$PBF" ] || curl -fL -o "$PBF" https://download.openstreetmap.fr/extracts/europe/denmark.osm.pbf
python3 01_extract.py "$PBF" "$WORK"      # kommunegrænser -> region + bbox, udtræk af OSM
python3 03_dem.py "$WORK"                 # højdefliser (Terrarium) + højdemodel til kurver
python3 02_vector.py "$WORK"              # vektorfliser, højdekurver, søgeindeks
python3 04_manifest.py "$WORK" "$PBF" ../../app/map/pack
