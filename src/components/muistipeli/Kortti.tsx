import 'react'

type Props = {
  teksti: string;
  käännetty: boolean;
  onClick: () => void;
  pos: number;
  rows: number;
}

export default function Kortti({ pos, käännetty, onClick, teksti, rows }: Props) {
  return <button onClick={onClick} aria-label={`Kortti ${pos + 1}`} style={{
    gridRow: `${Math.floor(pos / rows) + 1}`,
    gridColumn: `${(pos % rows) + 1}`,
  }} className='kortti text-1'>{käännetty ? teksti : ""}</button>
}
