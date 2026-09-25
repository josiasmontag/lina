# Lina

A small cozy pixel-art browser game for Lina, in the style of Graveyard Keeper.

## Play

Open `index.html` in a browser. You don't need to install or build anything. You can also run it from a local server:

```bash
python3 -m http.server 8765
```

then open http://localhost:8765.

## Controls

| Action | Keyboard | Xbox controller |
|---|---|---|
| Move | Arrows / WASD | Left stick / D-pad |
| Get on/off bike, open doors, play with things | E / Space / Enter | A |
| Bike bell (riding) / hop (walking) | Q / B | B / X / Y |
| Music on/off | M | View |
| Show controls | H | |

Walk up to a door to go inside. Walk down onto the doormat to leave.
Use the mirror in Lina's room to switch between pigtails and loose hair.

## Code layout

- `js/util.js`: pixel drawing helpers and auto-outlined sprites
- `js/sprites.js`: Lina, her pink woom bike, the cat, icons
- `js/props.js`: houses, trees, playground, furniture
- `js/scenes.js`: the street, the park and the three house interiors
- `js/main.js`: game loop, movement, bike, camera, lighting
- `js/audio.js` / `js/input.js`: synthesized sounds, keyboard and gamepad
