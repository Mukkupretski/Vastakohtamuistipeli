import type { Ref } from "react";

type Props = {
  onRestart: () => void;
  found: string[]
  ref: Ref<HTMLDialogElement>;
};

export default function Enddialog({ found, onRestart, ref }: Props) {
  return (
    <dialog ref={ref} id="enddialog" className="bluebox">
      <div>
        <h2 className="title-0">ONNISTUIT</h2>
        <div id="endfoundsanonta">{
          found.map((sanonta) => {
            return <div className="text-2"><i>{sanonta}</i></div>
          })
        }</div>
        <div className="buttonrow">
          <button className="iconbutton" aria-label="Poistu">
            <img src="/icons/Home.png"></img>
          </button>
          <button className="iconbutton" onClick={onRestart} aria-label="Pelaa uudelleen">
            <img src="/icons/Restart.png"></img>
          </button>
        </div>
      </div>
    </dialog>
  );
}
