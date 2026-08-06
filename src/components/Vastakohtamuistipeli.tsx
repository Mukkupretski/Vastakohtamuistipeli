import 'react'
import { startTransition, useEffect, useState } from 'react'

type Parilista = [string, string][];
type Luokka = "adjektiivit" | "verbit" | "substantiivit" | "muut";
const luokat: Luokka[] = ["adjektiivit", "verbit", "substantiivit", "muut"]
type Kortti = {
  pari: number;
  sana: string;
  käännetty: boolean;
  sijainti: number;
}
type Pelitila = {
  kortit: Kortti[];
  saaPelata: boolean;

}

// returns random permutation of {0,..., n-1}
function permute(n: number) {
  let ls = [];
  for (let index = 0; index < n; index++) {
    ls.push(index)
  }
  const res = [];
  for (let i = 0; i < n; i++) {
    const pos = Math.floor(Math.random() * (n - i))
    res.push(ls[pos])
    ls = ls.filter(el => el != pos);
  }
  return res;
}

// returns random k-combination from {0,..., n-1}
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

export default function Vastakohtamuistipeli() {
  const [sanat, setSanat] = useState<{ "verbit": Parilista, "adjektiivit": Parilista, "substantiivit": Parilista, "muut": Parilista }>({ "verbit": [], "adjektiivit": [], "substantiivit": [], "muut": [] });
  const [sanatLadattu, setSanatLadattu] = useState<boolean>(false);
  const [pelitila, setPelitila] = useState<Pelitila>({ kortit: [], saaPelata: false });
  useEffect(() => {
    luokat.forEach(l => { if (!sanat[l].length) return })
    setSanatLadattu(true);
  }, [sanat])
  useEffect(() => {
    luokat.forEach(luokka =>
      fetch(`/${luokka}.txt`).then(res => res.text()).then(sanalista => setSanat(s => {
        s[luokka] = sanalista.split("\n").filter(asia => asia).map(sanamasiina =>
          [sanamasiina.split(" ")[0], sanamasiina.split(" ")[1]]
        )
        return s
      }
      )).catch(console.log)
    )
  }, [])
  const aloitaPeli = () => {

  }
  useEffect(() => {

  }, [sanatLadattu])
  return <div></div>
}
