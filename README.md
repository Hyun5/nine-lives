# Nine Lives / 나인 라이브스

An interactive page of nine study rooms, each in a different city, with a live digital clock in that city's local time. Neon is used only as a visual style for the clock text and glow — it is not part of the project name.

v1 is the **home** setting only, using the SuperAlex 9-woman room art from `/workspace/study-video/grid9/`. The current mood is **Rainy Window** (비 오는 창가). Open `index.html` next to `music.m4a` and the `assets/` folders. Stills and scene loops are separate files under `assets/rooms/` (base set) and `assets/rooms_rainy/` (Rainy Window). Music, live weather, and IP city lookup need those sibling/network files.

## Files

| Path | What it is |
|---|---|
| `index.html` | The page (no media inlined). Keep this filename for Netlify. |
| `index.template.html` | The page source, with media loaded from `assets/rooms/`. |
| `music.m4a` | 1-hour original chillhop soundtrack (AAC ~64 kb/s). Served next to `index.html`, not inlined. Loaded only when Music is pressed. |
| `assets/rooms/` | Base stills and loops: `r0N_{desk,dark,off,bed}.{jpg,mp4}`. |
| `build.py` | Rebuilds `index.html` from the template and `assets/rooms/`. Run `python3 build.py`. Does not pack `music.m4a`. |
| `previews/` | Headless screenshots, including 1280×800 Case A/B visitor layouts. |
| `manifest.webmanifest` | Web app manifest for Add to Home Screen / standalone display. |
| `icon-180.png`, `icon-192.png`, `icon-512.png` | Home-screen and favicon images. |

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

The eight outer cells belong to Mia, Sora, Hana, Lani, Nao, Lin, Mio, and Coco, each with a fixed city and IANA zone. Their clocks use that zone (DST-correct, including a swapped-in backup) and a neon numeral glow. Times are formatted with the visitor's locale hour cycle: 12-hour AM/PM when the visitor's locale is en-US, 24-hour elsewhere per Intl defaults. If the English switch is on, weekday and month names are English (`en` plus the visitor's region) but the hour cycle still follows the visitor's locale. The center YOU clock always uses the browser time zone (`Intl.DateTimeFormat().resolvedOptions().timeZone`), even if an IP lookup returns a different zone.

| Default slot | Room art | Character | City | Time zone |
|---|---|---|---|---|
| 1 | r01 | Mia | New York | `America/New_York` |
| 2 | r02 | Sora | London | `Europe/London` |
| 3 | r03 | Hana | Paris | `Europe/Paris` |
| 4 | r04 | Lani | Seoul | `Asia/Seoul` |
| 5 (center) | r05 | YOU | visitor city | browser time zone |
| 6 | r06 | Nao | Sydney | `Australia/Sydney` |
| 7 | r07 | Lin | Singapore | `Asia/Singapore` |
| 8 | r08 | Mio | São Paulo | `America/Sao_Paulo` |
| 9 | r09 | Coco | Dubai | `Asia/Dubai` |

Lani's given name is localized as 라니 in Korean, ラニ in Japanese, and 拉妮 in Chinese; in the other five UI languages it stays **Lani**. The other characters keep their Latin names in every language.

The center cell is always the visitor, displayed as **YOU** in every language (Latin letters, never translated). It uses the r05 room art and variants, and its clock always follows the browser time zone (`Intl.DateTimeFormat().resolvedOptions().timeZone`). Aya / Los Angeles is never shown in the outer ring, and never occupies the center.

## Backup cities

The eight outer cells are filled east-to-west by each city's current UTC offset (largest first, DST-correct via `Intl` on that city's IANA zone), skipping the center YOU cell. The order is re-checked every minute and, when it actually changes, the tiles animate with a short FLIP (~600ms; instant if motion is reduced). `?order=fixed` keeps the default table order. Each city has a backup in the same zone, or within about an hour and a similar longitude, stored in `CITY_TABLE`. When a backup is used, it takes its partner's character art, and its name is localized in all eight UI languages. Los Angeles → Vancouver is kept in the data only and is never shown in the outer ring.

| City | Zone | Backup | Backup zone |
|---|---|---|---|
| New York | `America/New_York` | Toronto | `America/Toronto` |
| London | `Europe/London` | Dublin | `Europe/Dublin` |
| Paris | `Europe/Paris` | Berlin | `Europe/Berlin` |
| Seoul | `Asia/Seoul` | Tokyo | `Asia/Tokyo` |
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

