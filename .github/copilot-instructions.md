# Brain Cloud Dream Journal - Copilot Instructions

## Project Overview
A React/TypeScript dream journal app using Google Drive as a backend (via GAPI/GSI). Users record, search, and analyze dream entries stored in JSON files on their Google Drive.

## Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Bootstrap 5 + SCSS
- **Icons**: react-bootstrap-icons
- **Routing**: React Router v6
- **Date Handling**: Luxon (`DateTime`)
- **Google APIs**: `gapi-script` (GAPI v2/v3) + Google Identity Services (GSI)
- **Deployment**: Firebase Hosting

## Project Structure
```
src/
  App.tsx                  # Root: initializes GAPI, wraps AuthProvider + DataProvider
  api-google/
    auth.ts                # GAPI auth helpers (signIn, signOut, isSignedIn)
    AuthContext.ts         # React context for auth state
    AuthProvider.tsx       # Provides isSignedIn, signIn, signOut, userProfile
    DataContext.ts         # React context for drive data
    DataProvider.tsx       # Fetches/saves conf+data files; provides CRUD methods
    google.types.ts        # IGapiFile interface
  app/
    app.types.ts           # All shared types, enums, interfaces, constants
    app.enums.tsx          # MILD affirmation enums
    appmain.tsx            # App shell: routing, nav, modal wiring
    app-home.tsx           # Home tab: auth card, data file card, new entry button
    app-journal.tsx        # Journal tab: filterable entry table
    app-bedtime.tsx        # Bedtime tab: MILD, random lucids, goals, sign inventory
    app-explore.tsx        # Explore tab: tag/dream analytics and charts
    app-tags.tsx           # Tags tab
    app-search.tsx         # Search tab
    app-admin.tsx          # Admin tab (dev/maintenance utilities)
    app-import.tsx         # Import tab: parse + import legacy journal text
    modal-entry.tsx        # Modal for add/edit journal entries
    appdata.ts             # (legacy) appdata class - wraps googlegsi
    googlegsi.ts           # (legacy) googlegsi class - direct GAPI/GSI integration
    googlegsi.types.ts     # Types for googlegsi
    components/
      alert-gstat.tsx      # Google Drive status alert
      header-metrics.tsx   # Stats header shown across tabs
      table-entries.tsx    # Reusable journal entry table
      search-results.tsx   # Search result display
```

## Key Data Types (src/app/app.types.ts)
- `IDriveDataFile` — `{ id, entries: IJournalEntry[], modifiedTime, name, size }`
- `IDriveConfFile` — `{ id, dreamIdeas, lucidGoals, mildAffirs, tagTypeAW/CO/FO/AC }`
- `IJournalEntry` — `{ entryDate, bedTime, notesPrep, notesWake, dreams: IJournalDream[] }`
- `IJournalDream` — `{ title, notes, dreamSigns, dreamImages, isLucidDream }`
- `IConfMetaCats` — `{ title, bullets, iconName?, headClass?, bodyClass? }`

## Data Flow
1. `App.tsx` initializes GAPI via `initClient()`, then renders `AuthProvider` > `DataProvider` > `AppMain`
2. `AuthProvider` manages sign-in state using `gapi.auth2`
3. `DataProvider` fetches `dream-journal-conf.json` and `dream-journal.json` from Google Drive on auth
4. All tabs consume `DataContext` (`useContext(DataContext)`) for `driveDataFile`, `driveConfFile`, CRUD methods
5. `DataProvider.doSaveDataFile()` PATCHes the data file back to Drive using multipart upload

## Coding Conventions
- Functional components only; no class components in new code
- Each tab exports a single default function (e.g., `export default function TabHome(props: Props)`)
- Internal render helpers are named `renderXxx(): JSX.Element`
- Use `useContext(DataContext)` and `useContext(AuthContext)` for shared state — do not prop-drill
- Bootstrap utility classes for layout; avoid inline styles unless necessary
- `entryDate` is always `yyyy-MM-dd` (Luxon `DateTime` format)
- `bedTime` is always `HH:mm` (24-hour)
- Dream signs are lowercase, comma-separated strings in arrays
- File names: `app-<tab>.tsx` for tabs, `modal-<name>.tsx` for modals, `<name>.tsx` for components

## Environment Variables (.env)
```
VITE_GDRIVE_CLIENT_ID=...
VITE_GDRIVE_API_KEY=...
```
Access via `import.meta.env.VITE_*`

## Google Drive Files
- `dream-journal-conf.json` — app configuration (goals, ideas, tag types)
- `dream-journal.json` — all journal entries

## Common Patterns

### Reading context in a tab
```tsx
const { isLoading, driveDataFile, driveConfFile } = useContext(DataContext)
const { isSignedIn } = useContext(AuthContext)
```

### Guarding render with no data
```tsx
if (!driveDataFile?.entries) return <AlertGdriveStatus isBusyLoad={isLoading} />
```

### Adding a new entry
```tsx
const { doEntryAdd, doSaveDataFile } = useContext(DataContext)
doEntryAdd(newEntry)
await doSaveDataFile()
```

### Date formatting
```tsx
import { DateTime } from 'luxon'
DateTime.now().toFormat('yyyy-MM-dd')  // entry date
new Date(entry.modifiedTime).toLocaleString()  // display
```

## Notes
- `appdata.ts` and `googlegsi.ts` are legacy classes; prefer `DataProvider`/`AuthProvider` for new features
- `VERBOSE_IMPORT` and `IS_LOCALHOST` flags in `app.types.ts` control debug logging
- Log levels controlled via `?mode=debug|api|core` URL param using `log(level, message)`
- Bootstrap modals are used for entry editing (`modal-entry.tsx`) and initialized via `useEffect`
