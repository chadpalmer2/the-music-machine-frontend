url = 'http://localhost:3000/api/songs/'

let pitches0 = ['C0', 'C#0', 'D0', 'D#0', 'E0', 'F0', 'F#0', 'G0', 'G#0', 'A0', 'A#0', 'B0']
let pitches1 = ['C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1']
let pitches2 = ['C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2']
let pitches3 = ['C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3']
let pitches4 = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4']
let pitches5 = ['C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5']
let pitches6 = ['C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6']
let pitches = [pitches0, pitches1, pitches2, pitches3, pitches4, pitches5, pitches6]
let drumHits = ["crash", "high tom", "medium tom", "low tom", "open hihat", "closed hihat", "snare", "kick"]

// Instrument classes

const instruments = []
class Instrument {
    constructor(name, sound, trackArr) {
        this.id = instruments.length
        instruments.push(this)

        this.name = name
        this.instrument = name
        this.sound = sound
        this.active = false
        this.loops = []
        this.trackArr = trackArr
        this.soundBoard = new Array(trackArr.length).fill(0).map(e => new Array(16).fill(0))
    }

    static all() {
        return instruments
    }

    static allInstruments() {
        return Instrument.all().filter(i => i)
    }

    static anyInstruments() {
        return Instrument.all().some(n => !!n)
    }

    deleteInstrument() {
        Instrument.all()[this.id] = 0
    }

    static activeInstrument() {
        return Instrument.allInstruments().find(i => i.active)
    }

    setActive() {
        Instrument.allInstruments().forEach(i => i.active = false)
        this.active = true
    }

    get instDiv() {
        return document.querySelector("div#inst-" + this.id)
    }

    changeName(newName) {
        this.name = newName
        this.instDiv.innerText = this.name
    }

    changeOctave(direction) {
        const currentOctave = pitches.indexOf(this.trackArr)
        const newOctave = direction == "up" ? currentOctave + 1 : currentOctave - 1
        if (pitches[newOctave]) {
            this.trackArr = pitches[newOctave]
        }
        this.loadSoundBoard()
    }

    playSound(rowIndex) {
        this.sound.triggerAttackRelease(this.trackArr[rowIndex], '8n')
    }

    clearLoops() {
        this.loops.forEach(l => l.dispose())
        this.loops = []
    }

    loadLoops() {
        this.soundBoard.forEach((row, index) => {
            let note = this.trackArr[index]
            let noteArray = row.map(e => e ? note : null)

            const loop = new Tone.Sequence((time, pitch) => {
                this.sound.triggerAttackRelease(pitch, "8n", time)
            }, noteArray, "8n").start("0m")

            this.loops.push(loop)
        })
    }

    static clearAllLoops() {
        Instrument.allInstruments().forEach(i => i.clearLoops())
    }

    static loadAllLoops() {
        Instrument.allInstruments().forEach(i => i.loadLoops())
    }

    loadSoundBoard() {
        this.setActive()

        const soundBoardDiv = document.querySelector("#soundboard")
        soundBoardDiv.innerHTML = ""

        this.soundBoard.forEach((row, rowIndex) => {
            const rowDiv = document.createElement("div")
            rowDiv.classList.add("row")
            rowDiv.id = "row-" + rowIndex

            const rowDivLabel = document.createElement("div")
            rowDivLabel.classList.add("row-label")
            rowDivLabel.id = "row-label-" + rowIndex
            rowDivLabel.innerText = this.trackArr[rowIndex]
            rowDiv.append(rowDivLabel)

            row.forEach((button, colIndex) => {
                const buttonDiv = document.createElement("div")
                buttonDiv.classList.add(`key`, `row-${rowIndex}`, `col-${colIndex}`)
                button ? buttonDiv.classList.add("selected") : 0
                buttonDiv.id = `button-${rowIndex}-${colIndex}`

                buttonDiv.addEventListener('click', () => {
                    if (!DOMHandler.isPlaying()) {
                        if (buttonDiv.classList.toggle("selected")) {
                            this.soundBoard[rowIndex][colIndex] = 1
                            this.playSound(rowIndex)
                        } else {
                            this.soundBoard[rowIndex][colIndex] = 0
                        }
                    }
                })

                rowDiv.append(buttonDiv)
            })

            soundBoardDiv.append(rowDiv)
        })
    }

    static loadSong(song) {
        while (Instrument.activeInstrument()) {
            DOMHandler.deleteInstrument()
        }
        Instrument.all().length = 0

        Player.setBPM(song.bpm)
        document.querySelector("form#bpm-form input#bpm-form-value").value = Math.floor(Player.getBPM())

        song.instruments.forEach(i => {
            const newInst = new SynthKeyboard

            newInst.name = i.name
            newInst.instrument = i.instrument
            newInst.soundBoard = i.notes
            newInst.trackArr = pitches[i.octave]

            DOMHandler.addInstrument(newInst)
        })
    }
}

