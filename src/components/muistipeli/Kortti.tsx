import 'react'

type Props = {
  teksti: string;
  käännetty: boolean;
  onClick: () => void;
}

export default function Kortti({ käännetty, onClick, teksti }: Props) {
  return <button onClick={onClick} className='kortti'>{käännetty ? teksti : ""}</button>
}
