# tpov_extract_visu

This is a tool to visualize JSON files created by tpov_extract on a map.

tpov_extract extracts transit route data from a variety of sources and saves it as a relatively standardised JSON file. It is a part of the [tpov](https://github.com/CyrilSLi/tpov) project, a suite of tools to create transit POV / timelapse videos.

## Installation

`npm install tpov_extract_visu`

## Usage

`tpovev <path to JSON file>`

This will serve a page at `http://localhost:5033` which displays the map and data on two resizable panes. ([_why 5033?_](https://railwaymeme.fandom.com/zh/wiki/5033))

The three buttons on the top left corner are for viewing the entire file, the list of stops, and the shape of the route.

Click on a stop marker, the stop line, or the shape line to view details. By default the stop line (which simply connects the stops) is hidden if the shape line (which follows the actual route) is available. Select which lines to display on the top right corner.

Run `tpovev examples/99.json` to see an example (of the 99 B-Line in Vancouver).