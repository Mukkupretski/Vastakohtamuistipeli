import 'react'
import './muistipeli/muistipeli.css'
import { startTransition, useEffect, useState } from 'react'
import Kortti from './muistipeli/Kortti';

type Pairlist = [string, string][];
type Wordclass = "adjektiivit" | "verbit" | "substantiivit" | "muut";
type Wordlist = { "verbit": Pairlist, "adjektiivit": Pairlist, "substantiivit": Pairlist, "muut": Pairlist }
const emptyWordlist: Wordlist = { "verbit": [], "adjektiivit": [], "substantiivit": [], "muut": [] }
type Word = { word: string, wordclass: Wordclass }
const classes: Wordclass[] = ["adjektiivit", "verbit", "substantiivit", "muut"]
type Card = {
  pair: string;
  word: Word;
  flipped: boolean;
  pos: number;
}
type Gamestate = {
  cards: Card[];
  canPlay: boolean;
  found: Wordlist;
}


// seconds
const odotusaika: number = 0.5

// returns random permutation of {0,..., n-1}
function permute(n: number) {
  let ls: number[] = [];
  for (let index = 0; index < n; index++) {
    ls.push(index)
  }
  const res = [];
  for (let i = 0; i < n; i++) {
    const val = ls[Math.floor(Math.random() * (n - i))]
    res.push(val)
    ls = ls.filter(el => el != val);
  }
  return res;
}


function combine(n: number, k: number) {
  let ls = [];
  for (let index = 0; index < n; index++) {
    ls.push(index)
  }
  const res = [];
  for (let i = 0; i < k; i++) {
    const pos = Math.floor(Math.random() * (n - i))
    res.push(ls[pos])
    ls = ls.filter(el => el != pos);
  }
  return res;
}
function shuffle<T>(list: T[]): T[] {
  const order = permute(list.length)
  const res = [

  ]
  for (let i = 0; i < list.length; i++) {
    res.push(list[order[i]])
  }
  return res
}
function pickK<T>(list: T[], k: number): T[] {
  const order = combine(list.length, k)
  const res = [

  ]
  for (let i = 0; i < k; i++) {
    res.push(list[order[i]])
  }
  return res
}
export function capital(s: string) {
  return s.at(0)?.toUpperCase() + s.slice(1)
}

export default function Vastakohtamuistipeli() {
  const [tries, setTries] = useState(0)
  const [words, setWords] = useState<Wordlist>({ ...emptyWordlist });
  const [loaded, setLoaded] = useState<boolean>(false);
  const [gamestate, setGamestate] = useState<Gamestate>({ cards: [], canPlay: false, found: { ...emptyWordlist } });
  const handleCorrect = () => {
    const flipPair = gamestate.cards.filter(c => c.flipped)

    setGamestate(gs => {
      const wordclass = flipPair[0].word.wordclass

      return {
        ...gs,
        cards: gs.cards.filter(c => !c.flipped),
        found: {
          ...gs.found,
          [wordclass]: [
            ...gs.found[wordclass],
            [flipPair[0].word.word, flipPair[1].word.word]
          ]
        }
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
    setTries(t => t + 1)
    if (flipPair[0].pair == flipPair[1].word.word) handleCorrect()
    else handleIncorrect()
  }
  useEffect(() => {
    handlePlay()
  }, [gamestate])
  // Aloita peli, kun sanat ladattu
  useEffect(() => {
    if (!loaded) return
    startGame()
  }, [loaded])
  // Ilmoita, kun sanat ladattu
  useEffect(() => {
    let fail = false
    classes.forEach(l => { if (words[l].length == 0) fail = true })
    if (fail) return
    setLoaded(true);
  }, [words])
  // Lataa sanat
  useEffect(() => {
    classes.forEach(luokka =>
      fetch(`/sanat/${luokka}.txt`).then(res => res.text()).then(sanalista => setWords(s => {
        const s2 = { ...s }
        s2[luokka] = sanalista.split("\n").filter(asia => asia).map(sanamasiina =>
          [sanamasiina.split(" ")[0], sanamasiina.split(" ")[1]]
        )
        return s2
      }
      )).catch(console.log)
    )
  }, [])
  const addCards = (wordclass: Wordclass, pair: [string, string], perm: number[], i: number, cards: Card[]) => {
    cards.push({
      pos: perm[i + 1],
      flipped: false,
      word: {
        word: pair[1],
        wordclass: wordclass
      },
      pair: pair[0]
    })
    cards.push({
      pos: perm[i],
      flipped: false,
      word: {
        word: pair[0],
        wordclass: wordclass
      },
      pair: pair[1]
    })
  }
  const startGame = () => {
    const adj = pickK(words.adjektiivit, 4)
    const ver = pickK(words.verbit, 3)
    const sub = pickK(words.substantiivit, 3)
    const other = pickK(words.muut, 2)
    const perm = permute(24)
    let i = 0
    const cards: Card[] = []
    adj.forEach((curr) => {
      addCards("adjektiivit", curr, perm, i, cards)
      i += 2
    })
    ver.forEach((curr) => {
      addCards("verbit", curr, perm, i, cards)
      i += 2
    })
    sub.forEach((curr) => {
      addCards("substantiivit", curr, perm, i, cards)
      i += 2
    })
    other.forEach((curr) => {
      addCards("muut", curr, perm, i, cards)
      i += 2
    })
    setGamestate({ cards: cards, canPlay: true, found: { ...emptyWordlist } })
  }
  return <div style={
    {
      display: "flex",
      flexDirection: 'row',
      height: "100vh"
    }
  }>
    <p className='text-1' style={
      {
        position: "absolute",
        top: "1em",
        left: "1em",

      }
    }>Käännöt: {tries}</p>
    <div id='muistipeli' style={{
    }}>
      {gamestate.cards.map(c => {
        return <Kortti pos={c.pos} key={c.pos} teksti={c.word.word} käännetty={c.flipped} onClick={() => {
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
    <div id='found' className='bluebox' style={{
      padding: "2em",
      display: "flex",
      flexDirection: "column",
      width: "25vw",
      alignItems: "center"

    }}>
      <h2 className='title-1' style={{
        marginBottom: "1.5em"
      }}>LÖYDETYT PARIT</h2>
      {Object.entries(gamestate.found).map(([wclass, list]) => {
        if (list.length == 0) return <></>
        return <div key={wclass} style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          marginBottom: "1.5em"
        }}>
          <h3 className='title-2' style={{ marginBottom: "0.5em" }}>{capital(wclass)}</h3>
          {list.map((pair) => <p key={pair[0]} style={{ marginBottom: "0.2em" }} className='text-1'>{capital(pair[0])} - {capital(pair[1])}</p>)}
        </div>
      })}
    </div>
  </div>
}
