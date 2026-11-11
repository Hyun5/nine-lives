# Nine Lives / 나인 라이브스

An interactive page of nine study rooms, each in a different city, with a live digital clock in that city's local time. Neon is used only as a visual style for the clock text and glow — it is not part of the project name.

v1 is the **home** setting only, using the SuperAlex 9-woman room art from `/workspace/study-video/grid9/`. The current mood is **Rainy Window** (비 오는 창가). Open `index.html` next to `music.m4a`. Room art is inlined, so the page works without a server; music, live weather, and IP city lookup need those sibling/network files.

## Files

| Path | What it is |
|---|---|
| `index.html` | The packed page, with room stills and idle clips inlined. Keep this filename for Netlify. |
| `index.template.html` | The page source, with media loaded from `assets/rooms/`. |
| `music.m4a` | 1-hour original chillhop soundtrack (AAC ~64 kb/s). Served next to `index.html`, not inlined. Loaded only when Music is pressed. |
| `assets/rooms/` | Compressed sources used by the packer: `r0N_idle.mp4` plus `r0N_{desk,dark,off,bed}.jpg`. |
| `build.py` | Rebuilds `index.html` from the template and `assets/rooms/`. Run `python3 build.py`. Does not pack `music.m4a`. |
| `previews/` | Headless screenshots, including 1280×800 Case A/B visitor layouts. |

## Language

`DEFAULT_LANG` is `'en'`. The static HTML (before JavaScript runs) is English, with `lang="en"`, the heading **Nine Lives**, and English chrome (Settings, Music, Ambience, and so on).

After JS runs, the language is chosen in this order:

1. If `localStorage['ninelives.forceEnglish']` is set (the English switch in Settings), always use English.
2. Else if the URL has `?lang=`, use that tag when it matches a supported language (`en`, `ko`, `ja`, `zh-Hans`, `es`, `fr`, `de`, `pt`, including regional forms such as `ko-KR` or `zh-CN`). An invalid or unsupported `?lang` value falls back to English.
3. Else use `navigator.languages` / `navigator.language`.
4. If those are missing or empty, throw an error, or match no supported language, render English.

A browser set to an unsupported locale (for example Russian, `--lang=ru`) therefore shows English.

## Settings menu

A ☰ button sits at the side of the screen (left edge on desktop and landscape; lower-left on a portrait phone). It has `aria-label`, `aria-expanded`, and `aria-controls`, plus a localized accessible name.

Clicking it opens a small settings panel with a localized **Settings** heading. The panel holds **only** the English language switch, placed at the bottom. There are no theme toggles and no other items in v1. Close the panel with the ☰ button, an outside click, or Esc. It is keyboard-accessible: focus moves to the switch when opened, Tab cycles between the ☰ button and the switch, and Esc returns focus to ☰.

The empty `settings-slot` above the language row is the extension point for later theme toggles. When those ship (after v2), add them in that slot, above the English switch, without removing the language row.

## City-to-room mapping

