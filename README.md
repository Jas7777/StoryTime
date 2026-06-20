# Gaze-Reactive Storybook

A hackathon MVP web app that lets users upload a book and read it page by page while a webcam-based gaze tracker estimates where they are looking. As the reader moves through the story, a side panel displays an ambient animation or illustration that matches the current page’s mood or theme.

Built for the UC Berkeley AI Hackathon, June 20–21, 2026.

## Features

* Upload a PDF, EPUB, or TXT book
* Parse and split the book into readable pages
* Navigate pages using next/previous buttons or arrow keys
* Calibrate webcam-based gaze tracking in-browser
* Estimate rough gaze zones: top, middle, or bottom
* Analyze page text using keyword-based theme detection
* Display matching animations such as snow, fire, rain, night, calm, or conflict
* Runs fully in the browser with no backend required for the MVP

## MVP Scope

This project focuses on a reliable 24-hour hackathon demo. The first version uses rule-based scene analysis instead of external AI APIs, making it faster, cheaper, and more dependable during a live presentation.

## Tech Stack

| Layer          | Tool                                     |
| -------------- | ---------------------------------------- |
| Frontend       | React                                    |
| Book Parsing   | pdf.js, epub.js, plain JavaScript        |
| Gaze Tracking  | MediaPipe Face Landmarker or WebGazer.js |
| Animations     | CSS, SVG, or Canvas                      |
| Scene Analysis | JavaScript keyword matching              |
| Hosting        | Local dev server                         |

## App Flow

1. User uploads a book file.
2. The app parses the file and splits it into pages.
3. User completes a 9-point webcam gaze calibration.
4. Reading view opens with text on one side and a visualization panel on the other.
5. As the user changes pages, the app detects the page theme and updates the animation.

## Project Architecture

```text
User Upload
   ↓
Book Ingestion
   ↓
Pagination UI
   ↓
Scene Analysis → Visualization Panel
   ↓
Gaze Tracking → Gaze Debug Indicator
```

## Scene Themes

The MVP uses keyword matching to classify page content into simple themes:

* Snow
* Fire
* Conflict
* Calm
* Night
* Rain
* Neutral

Each theme maps to a reusable visual preset.

## Gaze Tracking

The gaze tracker runs fully in-browser using webcam input. After calibration, it estimates broad gaze zones rather than exact word-level position. This keeps the app realistic and demo-friendly.

## Installation

```bash
git clone https://github.com/your-username/gaze-reactive-storybook.git
cd gaze-reactive-storybook
npm install
npm run dev
```

## Usage

1. Open the local development URL.
2. Upload a PDF, EPUB, or TXT file.
3. Complete the calibration step.
4. Read through the book using the navigation buttons.
5. Watch the side panel update based on the story content.

## Demo Goals

* Upload and parse a real book
* Navigate through multiple pages
* Show a working gaze-zone debug overlay
* Display animations that change with page themes
* Run fully in-browser without a backend

## Stretch Goals

* AI-generated scene summaries
* Custom AI-generated illustrations per page
* Better EPUB support
* More animation themes
* Gaze-based in-page interaction
* Save reading progress