class SynthKeyboard extends Instrument {
    constructor() {
        super("Synth", new Tone.PolySynth(Tone.Synth).toDestination(), pitches[3])
    }
}

class DrumKit extends Instrument {
    constructor() {
        super("DrumKit", drumHits)
    }
}

class Player {

    static setBPM(newBPM) {
        Tone.Transport.bpm.value = newBPM
    } 

    static getBPM() {
        return Tone.Transport.bpm.value
    }

    static play(all) {
        Instrument.clearAllLoops()
        DOMHandler.setPlaying()
        
        if (all) {
            Instrument.loadAllLoops()
        } else {
            Instrument.activeInstrument().loadLoops()
        }

        Tone.Transport.start()
    }

    static stop() {
        Tone.Transport.stop()
        setTimeout(() => {
            Instrument.clearAllLoops()
            DOMHandler.setNotPlaying()
            DOMHandler.removeKeysPlaying()
        }, 50)
    }
}

class DOMHandler {

    static lightUpSetup() {
        Tone.Transport.scheduleRepeat((time) => {
            const pArr = Tone.Transport.position.split(":")
            let column = Math.floor(8 * (pArr[0] % 2) + 2 * pArr[1] + Math.floor(pArr[2]) / 2)
    
            DOMHandler.removeKeysPlaying()
            document.querySelectorAll(".col-" + column).forEach(key => key.classList.add("playing"))
        }, "8n")
    }

    static setNoInsts() {
        document.querySelectorAll("div#machine-center-panel, div#machine-edit-panel").forEach(div => div.classList.remove("frozen"))
        document.querySelector("div#machine").classList.add("frozen")
        document.querySelectorAll("div#play-buttons button").forEach(b => b.classList.remove("hidden"))
        document.querySelector("div#stop-button button").classList.add("hidden")
        document.querySelector("div#soundboard").classList.add("soundboard-hidden")
        document.querySelector("div#soundboard").classList.remove("soundboard")
        document.querySelectorAll(".listing").forEach(listing => listing.classList.remove("listing-active"))
    }

    static setNotPlaying() {
        document.querySelectorAll("div#machine-center-panel, div#machine-edit-panel").forEach(div => div.classList.remove("frozen"))
        document.querySelector("div#machine").classList.remove("frozen")
        document.querySelectorAll("div#play-buttons button").forEach(b => b.classList.remove("hidden"))
        document.querySelector("div#stop-button button").classList.add("hidden")
        document.querySelector("div#soundboard").classList.remove("soundboard-hidden")
        document.querySelector("div#soundboard").classList.add("soundboard")
        document.querySelector("form#instrument-panel-form").classList.remove("frozen")
    }

    static setPlaying() {
        document.querySelectorAll("div#machine-center-panel, div#machine-edit-panel").forEach(div => div.classList.add("frozen"))
        document.querySelector("div#machine").classList.remove("frozen")
        document.querySelectorAll("div#play-buttons button").forEach(b => b.classList.add("hidden"))
        document.querySelector("div#stop-button button").classList.remove("hidden")
        document.querySelector("div#soundboard").classList.add("soundboard")
        document.querySelector("form#instrument-panel-form").classList.add("frozen")
    }

    static isPlaying() {
        return document.querySelector("div#machine-edit-panel").classList.contains("frozen")
    }

    static isInitialized() {
        return document.querySelector("div#machine").classList.contains("frozen")
    }

    static addInstFrozen() {
        return this.isPlaying()
    }

    static savePanelFrozen() {
        return this.isInitialized()
    }

    static editPanelFrozen() {
        return this.isPlaying() || this.isInitialized()
    }

    static removeKeysPlaying() {
        const keys = document.querySelectorAll(".key")
        keys.forEach(key => key.classList.remove("playing"))
    }

    static addInstrument(inst) {
        if (Instrument.allInstruments().length == 1) {
            DOMHandler.setNotPlaying()
        }
        
        let instButton = document.createElement("div")
        instButton.classList.add("inst-button")
        instButton.id = "inst-" + inst.id
        instButton.innerText = inst.name

        instButton.addEventListener("click", () => {
            DOMHandler.selectInstrument(instButton)
        })

        DOMHandler.selectInstrument(instButton)

        const instBoard = document.querySelector("div#inst-board")
        instBoard.prepend(instButton)
    }

    static deleteInstrument() {
        let inst = Instrument.activeInstrument()
        let instButton = document.querySelector("div#inst-" + inst.id)

        inst.deleteInstrument()
        instButton.parentNode.removeChild(instButton)

        if (Instrument.anyInstruments()) {
            DOMHandler.selectInstrument(document.querySelector(".inst-button"))
        } else {
            DOMHandler.setNoInsts()
        }
    }

