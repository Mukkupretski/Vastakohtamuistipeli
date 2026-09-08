import { capital, type Wordlist } from "../Vastakohtamuistipeli";
import type { Ref } from "react";

type Props = {
  onRestart: () => void;
  found: Wordlist;
  ref: Ref<HTMLDialogElement>;
};

export default function Enddialog({ found, onRestart, ref }: Props) {
  return (
    <dialog ref={ref} id="enddialog" className="bluebox">
      <div>
        <h2 className="title-0">ONNISTUIT</h2>
        <div id="endfound">{
          Object.entries(found).map(([wclass, list]) => {
            return <div className="wordclassfound">
              <h3 className="title-2" key={wclass}>{capital(wclass)}</h3>
              {list.map(wordpair => {
                return <div key={wordpair[0]}>
                  <p className="text-2">{capital(wordpair[0])}</p>
                  <p className="text-2">{capital(wordpair[1])}</p>
                </div>
              })}
            </div>
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