- **Case A — the visitor is in one of the eight outer cities.** That cell swaps to its backup (backup name and backup clock, same character art). The center shows YOU · the visitor city at browser time. Example: `?city=Seoul` puts Tokyo in Seoul's slot (Lani's art, Tokyo clock) and labels the center **YOU · Seoul**.
- **Case A-LA — the visitor is in Los Angeles.** The center shows YOU · Los Angeles. The eight outer cells are unchanged. Vancouver is not shown.
- **Case B — any other city, including a backup such as Tokyo or Toronto.** The center shows YOU · that city. The eight outer cells stay as their primary cities. Example: `?city=Tokyo` leaves Seoul in place and labels the center **YOU · Tokyo**.

The displayed visitor city is snapped to a major metro when possible. If the IP region is Michigan, US (`region_code` `MI` or region `Michigan`), the YOU cell shows **Detroit** (localized in all eight languages). Otherwise, if the visitor coordinates fall within about 60 km of a city in a compact world-metro list, that metro name is used (so a Toronto suburb matches Toronto, and Brooklyn matches New York). The raw suburb name is kept when nothing is nearby. Snapping changes only the displayed name and the match against the nine primary/backup cities. The YOU clock still uses the browser time zone, and weather still uses the visitor's own coordinates. `?city=` of a known primary or backup city still wins exactly. For tests, `?city=Northville&lat=42.4314&lon=-83.4833&region=Michigan&region_code=MI&country=US` snaps to Detroit.

The page title is the single localized heading only; there is no subtitle. On a scrollable layout (for example a 390×844 portrait phone), the YOU cell is vertically centered in the viewport once on load, and again after an orientation change only if the visitor has not scrolled. `history.scrollRestoration = 'manual'`. Reordering tiles does not re-center.

The footer credit is **© 2026 SuperAlex** [YouTube icon button] **All rights reserved.** (the rights line is localized). The icon links to https://www.youtube.com/@SuperAlex5 in a new tab. The Open-Meteo credit stays after that line.

## Variant-switching rules

The still or clip shown in a room follows **that city's local hour**:

| Local time | Period | Visual |
|---|---|---|
| 07:00–16:59 | day | Desk loop (study). Still fallback if the clip cannot play. Plays even with reduced motion. |
| 17:00–21:59 | evening | Lamp-lit dark loop. Still fallback if the clip cannot play. Plays even with reduced motion. |
| 22:00–23:59 | late | Lights-off loop. Still fallback if the clip cannot play. Plays even with reduced motion. |
| 00:00–06:59 | night | Bed loop (breathing). Still fallback if the clip cannot play. Plays even with reduced motion. |

Rainy Window uses `assets/rooms_rainy/`. Every other theme uses the base set in `assets/rooms/`. Videos are loaded lazily (`preload="none"`), one per visible cell, and are never inlined. Only card-flip/layout animations and twinkling stars respect `prefers-reduced-motion`.

These rules live in `periodForHour` in the page script. Tap a room to enlarge it; the panel shows the city, character, date, time zone, and a short weather-mood line for the active theme.

## Themes

Themes are a data-driven list in `THEMES`, each with `{ id, name, status, linkWeather, linkTime }`. There is no theme name on the main screen. The ☰ settings panel holds a theme picker, in this order — **This week's theme (auto)**, Rainy Window, Moonlight Window, Christmas, Snow, Fireplace, Library, Cafe, Classroom — localized in all eight UI languages.

A status line at the top of the picker reports what is actually on screen (including the Rainy Window fallback), for example “Now showing: Rainy Window”. In a week whose scheduled theme has no art yet it reads “Now showing: Rainy Window (Moonlight Window coming soon)”. A manual pick appends “(your pick)”.

Only **This week's theme (auto)** and themes with `status: 'ready'` (currently only Rainy Window) are radio options: they are keyboard-accessible (`role=radiogroup` / `role=radio`) and the current choice is checked. Coming themes are listed, dimmed, and not selectable; their row shows the name, a **This week** badge when that theme is the week’s scheduled one, and the shared **Coming soon** tag. If an older visit stored a coming theme id in `localStorage['ninelives.theme']`, it is cleared and treated as auto.

