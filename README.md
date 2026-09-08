# ElderwildWeb

Browser-native conversion of the existing **ScapeRunner / OSRSIdle** game.

The repository name remains ElderwildWeb, but ScapeRunner is the authoritative source project for gameplay rules, balance, data, and features.

## Architecture

This is a static HTML/CSS/JavaScript app so it can run directly on GitHub Pages and be developed/tested from a phone without an APK or local build toolchain.

- `index.html` — application shell
- `styles.css` — mobile-first game UI
- `src/data.js` — static game definitions migrated from ScapeRunner
- `src/game.js` — platform-independent state, XP, tick loop, and saving
- `src/app.js` — browser UI and navigation

## Migration rule

Port gameplay behavior and data from ScapeRunner, but **do not port MAUI/XAML platform code literally**. Rebuild views using browser DOM/CSS while keeping game rules equivalent.

## Implemented

- 600 ms game tick
- OSRS-style level/XP table from ScapeRunner
- Persistent browser save using `localStorage`
- Player name
- Skill levels and XP
- Activity progress
- Inventory item rewards
- Fishing activities
- Mining activities
- Woodcutting activities
- Initial Agility activities
- Home / Skills / Combat / Inventory / Settings navigation

## Migration roadmap

1. Finish all non-combat skill activity data and item definitions.
2. Port Inventory and full ItemData/equipment metadata.
3. Port EnemyData, enemy tiers, descriptions, traits, and drop tables.
4. Port CombatRules and CombatManager behavior, including attack speeds and the 600 ms tick model.
5. Port equipment, food, auto-eat, combat styles, and combat XP.
6. Port Collection Log, rarity display, luckiest drop, and progression bonuses.
7. Port auto-combat and offline combat simulation.
8. Port save fields/migrations so browser saves cover all systems.
9. Rebuild remaining ScapeRunner screens and quality-of-life behavior in HTML/CSS/JS.
10. Move compatible image/audio assets into the web repository and replace temporary emoji placeholders.

## Source repository

`BeefBeefs/ScapeRunner`
