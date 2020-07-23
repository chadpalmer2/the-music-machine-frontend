# the-music-machine-frontend

loadedBeat

when button is pressed on soundboard
    sound plays
    loadedBeat is updated

when play button is pressed
    loadedBeat is inputted into Tone.js
    Tone.js loops sound
    soundboard frozen, animated

```js
const drum = [
    "crash",
    "high tom",
    "medium tom",
    "low tom",
    "open hihat",
    "closed hihat",
    "snare",
    "kick"
]

const pianoTrack = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]
```

pitch: https://docs.google.com/document/d/1ezaYnml11gOlsxtTbCqwJoZvuTvO4gJRuOaxlrBAgyw/edit
checkin: https://docs.google.com/spreadsheets/d/1vdkwgz4z06BYKYmr13eLKtWDAyzsPAPKquIE6dSOX50/edit#gid=80255631