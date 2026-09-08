import { useEffect, useRef, useState } from "react"
import { permute, pickK } from "./Vastakohtamuistipeli";
import Enddialog from "./muistipeli/SanontaEnddialog.tsx";
import Kortti from "./muistipeli/Kortti.tsx";

type Sanonta = [string, string]
type Card = {
  word: string;
  flipped: boolean;
  pair?: string;
  pos: number;
}
type Gamestate = {
  canPlay: boolean;
  cards: Card[];
  found: string[]
}
const odotusaika: number = 0.5

export default function Sanontamuistipeli() {
  const enddialogRef = useRef<HTMLDialogElement>(null)
  const [tries, setTries] = useState(0)
  const [sanonnat, setSanonnat] = useState<Sanonta[]>([])
  const [gamestate, setGamestate] = useState<Gamestate>({ cards: [], canPlay: false, found: [] });
  useEffect(() => {
    fetch(`/sanat/sanonnat.txt`).then(res => res.text()).then(sanalista => setSanonnat(() => {
      return sanalista.split("\n").filter(asia => asia).map(sanamasiina =>
        [sanamasiina.split(";")[0], sanamasiina.split(";")[1]]
      )
    }
    )).catch(console.log)
  }, [])
  const win = () => {
    setGamestate(gs => ({ ...gs, canPlay: false }))
    enddialogRef.current?.showModal()
  }
  useEffect(() => {
    if (!gamestate.canPlay) return
    if (gamestate.found.length == 6) {
      win()
    }
  }, [gamestate])
  const restart = () => {
    enddialogRef.current?.close()
    setTries(0)
    startGame()

  }
  const handleCorrect = () => {
    const flipPair = gamestate.cards.filter(c => c.flipped)
    const eka = flipPair.filter(p => p.pair != undefined)[0]
    const toka = flipPair.filter(p => p.pair == undefined)[0]

    setGamestate(gs => {
      return {
        ...gs,
        cards: gs.cards.filter(c => !c.flipped),
        found: [
          ...gs.found, eka.word + " " + toka.word
        ]
      }
    })
  }
  const handleIncorrect = () => {
    setGamestate(gs => ({ ...gs, canPlay: false }))
    setTimeout(() => {
      setGamestate(gs => ({
        ...gs,
        canPlay: true,
        cards: gs.cards.map(c => ({ ...c, flipped: false }))
      }))
    }, odotusaika * 1000)
  }
  const handlePlay = () => {
    if (!gamestate.canPlay) return
    const flipPair = gamestate.cards.filter(c => c.flipped)

    if (flipPair.length < 2) return
    if ((flipPair[0].pair == undefined) === (flipPair[1].pair == undefined)) { handleIncorrect(); return; }
    const eka = flipPair.filter(p => p.pair != undefined)[0]
    const toka = flipPair.filter(p => p.pair == undefined)[0]
    setTries(t => t + 1)
    if (eka.pair == toka.word) handleCorrect()
    else handleIncorrect()
  }
  useEffect(() => {
    handlePlay()
  }, [gamestate])
  const startGame = () => {
    const kortit = pickK(sanonnat, 6)
    const perm = permute(12)
    const cards: Card[] = []
    for (let i = 0; i < kortit.length; i++) {
      cards.push({ pos: perm[2 * i], word: kortit[i][0], flipped: false, pair: kortit[i][1] })
      cards.push({ pos: perm[2 * i + 1], word: kortit[i][1], flipped: false, pair: undefined })
    }
    setGamestate({ cards: cards, canPlay: true, found: [] })
  }
  useEffect(() => {
    if (sanonnat.length) startGame()
  }, [sanonnat])

  console.log(gamestate.cards)
  return <>
    <Enddialog found={gamestate.found} ref={enddialogRef} onRestart={() => {
      restart()
    }}></Enddialog>
    <div id='memocontainer' >
      <p className='text-1' style={
        {
          position: "absolute",
          top: "1em",
          left: "1em",

        }
      }>Käännöt: {tries}</p>
      <div id='sanontamuistipeli' style={{
      }}>
        {gamestate.cards.map(c => {
          return <Kortti rows={2} pos={c.pos} key={c.pos} teksti={c.word} käännetty={c.flipped} onClick={() => {
            if (!gamestate.canPlay) return
            setGamestate(gs => ({
              ...gs, cards: gs.cards.map((ca) => {
                if (ca.pos != c.pos) return ca
                return { ...ca, flipped: true }
              })
            }))
          }}></Kortti>
        })}
      </div>
      <div id='found' className='bluebox sanonnatfound'>
        <h2 className='title-1' style={{
          marginBottom: "1.5em"
        }}>LÖYDETYT PARIT</h2>
        <div style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          marginBottom: "1.5em",
          gap: "2em"
        }}>
          {gamestate.found.map((sanonta) => {
            return <> {<p style={{ marginBottom: "0.2em" }} className='text-1'>{sanonta}</p>}</>
          })}
        </div>
      </div>
    </div>
  </>
}