- **Rainy Window** — `status: 'ready'`, `linkWeather: false`, `linkTime: false`. This is the only theme with art. The visual is fully fixed: rain on glass and the Rainy Window page background, with no weather-driven visual switching and no time-of-day tone layer.
- **Moonlight Window** — `linkWeather: false`, `linkTime: false`, coming soon (no art yet).
- **Christmas**, **Snow**, **Fireplace**, **Library**, **Cafe**, **Classroom** — `linkWeather: false`, `linkTime: true`, coming soon (no art yet). Classroom is registered in the picker only; it is not in the weekly auto schedule.

Themes without art are still selectable. Every theme with `status: 'coming'` shows the shared localized **Coming soon** tag (`comingSoon`: English “Coming soon”, Korean “곧 공개”, and the same key in the other six languages) in the picker. Rainy Window (`status: 'ready'`) does not show the tag. These themes fall back to Rainy Window visuals. Time-of-day tone is applied only when the active theme both has art and has `linkTime: true`. Until more art ships, that means only a future time-linked theme with art will use the tone path; Rainy Window stays fully fixed.

### Weekly auto schedule

If the visitor has not picked a theme, the page chooses one from `THEME_SCHEDULE`. Switches happen at **Wednesday 11:00 America/New_York**. The array is the editable source of truth; each entry is an inclusive start, and the last matching start wins. Before the first entry the default is Rainy Window. The schedule is computed on each visit and re-checked every minute.

| From (America/New_York) | Theme |
|---|---|
| (before 2026-11-25 11:00) | rainy |
| 2026-11-25 11:00 | moonlight |
| 2026-12-02 11:00 | moonlight (rest week, no new entry) |
| 2026-12-09 11:00 | christmas |
| 2026-12-16 11:00 | snow |
| 2026-12-23 11:00 onward | fireplace (kept) |

A manual pick in the ☰ panel (Rainy Window today) overrides the weekly auto and is saved in `localStorage['ninelives.theme']`. Choosing **This week's theme (auto)** clears that override. `?theme=` (including `?theme=auto`) is a test override for one page load and does not have to be written to storage. `?date=YYYY-MM-DDTHH:mm` is a query-only clock override, interpreted in `America/New_York` unless the value includes a timezone offset, so you can preview another week (for example `?date=2026-11-25T12:00`). `setTheme(id)` is exposed on `window.NineLives` for later use.

## How to add a theme

1. Append an entry to `THEMES`, for example `{ id: 'aurora', name: 'Aurora', nameKo: '오로라', status: 'coming', linkWeather: false, linkTime: true }`, and add localized names in `I18N.theme`.
2. When the art is ready, set `status` to `'ready'` and add matching `moods` entries for each language in `I18N`.
3. If the theme needs its own overlay, add CSS and honor `linkWeather` / `linkTime` in `applyAtmosphereToVis`. Leave existing themes in the list; do not replace them.
4. To change the weekly auto, edit `THEME_SCHEDULE` (and `THEME_SCHEDULE_DEFAULT` / `THEME_SCHEDULE_TZ` if needed).
5. Re-run `python3 build.py` if you are shipping the standalone `index.html`.

Themes are overlays and mood on top of the room art. They do not replace character outfits.

## How to add a setting (v2 and later)

A **setting** is the room/background art per character (home, later perhaps a distinct setting pack). It is independent of the **theme**. v1 only includes and shows **home**. Library, Cafe, and Classroom in this version are **themes**, not settings.

The page keeps a light internal hook on `window.NineLives` (`SETTINGS`, `CURRENT_SETTING`, `THEMES`, `setTheme`, `THEME_SCHEDULE`, and the clock/weather helpers).

To add a setting later:

1. Compress the new room stills (and optional idle clips) into `assets/rooms/` using a clear prefix, e.g. `cafe_r01_desk.jpg`, or a new folder such as `assets/cafe/`.
2. Register it in `SETTINGS`, e.g. `study: { id: 'study', label: 'Study', status: 'ready' }`, and point `asset()` / the media map at those files when `CURRENT_SETTING` is that id.
3. Add a setting picker only when you mean to ship it. Do not show empty or broken tiles for settings that have no art.
4. Leave the clock, city mapping, variant rules, and theme picker in place.

## Rebuilding compressed assets

Idle clips were re-encoded from `grid9/clips/r0N_idle.mp4` to 640×360, 12 fps, H.264 CRF 28. Stills were resized from `grid9/src/r0N_{desk,dark,off,bed}.jpg` to 640×360 JPEG quality 80. After replacing files in `assets/rooms/`, run `python3 build.py`.

## Music

