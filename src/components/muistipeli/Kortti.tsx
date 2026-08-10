import 'react'
import { capital } from '../Vastakohtamuistipeli';

type Props = {
  teksti: string;
  käännetty: boolean;
  onClick: () => void;
  pos: number
}

export default function Kortti({ pos, käännetty, onClick, teksti }: Props) {
  return <button onClick={onClick} style={{
    gridRow: `${Math.floor(pos / 4) + 1}`,
    gridColumn: `${(pos % 4) + 1}`,
  }} className='kortti text-1'>{käännetty ? capital(teksti) : ""}</button>
}