The eight outer cells belong to Mia, Sora, Hana, Yuki, Nao, Lin, Mio, and Coco, each with a fixed city and IANA zone. Their clocks use that zone (DST-correct, including a swapped-in backup) and a neon numeral glow. Times are formatted with the visitor's locale hour cycle: 12-hour AM/PM when the visitor's locale is en-US, 24-hour elsewhere per Intl defaults. If the English switch is on, weekday and month names are English (`en` plus the visitor's region) but the hour cycle still follows the visitor's locale. The center YOU clock always uses the browser time zone (`Intl.DateTimeFormat().resolvedOptions().timeZone`), even if an IP lookup returns a different zone.

| Default slot | Room art | Character | City | Time zone |
|---|---|---|---|---|
| 1 | r01 | Mia | New York | `America/New_York` |
| 2 | r02 | Sora | London | `Europe/London` |
| 3 | r03 | Hana | Paris | `Europe/Paris` |
| 4 | r04 | Yuki | Tokyo | `Asia/Tokyo` |
| 5 (center) | r05 | YOU | visitor city | browser time zone |
| 6 | r06 | Nao | Sydney | `Australia/Sydney` |
| 7 | r07 | Lin | Singapore | `Asia/Singapore` |
| 8 | r08 | Mio | São Paulo | `America/Sao_Paulo` |
| 9 | r09 | Coco | Dubai | `Asia/Dubai` |

The center cell is always the visitor, displayed as **YOU** in every language (Latin letters, never translated). It uses the r05 room art and variants, and its clock always follows the browser time zone (`Intl.DateTimeFormat().resolvedOptions().timeZone`). Aya / Los Angeles is never shown in the outer ring, and never occupies the center.

## Backup cities

The outer eight cities do not move or reorder. Each has a backup in the same zone, or within about an hour and a similar longitude, stored in `CITY_TABLE` as `{city, backup, IANA zone, longitude}`. When a backup is used, it takes its partner's slot and character art, and its name is localized in all eight UI languages. Los Angeles → Vancouver is kept in the data only and is never shown in the outer ring.

| City | Zone | Backup | Backup zone |
|---|---|---|---|
| New York | `America/New_York` | Toronto | `America/Toronto` |
| London | `Europe/London` | Dublin | `Europe/Dublin` |
| Paris | `Europe/Paris` | Berlin | `Europe/Berlin` |
| Tokyo | `Asia/Tokyo` | Seoul | `Asia/Seoul` |
| Sydney | `Australia/Sydney` | Melbourne | `Australia/Melbourne` |
| Singapore | `Asia/Singapore` | Hong Kong | `Asia/Hong_Kong` |
| São Paulo | `America/Sao_Paulo` | Buenos Aires | `America/Argentina/Buenos_Aires` |
| Dubai | `Asia/Dubai` | Muscat | `Asia/Muscat` |
| Los Angeles | `America/Los_Angeles` | Vancouver (data only) | `America/Vancouver` |

## How YOU is placed

The grid is painted immediately from the browser time zone, then updated with a short crossfade once the visitor city is known.

1. If the URL has `?city=` (for testing), that value is treated as the IP city.
2. Otherwise the page asks `https://ipapi.co/json/`, then `https://ipwho.is/` as a fallback, each with a ~3 second timeout. There is no Geolocation permission prompt.
3. If the lookup fails (offline, `file://`, blocked), the city is derived from the browser IANA zone (for example `Asia/Tokyo` → Tokyo, `America/Detroit` → Detroit), or the localized label **Your City** if there is no city in the zone.

`?hour=` (0–23) is a test override: it shifts the virtual clock so the visitor's local hour is that value, and every other city stays in its real offset (DST-correct). Use it with `?city=` to preview a time of day.

Matching is case-, accent-, and alias-insensitive (`Los Angeles` = `LA`, `New York City` = `New York`, `Sao Paulo` = `São Paulo`). A shared time zone is not enough: Detroit is not New York, and Seoul is not Tokyo.

- **Case A — the visitor is in one of the eight outer cities.** That cell swaps to its backup (backup name and backup clock, same character art). The center shows YOU · the visitor city at browser time. Example: `?city=Tokyo` puts Seoul in Tokyo's slot (Yuki's art, Seoul clock) and labels the center **YOU · Tokyo**.
- **Case A-LA — the visitor is in Los Angeles.** The center shows YOU · Los Angeles. The eight outer cells are unchanged. Vancouver is not shown.
- **Case B — any other city, including a backup such as Seoul or Toronto.** The center shows YOU · that city. The eight outer cells stay as their primary cities. Example: `?city=Seoul` leaves Tokyo in place and labels the center **YOU · Seoul**.

## Variant-switching rules

The still or clip shown in a room follows **that city's local hour**:

| Local time | Period | Visual |
|---|---|---|
| 07:00–16:59 | day | Looping idle clip of the character studying at the desk. If motion is reduced or the clip cannot play, the `desk` still is used. |
| 17:00–21:59 | evening | `dark` still (lamp-lit, quieter room). |
| 22:00–23:59 | late | `off` still (lights off). |
| 00:00–06:59 | night | `bed` still (asleep). |

These rules live in `periodForHour` in the page script. Tap a room to enlarge it; the panel shows the city, character, date, time zone, and a short weather-mood line for the active theme.

## Theme menu

Themes are a data-driven list (`THEMES` in the script). v1 ships **Rainy Window** as the active theme (rain-on-window overlay, wet-glass highlight, rainy mood copy, optional synthesized rain sound). Later seasonal themes are listed as **Coming soon** and cannot be selected yet:

- Rainy Window / 비 오는 창가 — ready
- Moonlight Window / 달빛 창가 — coming soon
- Christmas / 크리스마스 — coming soon
- Snow / 눈 — coming soon
- Fireplace / 화롯불 — coming soon

Theme choice stays in the header menu, not in the settings panel.

## How to add a theme

1. Append an entry to the `THEMES` array, for example `{ id: 'snow', name: 'Snow', nameKo: '눈', status: 'coming' }`.
2. When the art is ready, set `status` to `'ready'` and add matching `moods` entries for each language in `I18N`.
3. If the theme needs its own overlay (snow, fireplace glow, moonlight), add a CSS class and toggle it from the theme-button click handler based on `currentTheme`. Leave existing themes in the list; do not replace them.
4. Re-run `python3 build.py` if you are shipping the standalone `index.html`.

