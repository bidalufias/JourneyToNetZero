# Tabletop Layout Spec — Journey to Net Zero

## Core Concept
This is a **tabletop board game** played on a multi-touch screen or iPad laid flat.
- **ONE SCREEN, NO SCROLLING** — ever. `overflow: hidden; height: 100vh; width: 100vw`
- 4 players sit around a rectangular table: 2 at top (facing down/centre), 2 at bottom (facing up/centre)
- Each player has their own **quadrant** with all their info
- Centre of screen = shared game state + watercolour city backdrop

## Quadrant Layout
```
┌─────────────────────────────────────────────┐
│  ┌───────────────┐       ┌───────────────┐  │
│  │ P1: Government│       │ P2: Business  │  │
│  │ 🔵 Top-Left   │       │ 🟢 Top-Right  │  │
│  │ (rotated 0°)  │       │ (rotated 0°)  │  │
│  └───────────────┘       └───────────────┘  │
│                                             │
│           ┌───────────────────┐             │
│           │    CENTRE AREA    │             │
│           │  City backdrop    │             │
│           │  6 indicators     │             │
│           │  Round/phase/timer│             │
│           │  Event text       │             │
│           │  Animations       │             │
│           └───────────────────┘             │
│                                             │
│  ┌───────────────┐       ┌───────────────┐  │
│  │ P3: Community │       │ P4: Youth     │  │
│  │ 🟡 Bot-Left   │       │ 🔴 Bot-Right  │  │
│  │ (rotated 180°)│       │ (rotated 180°)│  │
│  └───────────────┘       └───────────────┘  │
└─────────────────────────────────────────────┘
```

## Player Quadrant Contents
Each quadrant contains:
- **Role avatar/icon** (small, top corner of quadrant)
- **Role name + colour bar** (Government 🔵, Business 🟢, Community 🟡, Youth 🔴)
- **Resource counters** (Primary budget, Secondary budget) — large touch-friendly numbers
- **3 Action cards** (primary options for this round) — compact cards, tappable
- **Support action strip** (compact row of support options)
- **Selected action indicator** (highlighted card)
- **Lock In / Unlock button** — large, prominent
- **Decision status** (Waiting / Selected / Locked)

### Orientation
- **Top players** (P1, P2): content faces DOWN toward centre — text reads top-to-bottom
- **Bottom players** (P3, P4): content is rotated 180° so it faces UP toward centre — player reads it from their side

## Centre Area
- **Background**: Procedural watercolour city illustration (CSS gradients, shapes, textures)
- **6 Indicator dials** arranged in a circle or row:
  - Economy 💰, Emissions 🏭, Trust 🤝, Equity ⚖️, Resilience 🛡️, Energy Security ⚡
  - Each shows current value (0-10) as a radial gauge or arc
- **Round indicator**: "Round 3 / 8"
- **Phase indicator**: "Decision Phase" / "Resolution"
- **Event card**: Current round event title + brief description
- **Wildcard banner** (when active): animated reveal
- **Timer** (optional): countdown ring

## Animations & Transitions
When resolution happens:
1. All 4 selected actions highlight simultaneously
2. Centre area shows **indicator changes** as animated arcs (green ↑ red ↓)
3. **Synergy triggers** flash in centre with sparkle effect
4. **Wildcard effects** play a dramatic reveal
5. **Headlines** appear as floating text, then fade
6. Brief pause, then transition to next round

## Touch Design
- All tap targets minimum 44px × 44px
- No hover states (touch screen)
- No right-click, no keyboard shortcuts
- Drag to scroll is disabled (overflow: hidden)
- Pinch-zoom disabled on the page

## CSS Layout
```css
.game-table {
  display: grid;
  grid-template-areas:
    "p1 centre p2"
    "p1 centre p2"
    "p3 centre p4"
    "p3 centre p4";
  grid-template-columns: 1fr 1.2fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.quadrant { padding: 8px; }
.quadrant--bottom { transform: rotate(180deg); }
```

## Pre-Game Screens
- Attract, RoleIntro, CitySelect, HowToPlay — these stay as-is (single player orientation is fine)
- Only the **GameScreen** and **EndingScreen** need the tabletop layout
