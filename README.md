# Quizzee Trivia 🧠

A modern, interactive trivia quiz application built with **Next.js 15** and styled with **Tailwind CSS 4**. Test your knowledge across multiple categories and difficulty levels with questions sourced from the Open Trivia Database.

![Quizzee Trivia Logo](./public/images/logo.png)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [How It Works — Step by Step](#how-it-works--step-by-step)
- [Project Structure](#project-structure)
- [Page-by-Page Breakdown](#page-by-page-breakdown)
  - [Home Page — Quiz Configuration](#1-home-page--quiz-configuration)
  - [Quiz Page — Answering Questions](#2-quiz-page--answering-questions)
  - [Results Page — Score & Review](#3-results-page--score--review)
- [Key Features Explained](#key-features-explained)
  - [State Management with LocalStorage](#state-management-with-localstorage)
  - [API Integration & Fallback Strategy](#api-integration--fallback-strategy)
  - [Rate-Limit Handling (Exponential Backoff)](#rate-limit-handling-exponential-backoff)
  - [HTML Entity Decoding](#html-entity-decoding)
  - [Answer Shuffling](#answer-shuffling)
- [Running the App](#running-the-app)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)

---

## Overview

Quizzee Trivia is a single-page application (SPA) built on the Next.js App Router. It presents users with a configurable trivia quiz experience:

1. **Choose** your quiz preferences (category, difficulty, number of questions).
2. **Answer** multiple-choice questions one at a time.
3. **Review** your final score and go through each question to see which answers were right or wrong.

All quiz configuration and results are persisted in the browser's **localStorage** — no backend server, no database, no API key required.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 15** (App Router) | React framework for routing, SSR/SSG, and optimized builds |
| **React 19** | UI component library |
| **Tailwind CSS 4** | Utility-first CSS framework for styling |
| **Open Trivia Database (OpenTDB)** | Free, no-auth public API providing trivia questions |
| **localStorage (Web API)** | Client-side persistence for quiz config and results |
| **Vercel** | Recommended deployment platform |

Dependencies are minimal — no external state management (Redux, Zustand), no UI component libraries, no HTTP client libraries. The app uses the built-in `fetch` API and React's built-in `useState` / `useEffect` hooks.

---

## How It Works — Step by Step

### User Flow

```
Home Page (Configuration)
        │
        ▼  (click "Start Quiz")
Quiz Page (Answer Questions)
        │
        ▼  (all questions answered)
Results Page (Score + Review)
```

### Data Flow

```
User configures quiz  ──►  localStorage.setItem("quizConfig")
                                   │
                                   ▼
                          Quiz Page reads config
                                   │
                                   ▼
                    Fetch questions from OpenTDB API
                                   │
                        ┌──────────┴──────────┐
                        ▼                     ▼
                   Success?               Failed?
                        │                     │
                        ▼                     ▼
               Render questions        Use fallback questions
                        │                     │
                        ▼                     ▼
                 User answers all     (same flow continues)
                        │
                        ▼
            Save results to localStorage
                        │
                        ▼
              Redirect to Results Page
```

---

## Project Structure

```
quizee_next_vercel/
├── public/
│   ├── images/logo.png         # App logo
│   ├── file.svg, globe.svg, ... # Default Next.js assets
├── src/
│   ├── app/
│   │   ├── globals.css          # Global Tailwind styles
│   │   ├── layout.js            # Root layout (fonts, HTML wrapper)
│   │   ├── page.js              # Home page — quiz configuration
│   │   ├── favicon.ico
│   │   ├── quiz/
│   │   │   └── page.js          # Quiz page — question answering
│   │   └── results/
│   │       └── page.js          # Results page — score & review
│   ├── components/
│   │   ├── QuizForm.jsx         # Form for selecting quiz preferences
│   │   ├── QuizQuestion.jsx     # Individual question card with answer buttons
│   │   ├── ScoreCard.jsx        # Final score display
│   │   └── ResultsList.jsx      # Detailed question-by-question review
│   ├── hooks/
│   │   └── useLocalStorage.js   # Custom hook for localStorage (not yet used)
│   └── lib/
│       └── utils.js             # Utility functions (shuffle, decodeHTML)
├── jsconfig.json                # Path alias (@/ → ./src/)
├── next.config.mjs              # Next.js configuration
├── package.json                 # Dependencies and scripts
├── postcss.config.mjs           # PostCSS / Tailwind configuration
└── README.md
```

---

## Page-by-Page Breakdown

### 1. Home Page — Quiz Configuration

**Route:** `/`  
**Component:** [`src/app/page.js`](./src/app/page.js)  
**Sub-component:** [`src/components/QuizForm.jsx`](./src/components/QuizForm.jsx)

The home page renders a centered form that lets the user configure three settings:

- **Category** — Dropdown with 12 options (Any Category, General Knowledge, Film, Music, Science & Nature, Computers, Mathematics, Sports, Geography, History, etc.). Each option maps to an OpenTDB category ID.
- **Difficulty** — Easy, Medium, or Hard.
- **Number of Questions** — Numeric input from 1 to 50.

When the user clicks **"Start Quiz"**, the form:

1. Constructs the appropriate OpenTDB API URL based on the selected category and difficulty. If "Any Category" is selected, the `category` parameter is omitted from the URL.
2. Validates the API endpoint by making a **test fetch** to confirm it returns a valid response (`response_code === 0`). If the API is unreachable or returns an error, the user sees an alert message explaining the failure.
3. On success, the entire quiz configuration (including the constructed API URL) is saved to **localStorage** under the key `quizConfig`.
4. The user is then **redirected** to the `/quiz` page via `router.push('/quiz')`.

### 2. Quiz Page — Answering Questions

**Route:** `/quiz`  
**Component:** [`src/app/quiz/page.js`](./src/app/quiz/page.js)  
**Sub-component:** [`src/components/QuizQuestion.jsx`](./src/components/QuizQuestion.jsx)

This is the core gameplay page. It performs several tasks in sequence:

#### Loading Questions

On mount, the page reads `quizConfig` from localStorage. If no config exists, it defaults to fetching 10 questions of any type. It then constructs the API URL (appending a timestamp to avoid browser caching) and fetches questions from OpenTDB.

**API Contract:**

OpenTDB returns questions in this shape:

```
{
  response_code: 0,
  results: [
    {
      category: "Science: Computers",
      question: "What does CPU stand for?",
      correct_answer: "Central Processing Unit",
      incorrect_answers: ["Central Process Unit", "..."],
      difficulty: "easy"
    },
    ...
  ]
}
```

#### Fallback Mechanism

If the API call fails for any reason (network error, rate limit, empty results), the page falls back to a hardcoded set of 5 sample questions. This ensures the app is always functional, even offline. A yellow banner is shown at the top of the page indicating that sample questions are being used, along with the specific error message and a **Retry** button.

#### Rate-Limit Handling

OpenTDB enforces rate limiting with HTTP 429 responses. The quiz page implements **exponential backoff**: when a 429 is received, it waits 5 seconds, then 10 seconds, then 20 seconds before giving up. This is handled by the `fetchWithBackoff` function.

#### Answering Questions

Questions are rendered one at a time via the `QuizQuestion` component. For each question:

1. The correct answer and incorrect answers are combined into a single array.
2. The array is **shuffled** randomly so the correct answer appears in a different position each time.
3. The user sees 4 answer buttons. Clicking one:
   - **Disables all buttons** immediately to prevent double-clicks.
   - Highlights the correct answer in **green** and the selected wrong answer in **red** (if applicable).
   - After a **750ms delay**, moves to the next question.

#### Progress Tracking

A progress bar at the top shows the current question number out of the total, along with a running score count.

#### Completing the Quiz

When all questions are answered:

1. The final results (score, total questions, per-question answer details, and whether fallback was used) are saved to **localStorage** under `quizResults`.
2. The user is redirected to `/results`.

### 3. Results Page — Score & Review

**Route:** `/results`  
**Component:** [`src/app/results/page.js`](./src/app/results/page.js)  
**Sub-components:** [`src/components/ScoreCard.jsx`](./src/components/ScoreCard.jsx), [`src/components/ResultsList.jsx`](./src/components/ResultsList.jsx)

The results page reads the saved `quizResults` from localStorage. If no results are found (e.g., the user navigated directly to `/results`), they are redirected back to the home page.

The page has two views, toggled by a state variable:

#### Score Card View (default)

Displays:
- **"Quiz Results"** heading.
- The final score as a large fraction (e.g., **7 / 10**).
- Two buttons:
  - **"View Answers"** — switches to the detailed review list.
  - **"Play Again"** — navigates back to the home page to start a new quiz.

#### Detailed Review View

Shows every question the user answered, one per card:
- The question text (decoded from HTML entities).
- The user's selected answer (shown in red if wrong).
- The correct answer (shown in green).
- Cards are color-coded: **green border** for correct answers, **red border** for incorrect.

Two navigation buttons are available:
- **"Back"** — returns to the score card.
- **"New Quiz"** — navigates to the home page.

---

## Key Features Explained

### State Management with LocalStorage

The app uses the browser's `localStorage` API as its sole persistence mechanism. No server-side storage or database is involved.

| Storage Key | Content | Written By | Read By |
|---|---|---|---|
| `quizConfig` | `{ category, difficulty, amount, apiUrl }` | Home page → `localStorage.setItem()` | Quiz page → `localStorage.getItem()` |
| `quizResults` | `{ score, totalQuestions, answers[], usingFallback }` | Quiz page → `localStorage.setItem()` | Results page → `localStorage.getItem()` |

This approach means:
- Quiz settings and results are lost if the user clears browser data or switches devices.
- No backend or API key is needed.
- The app works fully offline after the initial page load.

> **Note:** The project includes a custom hook [`useLocalStorage.js`](./src/hooks/useLocalStorage.js) which is defined but not yet used. This hook would provide a more React-idiomatic way to sync state with localStorage (similar to `useState` but persisted). It could replace the direct `localStorage.getItem()` / `setItem()` calls in future iterations.

### API Integration & Fallback Strategy

All questions come from the **Open Trivia Database** at `https://opentdb.com/api.php`. Key characteristics:

- **No API key required** — the API is completely free and open.
- **No CORS issues** — the API supports cross-origin requests from browsers.
- **Parameters** — `amount`, `category`, `difficulty`, `type=multiple` (only multiple-choice), and `encode=url3986` (URL-encoded output).

The app follows a **fail-gracefully** philosophy:

1. **Primary path:** Fetch from OpenTDB. If successful and `response_code === 0`, use the API results.
2. **Fallback path:** If the API is unreachable, returns an error, or returns empty results, use a set of 5 hardcoded fallback questions.
3. **User visibility:** A yellow banner clearly indicates when fallback questions are active, displaying the specific error and offering a retry button.

### Rate-Limit Handling (Exponential Backoff)

OpenTDB enforces a rate limit of approximately 1 request per 5 seconds. If exceeded, it returns HTTP 429. The `fetchWithBackoff` function handles this:

1. On a 429 response, it waits for a delay period.
2. The delay starts at **5 seconds** and **doubles** with each retry (5s → 10s → 20s).
3. Up to **3 retries** are attempted before giving up.
4. This prevents the app from hammering the API and gives it the best chance of eventually receiving valid data.

### HTML Entity Decoding

Questions and answers from OpenTDB are encoded with HTML entities (e.g., `"` for double quotes, `&#039;` for apostrophes, `&` for ampersands). To display these properly, the utility function [`decodeHTML`](./src/lib/utils.js) converts encoded strings back to plain text using the browser's built-in DOM parsing.

However, the current implementation primarily uses React's `dangerouslySetInnerHTML` prop to render question text directly, which naturally handles HTML rendering. The `decodeHTML` function is available for cases where plain text (without HTML markup) is needed, such as for comparison logic or accessibility.

### Answer Shuffling

To ensure the correct answer isn't always in the same position, the [`shuffle`](./src/lib/utils.js) function implements the **Fisher-Yates algorithm** — an unbiased, O(n) shuffle that produces a uniformly random permutation. It creates a copy of the array to avoid mutating the original data.

---

## Running the App

### Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm**, **yarn**, **pnpm**, or **bun**

### Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Static Export (for GitHub Pages, etc.)

```bash
npm run export
```

This generates a fully static `out/` directory that can be deployed to any static hosting provider.

---

## Deployment

### Deploy to Vercel (Recommended)

The app is pre-configured for Vercel deployment. Connect your Git repository to [Vercel](https://vercel.com) and it will automatically detect the Next.js project and build it.

### Deploy to GitHub Pages

The `package.json` includes a deploy script:

```bash
npm run deploy
```

This builds the app as a static site and publishes it to the `gh-pages` branch. Make sure your repository settings have GitHub Pages enabled and pointed to the `gh-pages` branch.

---

## Environment Variables

The app does **not** require any environment variables. The OpenTDB API endpoint is hardcoded in the source. No API keys, secrets, or configuration is needed.

For future extensibility, potential environment variables could include:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Override the OpenTDB API URL (e.g., for a custom proxy) |
| `NEXT_PUBLIC_FALLBACK_ENABLED` | Toggle fallback questions on/off |

---

## License

This is an open-source project. Feel free to use, modify, and distribute it.
