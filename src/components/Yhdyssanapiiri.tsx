import { Fragment, useEffect, useRef, useState } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import './yhdyssanapeli/dropstyle.css'
import './yhdyssanapeli/piiristyle.css'

import { Droppable } from './util/Droppable';
import { Draggable } from './util/Draggable';

//
// function GetCycle(origin: [number, number], r: number, n: number): [number, number][] {
//   const res: [number, number][] = Array(n).fill([0, 0])
//   const x = origin[0]
//   const y = origin[1]
//   res[0] = [x, y - r]
//   const dy = 2 / Math.ceil(n / 2);
//   for (let i = 1; i <= Math.floor((n - 1) / 2); i++) {
//     const yi = -1 + i * dy
//     const theta = Math.asin(yi)
//     // cos is positive
//     const xi = Math.cos(theta)
//     res[i] = [x + r * xi, y + r * yi]
//     res[n - i] = [x - r * xi, y + r * yi]
//   }
//   if (n % 2 == 0) {
//     res[n / 2] = [x, y + r]
//   }
//   return res;
// }
//TODO: just 2 bottom
function partition(n: number) {
  const floor: number = Math.floor(n / 4)
  const rem: number = n % 4
  const splits = [0, floor - 1 + (rem % 2), 2 * floor - 1 + (rem > 0 ? 1 : 0) + (rem > 2 ? 1 : 0), 2 * floor - 1 + (rem > 0 ? 1 : 0) + (rem > 2 ? 1 : 0) + floor, n]
  return splits
}
function drawSegment(r1: DOMRect, r2: DOMRect, text?: string) {
  const x1 = (r1.left + r1.right) / 2
  const y1 = (r1.top + r1.bottom) / 2

  const x2 = (r2.left + r2.right) / 2
  const y2 = (r2.top + r2.bottom) / 2

  const dx = x2 - x1
  const dy = y2 - y1

  const length = Math.sqrt(dx ** 2 + dy ** 2)
  const theta = Math.atan2(dy, dx) * 180 / Math.PI
  return <><div
    className={`segment${text ? " correctseg" : ""}`}
    style={{
      width: `${length}px`,
      transform: `translate(${x1}px, ${y1}px) rotate(${theta}deg)`,
    }}
  /></>
}

function extractChildren(piirintausta: HTMLDivElement) {
  const top = Array.from(piirintausta.querySelector(".piirirow")?.children ?? []).map((child) => child.getBoundingClientRect())
  const bottom = Array.from(piirintausta.querySelector(".piirirowreverse")?.children ?? []).map((child) => child.getBoundingClientRect())
  const right = Array.from(piirintausta.querySelector(".piiricol")?.children ?? []).map((child) => child.getBoundingClientRect())
  const left = Array.from(piirintausta.querySelector(".piiricolreverse")?.children ?? []).map((child) => child.getBoundingClientRect())
  return [...top, ...right, ...(bottom), ...(left)]
}

export default function Yhdyssanapiiri() {
  const piirinKoko = 5
  const piiriRef = useRef<HTMLDivElement | null>(null)
  const [piiri, setPiiri] = useState<number[]>([])
  // use wordnum as string as key
  const [numeroSanaksi, setNumeroSanaksi] = useState<Record<string, string>>({})
  // use wordnums as "m,n" as key
  const [numerotSanaksi, setNumerotSanaksi] = useState<Record<string, string>>({})
  const [draggables, setDraggables] = useState(["a", "b", "c", "d", "e", "f", "g", "h", "e", "f", "g", "h"]);
  // maps draggable element to its slot
  const [draggablePoses, setDraggablePoses] = useState<(number | undefined)[]>(Array(draggables.length).fill(undefined));
  const targetCount = draggables.length
  const targets = Array.from({ length: targetCount }, (_, i) => i);
  const splits = partition(targetCount)
  const targetsPart: number[][] = [[], [], [], []]
  let j = 0;
  targets.map((t, i) => {
    if (i > splits[j + 1]) j++
    targetsPart[j].push(t)
  })
  useEffect(() => {
    fetch(`/sanat/sanapiirit/${piirinKoko}.txt`).then(res => res.text()).then(sanalista => setPiiri(() => {
      const lst = sanalista.split("\n").filter(asia => asia).map(sanamasiina =>
        sanamasiina.split(" ").map(num => parseInt(num))
      )
      return lst[Math.floor(Math.random() * lst.length)]
    }
    )).catch(console.log)

  }, [])
  const segments: React.JSX.Element[] = []
  if (piiriRef.current) {

    const boxes = extractChildren(piiriRef.current!)
    for (let index = 0; index < boxes.length; index++) {
      const box1 = boxes[index];
      const box2 = boxes[(index + 1) % boxes.length];
      segments.push(drawSegment(box1, box2))
    }

  }
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
      setNumerotSanaksi(res)
    })
  }, [piiri])
  const getBox = (id: number) => {
    const draggableInside = draggablePoses.findIndex(v => v == id)
    let d = undefined
    if (draggableInside !== -1) d = draggables[draggableInside]
    return <Droppable key={id} id={id.toString()}>
      {draggableInside !== -1 ? <Draggable contained id={d!} key={d}>{d}</Draggable> : <></>}
    </Droppable>
  }
  return (
    <>
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
            <div ref={piiriRef} id="piirintausta" >
              {segments}
              <div className='piiriosa piirirow'>{targetsPart[0].map(getBox)}</div>
              <div className='colcontrol'>
                <div className='piiriosa piiricolreverse'>{targetsPart[3].map(getBox)}</div>
                <div className='piiriosa piiricol'>{targetsPart[1].map(getBox)}</div>
              </div>
              <div className='piiriosa piirirowreverse'>{targetsPart[2].map(getBox)}</div>
            </div>
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
    </>
  );
};