Themes are overlays and mood only. They do not replace the room art. Theme *toggles* in the settings panel are reserved for after v2; put them in `#settingsSlot`, above the English row.

## How to add a setting (v2 and later)

A **setting** is the room/background art per character (home, later cafe or library). It is independent of the **theme**. v1 only includes and shows **home**. Cafe and library art are not present and are not offered in the UI.

The page keeps a light internal hook:

```js
const SETTINGS = { home: { id: 'home', label: 'Home', ready: true } };
const CURRENT_SETTING = 'home';
window.NineLives = { SETTINGS, CURRENT_SETTING, THEMES, ROOMS, periodForHour, DEFAULT_LANG, resolveLang };
```

To add a setting later:

1. Compress the new room stills (and optional idle clips) into `assets/rooms/` using a clear prefix, e.g. `cafe_r01_desk.jpg`, or a new folder such as `assets/cafe/`.
2. Register it in `SETTINGS`, e.g. `cafe: { id: 'cafe', label: 'Cafe', ready: true }`, and point `asset()` / the media map at those files when `CURRENT_SETTING` is `'cafe'`.
3. Add a setting picker only when you mean to ship it. Do not show empty or broken tiles for settings that have no art.
4. Leave the clock, city mapping, variant rules, and theme menu unchanged.

## Rebuilding compressed assets

Idle clips were re-encoded from `grid9/clips/r0N_idle.mp4` to 640×360, 12 fps, H.264 CRF 28. Stills were resized from `grid9/src/r0N_{desk,dark,off,bed}.jpg` to 640×360 JPEG quality 80. After replacing files in `assets/rooms/`, run `python3 build.py`.

## Music

`music.m4a` is a 64 kb/s AAC encode of the original 60-minute SuperAlex chillhop track (`music_chillhop_v6_60min.m4a`, 01:00:00, composed and synthesized in Python for the 9-woman series). It is not inlined. The file is loaded (`preload="none"`) only when the visitor presses **Music**. It loops, at a moderate volume. While music is playing, weather ambience is ducked slightly.

## Weather ambience

Ambience is synthesized with the Web Audio API (no audio files): drizzle and rain, heavier rain with occasional thunder, snow hush and wind, cloudy wind, a low fog drone, and optional quiet birds (clear day) or crickets (clear night). It follows the **YOU** cell's live weather and day/night flag, and crossfades when that weather changes (the weather feed refreshes about every 15 minutes). Browsers block audible autoplay, so ambience starts on the first `pointerdown` / `keydown` / `touchstart` anywhere on the page. A header **Ambience** mute toggle is saved in `localStorage['ninelives.ambienceMuted']` (default: unmuted).

## Live weather

Each visible city (the eight outer cells, including a swapped backup, and the YOU center) shows a live weather icon, localized label (clear, cloudy, fog, drizzle, rain, snow, thunder), and temperature. Data comes from [Open-Meteo](https://open-meteo.com/) (`/v1/forecast`, `current=weather_code,temperature_2m,is_day`), batched in one request using each city's latitude and longitude from `CITY_TABLE`. The YOU cell uses the visitor's coordinates from the IP lookup (`ipapi.co`, then `ipwho.is`); if those are missing, it uses the matched city's coordinates. Temperature is in °C, or °F when the visitor's IP country is US or the browser locale is `en-US`. The feed times out after about 4 seconds, refreshes every 15 minutes, and keeps the last successful values if a request fails. `?weather=off` hides the live figures. Weather data is © Open-Meteo (CC-BY 4.0); a footer credit links to Open-Meteo.com.


## Daily activity

Each cell shows a short line of what is happening there right now, and that line is the visual focus of the tile. Outer cells use the woman who lives in that room and her city's local hour. There are ten blocks across the day (night, before dawn, morning, late morning, midday, afternoon, dusk, evening, late evening, after 11). Each character has a slightly different routine. Live weather can nudge an awake line (rain → "listening to the rain"; also drizzle, thunder, snow, and fog). The center YOU line is a quiet aside to the visitor ("good morning", "you're up late too"). All lines exist in the eight UI languages and follow the English switch. The line updates when the hour block or the weather nudge changes, with a short fade (skipped if motion is reduced).

Numeric weather on the tiles is kept small: icon and temperature only, no weather word. `?hour=22` (optionally with `?city=`) is the way to preview a given hour.
