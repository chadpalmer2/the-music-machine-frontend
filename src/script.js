let soundBoard = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]

let pitchesFirst = ['C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1']
let pitchesSecond = ['C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2']
let pitchesThird = ['C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3']
let pitchesFourth = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4']
let pitchesFifth = ['C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5']

function setupAudio() {
    const polySynth = new Tone.PolySynth(Tone.Synth).toDestination()

    let keys = document.querySelectorAll(".key")
    keys.forEach(key => {
        let row = key.id.split('-')[1]
        let col = key.id.split('-')[2]
        let pitch = pitchesThird[row]

        key.addEventListener('mousedown', () => {
            if (!event.target.classList.contains("frozen")) {
                if (event.target.classList.toggle("selected")) {
                    soundBoard[row][col] = 1
                    polySynth.triggerAttackRelease(pitch, '8n')
                } else {
                    soundBoard[row][col] = 0
                }
            }
        })
    })

    Tone.Transport.scheduleRepeat((time) => {
        const pArr = Tone.Transport.position.split(":")
        column = 8 * (pArr[0] % 2) + 2 * pArr[1] + Math.floor(pArr[2]) / 2

        document.querySelectorAll(".key").forEach(key => key.classList.remove("playing"))
        document.querySelectorAll(".col-" + column).forEach(key => key.classList.add("playing"))
    }, "8n")

    let loops = []
    function prepareLoops() {
        loops.forEach(l => l.dispose())
        loops = []

        soundBoard.forEach((row, index) => {
            addLoop(row, index)
        })
    }

    function addLoop(row, index) {
        let note = pitchesThird[index]
        let noteArray = row.map(e => e ? note : null)

        const loop = new Tone.Sequence((time, pitch) => {
            polySynth.triggerAttackRelease(pitch, "8n", time)
        }, noteArray, "8n").start("0m")

        loops.push(loop)
    }

    let playing = false
    function togglePlay() {
        if (!playing) {
            prepareLoops()
        } else {
            document.querySelectorAll(".key").forEach(key => key.classList.remove("playing"))
        }

        playing = !playing
        keys.forEach(key => key.classList.toggle("frozen"))
        Tone.Transport.toggle()
    }

    document.querySelector("#play-button").addEventListener('click', () => togglePlay())
}

//

document.addEventListener('click', async () => {
    await Tone.start()
    console.log('audio is ready')
    setupAudio()
}, {once: true})