    static selectInstrument(instButton) {
        if (!instButton.classList.contains("current-inst-button")) {
            document.querySelectorAll(".inst-button").forEach(inst => inst.classList.remove("current-inst-button"))
            instButton.classList.toggle("current-inst-button")
            let id = instButton.id.split("-")[1]
            Instrument.all()[id].loadSoundBoard()
        }
    }

    static selectSong(listingDiv) {
        document.querySelectorAll(".listing").forEach(listing => listing.classList.remove("listing-active"))
        listingDiv.classList.toggle("listing-active")
        const id = listingDiv.id.split("-")[1]
        BackendHandler.loadSong(id)
    }

    static fillSidebar(json) {
        const songList = document.querySelector("div#song-list")

        json.forEach(song => {
            const listingDiv = document.createElement("div")
            listingDiv.classList.add("listing", "button")
            listingDiv.id = "listing-" + song.id
            listingDiv.innerText = song.name
        
            listingDiv.addEventListener('click', () => !DOMHandler.addInstFrozen() && !listingDiv.classList.contains("listing-active") ? DOMHandler.selectSong(listingDiv) : 0)

            songList.append(listingDiv)
        })
    }

}

class BackendHandler {

    static saveSong(name) {
        Instrument.allInstruments()
    }

    static loadSong(id) {
        fetch(url+id)
        .then(resp => resp.json())
        .then(json => Instrument.loadSong(json))
        .catch(error => console.log(error))
    }

    static fetchSongs() {
        fetch(url)
        .then(resp => resp.json())
        .then(json => DOMHandler.fillSidebar(json))
        .catch(error => console.log(error))
    }

}

// Setup function

function setupAudio() {
    // Set up soundboard light-up effect
    DOMHandler.lightUpSetup()

    // Add new instrument button
    document.querySelector("form#instrument-panel-form").addEventListener("submit", () => {
        if (!DOMHandler.addInstFrozen()) {
            DOMHandler.addInstrument(new SynthKeyboard)
        }

        event.target.reset()
        event.preventDefault()
    })

    // Save Panel Buttons
    document.querySelector("#play-song-button").addEventListener('click', () => !DOMHandler.savePanelFrozen() ? Player.play(true) : 0)
    document.querySelector("#save-new-button").addEventListener('click', () => !DOMHandler.savePanelFrozen() ? BackendHandler.saveNew() : 0)
    document.querySelector("#save-update-button").addEventListener('click', () => !DOMHandler.savePanelFrozen() ? BackendHandler.saveUpdate() : 0)
    document.querySelector("#stop-button").addEventListener('click', () => !DOMHandler.savePanelFrozen() ? Player.stop() : 0)

    // Edit Panel Buttons

    document.querySelector("form#edit-song-name-form").addEventListener('submit', (event) => {
        if (!DOMHandler.editPanelFrozen()) {
            const newName = document.querySelector("input#edit-song-name-form-text").value
            BackendHandler.saveSong(newName)
        }

        event.target.reset()
        event.preventDefault()
    })

    document.querySelector("form#bpm-form").addEventListener('submit', (event) => {
        if (!DOMHandler.editPanelFrozen()) {
            const newBPM = parseInt(document.querySelector("form#bpm-form input#bpm-form-value").value)

            if (Number.isInteger(newBPM) && newBPM > 0 && newBPM < 360) {
                Player.setBPM(newBPM)
            } else {
                alert("BPM must be an integer between 0 and 360.")
            }

            document.querySelector("form#bpm-form input#bpm-form-value").value = Math.floor(Player.getBPM())
        }

        event.preventDefault()
    })

    document.querySelector("#play-instrument-button").addEventListener('click', () => !DOMHandler.editPanelFrozen() ? Player.play(false) : 0)

    document.querySelector("#octave-up-button").addEventListener('click', () => !DOMHandler.editPanelFrozen() ? Instrument.activeInstrument().changeOctave("up") : 0)
    document.querySelector("#octave-down-button").addEventListener('click', () => !DOMHandler.editPanelFrozen() ? Instrument.activeInstrument().changeOctave("down") : 0)
        // TODO

    document.querySelector("form#edit-instrument-name-form").addEventListener('submit', (event) => {
        if (!DOMHandler.editPanelFrozen()) {
            const newName = document.querySelector("form#edit-instrument-name-form input#edit-instrument-name-form-text").value
            Instrument.activeInstrument().changeName(newName)
        }

        event.target.reset()
        event.preventDefault()
    })

    document.querySelector("#delete-instrument-button").addEventListener('click', () => !DOMHandler.editPanelFrozen() ? DOMHandler.deleteInstrument() : 0)
}

// Wait for user input to begin audio setup

document.addEventListener('click', async () => {
    await Tone.start()
    console.log('audio ready')
}, {once: true})

// Load sidebar

BackendHandler.fetchSongs()
setupAudio()
DOMHandler.setNoInsts()