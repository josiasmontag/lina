# Lina

A small cozy pixel-art browser game for Lina, in the style of Graveyard Keeper.

## Play

Open `index.html` in a browser. You don't need to install or build anything. You can also run it from a local server:

```bash
python3 -m http.server 8765
```

then open http://localhost:8765.

## Controls

| Action | Keyboard | Xbox controller | Touch |
|---|---|---|---|
| Move | Arrows / WASD | Left stick / D-pad | Drag anywhere |
| Get on/off bike, open doors, play with things | E / Space / Enter | A | Ⓐ button |
| Bike bell (riding) / hop (walking) | Q / B | B / X / Y | Ⓑ button |
| Music on/off | M | View | ♪ button |
| Show controls | H | | |

Walk up to a door to go inside. Walk down onto the doormat to leave.
At the crossroads, press the button on a pedestrian light to make it turn green sooner.
Use the mirror in Lina's room to switch between pigtails and loose hair.

## iPhone and iPad

Open the site in Safari, tap Share, then **Add to Home Screen**. Lina gets her
own icon and runs fullscreen like an app. The on-screen controls show up as soon
as you touch the screen.

The icons in `icons/` are drawn from the game's own sprites. Run
`tools/make-icons.sh` to render them again (it needs Google Chrome).

## Code layout

- `js/util.js`: pixel drawing helpers and auto-outlined sprites
- `js/sprites.js`: Lina, her pink woom bike, the cat, icons
- `js/props.js`: houses, trees, playground, furniture, traffic lights, building site
- `js/scenes.js`: the street, the crossroads, the park and the three house interiors
- `js/main.js`: game loop, movement, bike, camera, lighting
- `js/audio.js` / `js/input.js`: synthesized sounds, keyboard, gamepad and touch
