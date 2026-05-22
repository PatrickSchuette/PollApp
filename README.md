# 📘 PollApp

This project was generated using the [Angular CLI](https://github.com/angular/angular-cli) version 21.2.7.

## 📌 Overview

PollApp is a dynamic survey and voting application built with **Angular 21**, **Supabase**, and **SCSS**. 
Users can create surveys, add questions with custom options, vote in real time, and view aggregated results instantly.

The project was developed as part of a training module and demonstrates:
- **Angular Standalone Components** architecture.
- **Angular Signals** for reactive state management.
- **Supabase** integration (PostgreSQL + Realtime replication).
- **Secure input handling** using DOMPurify.
- **Custom deployment** configuration via `baseHref`.
- **Modern asset handling** utilizing the `public/` folder.

## 🚀 Features

- **Dynamic Survey Creation:** Build surveys with multiple custom questions.
- **Flexible Voting:** Full support for both single-choice and multiple-choice options.
- **Real-Time Updates:** Instant vote counting and live results via WebSockets.
- **Smart Data Aggregation:** Automated result calculation with percentage visualisations.
- **Organised Categories:** Built-in category filtering system.
- **Urgency Indicators:** "Ending Soon" progress bars for active surveys.
- **XSS Protection:** Input sanitisation on all user-generated content.
- **Clean Architecture:** Modular, scalable, and maintainable Angular codebase.

## 📦 Installation & Setup

1. Install the required dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   ```🌐
   http://localhost:4200
   ```

## 🌐 Deployment Configuration

The project uses a custom base path for production deployments:
```json
"baseHref": "/angular-projects/PollApp/"
```
This is configured inside the `angular.json` file under the production target.

### Build Command
To build the project for production, run:
```bash
ng build
```
- **Output directory:** `dist/poll-app/`
- **Deployment requirement:** The application must be hosted under the `/angular-projects/PollApp/` subdirectory.

## 🗂️ Supabase Setup

The application initialises the Supabase client inside `src/app/shared/services/supabase.services.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

this.supabase = createClient(
  'https://yourURL.supabase.co',
  'PublicKey'
);
```

### 🛢️ Database Schema

<img width="1536" height="1024" alt="supabas table" src="https://github.com/user-attachments/assets/c97179ad-c080-4e90-98b8-f679ffd59ecf" />

Create the following relational tables in your Supabase PostgreSQL database:

```sql
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  enddate DATE,
  isfinished BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INT,
  created_at TIMESTAMP DEFAULT now(),
  allow_multiple BOOLEAN DEFAULT false
);

CREATE TABLE options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  position INT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  question_index INT,
  selected_options TEXT[],
  question_text TEXT,
  answer_text TEXT,
  vote_count INT DEFAULT 1
);
```

## 🔒 Security — DOMPurify

To prevent Cross-Site Scripting (XSS) and HTML/JS injection attacks, the project uses **DOMPurify**. 

Input sanitisation is strictly enforced during survey creation for titles, descriptions, question texts, and option texts:

```typescript
import DOMPurify from 'dompurify';

const safeInput = DOMPurify.sanitize(userInput);
```
*Note: If unsafe content or malicious scripts are detected, the application automatically blocks the publishing process and triggers an error dialogue.*

## 🖼️ Assets & Public Folder

The project uses the modern Angular `public/` directory structure for managing static assets:
- Images: `public/assets/img/`
- Fonts: `public/assets/fonts/`

### Configuration (`angular.json`)
```json
"assets": [
  {
    "glob": "**/*",
    "input": "public",
    "output": "/"
  }
]
```

### Usage
Assets are referenced globally using absolute paths:
```scss
background-image: url("/assets/img/delete.svg");
```

## 🧪 Running Tests

To execute the unit tests via Karma/Jasmine, run:
```bash
ng test
```

## 📄 License

This project is part of a training program and is strictly intended for educational and instructional use.