`music.m4a` is a 64 kb/s AAC encode of the original 60-minute SuperAlex chillhop track (`music_chillhop_v6_60min.m4a`, 01:00:00, composed and synthesized in Python for the 9-woman series). It is not inlined. The file is loaded (`preload="none"`) only when the visitor presses **Music**. It loops, at a moderate volume. While music is playing, weather ambience is ducked slightly.

## Weather ambience

Ambience is synthesized with the Web Audio API (no audio files): drizzle and rain, heavier rain with occasional thunder, snow hush and wind, cloudy wind, a low fog drone, and a gentle low-passed breeze on clear sky with sparse birds (day) or crickets (night) as quiet accents. It follows the **YOU** cell's live weather and day/night flag, and crossfades when that weather changes. `?wx=` overrides the **sound** kind only, for testing; it does not change the Rainy Window visuals. Browsers block audible autoplay, so ambience starts on the first `pointerdown` / `keydown` / `touchstart` anywhere on the page. A header **Ambience** mute toggle is saved in `localStorage['ninelives.ambienceMuted']` (default: unmuted).

## Live weather

Each visible city (the eight outer cells, including a swapped backup, and the YOU center) shows a small live weather icon and temperature (no weather word on the tile). Data comes from [Open-Meteo](https://open-meteo.com/) (`/v1/forecast`, `current=weather_code,temperature_2m,is_day&daily=sunrise,sunset&timezone=auto`), batched in one request using each city's latitude and longitude from `CITY_TABLE`. The YOU cell uses the visitor's coordinates from the IP lookup (`ipapi.co`, then `ipwho.is`); if those are missing, it uses the matched city's coordinates. Temperature is in °C, or °F when the visitor's IP country is US or the browser locale is `en-US`. The feed times out after about 4 seconds, refreshes every 30 minutes (paused while the tab is hidden, refreshed on `visibilitychange` if stale and on `online`), and keeps the last successful values if a request fails. `?weather=off` hides the live figures. `?wxrefresh=<seconds>` overrides the interval for tests. Weather data is © Open-Meteo (CC-BY 4.0); a footer credit links to Open-Meteo.com.

Background visuals stay on the Rainy Window look regardless of this feed. Sunrise and sunset are fetched so time-linked themes can use a real local dawn/dusk once they have art.

## Daily activity and speech

Each cell shows a short line of what is happening there right now, and that line is the visual focus of the tile. Outer cells use the woman who lives in that room and her city's local hour. There are ten blocks across the day (night, before dawn, morning, late morning, midday, afternoon, dusk, evening, late evening, after 11). Each character has a slightly different routine. Live weather can nudge an awake line (rain → "listening to the rain"; also drizzle, thunder, snow, and fog). The center YOU line is a quiet aside to the visitor ("good morning", "you're up late too"). Character cells also rotate a short first-person speech bubble every 8–12 seconds (staggered; hidden while that character is in the night/asleep block). On a compact portrait phone, only two or three bubbles are shown at a time, or the one on a hovered/focused tile. All of this is localized in the eight UI languages and follows the English switch. The activity line updates when the hour block or the weather nudge changes, with a short fade (skipped if motion is reduced).

Numeric weather on the tiles is kept small: icon and temperature only. `?hour=22` (optionally with `?city=`) is the way to preview a given hour. `?tod=` still exists for the time-of-day code path and applies only when the active theme has art and `linkTime: true`.

## Full screen and home screen

On browsers that can use the Fullscreen API (Android phones, tablets including iPad, and desktop), the header has a full-screen button, a one-time “Tap for full screen” hint, and a double-tap on the header chrome. iPhone and iPod (any iOS browser; all of them use WebKit) hide that button, skip the landscape hint, and ignore double-tap-to-fullscreen, because the API is not usable there. A one-time “Add to Home Screen for full screen” hint is shown only in iPhone Safari, and not when the page is already in standalone mode (`localStorage['ninelives.a2hsHintSeen']`). The page ships `manifest.webmanifest` and icons (`icon-180.png`, `icon-192.png`, `icon-512.png`) so it can open standalone from the home screen.

In mobile landscape, the document is made slightly taller than the visible viewport (`100dvh + 2px`) so a first small swipe or a delayed `window.scrollTo(0, 1)` on orientation change can collapse the browser toolbar. Layout uses `100svh` / `100dvh` and `viewport-fit=cover` with safe-area padding. This does not fight the YOU-centered initial scroll on portrait.
