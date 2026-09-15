import { Fragment, useEffect, useRef, useState } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import './yhdyssanapeli/dropstyle.css'
import './yhdyssanapeli/piiristyle.css'

import { Droppable } from './util/Droppable';
import { Draggable } from './util/Draggable';


function GetCycle(origin: [number, number], r: number, n: number): [number, number][] {
  const res: [number, number][] = Array(n).fill([0, 0])
  const x = origin[0]
  const y = origin[1]
  res[0] = [x, y - r]
  const dy = 2 / Math.ceil(n / 2);
  for (let i = 1; i <= Math.floor((n - 1) / 2); i++) {
    const yi = -1 + i * dy
    const theta = Math.asin(yi)
    // cos is positive
    const xi = Math.cos(theta)
    res[i] = [x + r * xi, y + r * yi]
    res[n - i] = [x - r * xi, y + r * yi]
  }
  if (n % 2 == 0) {
    res[n / 2] = [x, y + r]
  }
  return res;
}

export default function Yhdyssanapiiri() {
  const piirinKoko = 5
  const piiriRef = useRef<HTMLImageElement | null>(null)
  const [piiri, setPiiri] = useState<number[]>([])
  // use wordnum as string as key
  const [numeroSanaksi, setNumeroSanaksi] = useState<Record<string, string>>({})
  // use wordnums as "m,n" as key
  const [numerotSanaksi, setNumerotSanaksi] = useState<Record<string, string>>({})
  const [draggables, setDraggables] = useState([]);
  // maps draggable element to its slot
  const [draggablePoses, setDraggablePoses] = useState<(number | undefined)[]>(Array(draggables.length).fill(undefined));
  const targetCount = draggables.length
  const targets = Array.from({ length: targetCount }, (_, i) => i);

  useEffect(() => {
    fetch(`/sanat/sanapiirit/${piirinKoko}.txt`).then(res => res.text()).then(sanalista => setPiiri(() => {
      const lst = sanalista.split("\n").filter(asia => asia).map(sanamasiina =>
        sanamasiina.split(" ").map(num => parseInt(num))
      )
      return lst[Math.floor(Math.random() * lst.length)]
    }
    )).catch(console.log)

  }, [])
  useEffect(() => {
    if (piiri.length == 0) return
    const k1 = piiri.map(osa => "," + osa.toString())
    const k2 = piiri.map((osa, i) => `${osa},${piiri[(i + 1) % piiri.length]},`)
    console.log(k1)
    console.log(k2)
    fetch("/sanat/sanapiirit/aToSana.txt").then(res => res.text()).then(atoword => {
      const res: Record<string, string> = {};
      atoword.split("\n").forEach((row) => {
        const pref = k1.find(osa => row.endsWith(osa))
        if (!pref) return
        const word = row.split(",")[0]
        res[pref] = word
      })
      console.log(2)
      setNumeroSanaksi(res)

    })
    fetch("/sanat/sanapiirit/abToSana.txt").then(res => res.text()).then(abtoword => {

      const res: Record<string, string> = {};
      abtoword.split("\n").forEach((row) => {
        const pref = k2.find(osa => row.startsWith(osa))
        if (!pref) return
        const word = row.split(",")[2]
        res[pref] = word
      })
      console.log(1)
      setNumerotSanaksi(res)
    })
  }, [piiri])
  console.log(numeroSanaksi)
  console.log(numerotSanaksi)
  const [rect, setRect] = useState({
    x: 0,
    y: 0,
    width: 0,
  });
  useEffect(() => {
    const updateRect = () => {
      if (!piiriRef.current) return;

      const { x, y, width } =
        piiriRef.current.getBoundingClientRect();

      setRect({ x, y, width });
    };

    updateRect();

    window.addEventListener("resize", updateRect);

    return () => {
      window.removeEventListener("resize", updateRect);
    };
  }, []);
  const cycle = GetCycle([rect.x + rect.width / 2, rect.y + rect.width / 2], rect.width / 2 * 0.67, targetCount)
  console.log(cycle)

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        const droppedTo: string | undefined = event.operation.target?.id.toString()
        const dragged: string | undefined = event.operation.source?.id.toString()
        if (dragged == undefined) return

        setDraggablePoses((prev) => {
          let next = [...prev]
          if (droppedTo == undefined) {
            next[draggables.findIndex(v => v == dragged)] = undefined
          } else {
            // clear previous from that slot
            next = next.map(slot => {
              if (slot !== parseInt(droppedTo)) return slot
              return undefined
            })
            next[draggables.findIndex(v => v == dragged)] = parseInt(droppedTo)
          }
          return next
        });
      }}
    >
      <div id="yhdyssanapeli">
        <div id="yhdyssanapiiri">
          <img ref={piiriRef} id="piirintausta" src='/icons/Piirintausta.png'></img>
          {targets.map((id) => {
            const draggableInside = draggablePoses.findIndex(v => v == id)
            let d = undefined
            if (draggableInside !== -1) d = draggables[draggableInside]
            console.log(draggableInside)
            return <Droppable style={{
              position: 'absolute',
              top: `${cycle[id][1]}px`,
              left: `${cycle[id][0]}px`,
              transform: "translate(-50%,-50%)"
            }} key={id} id={id.toString()}>
              {draggableInside !== -1 ? <Draggable contained id={d!} key={d}>{d}</Draggable> : <></>}
            </Droppable>
          }
          )}
          <div id="yhdyssanavoitto" ></div>
        </div>
        <div className='bluebox defaultdrop'>
          <h2 className='title-1'>VARASTO</h2>
          <div id="yhdyssanavarasto">
            {draggables.map((d, i) => {
              return draggablePoses[i] === undefined ? <Draggable id={d} key={d}>{d}</Draggable> : <Fragment key={i}></Fragment>
            })}
          </div>
        </div></div>
    </DragDropProvider>
  );
};
