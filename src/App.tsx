import './style/style.css'
import { Route, Routes } from 'react-router-dom'
import Vastakohtamuistipeli from './components/Vastakohtamuistipeli'
import Sanontamuistipeli from './components/Sanontamuistipeli'
import Yhdyssanapiiri from './components/Yhdyssanapiiri'

function App() {

  return (
    <Routes>
      <Route path="" element={<></>}>
      </Route>
      <Route path="vastakohtamuistipeli" element={<Vastakohtamuistipeli></Vastakohtamuistipeli>}>
      </Route>
      <Route path="sanontamuistipeli" element={<Sanontamuistipeli></Sanontamuistipeli>}>
      </Route>
      <Route path="yhdyssanapiiri" element={<Yhdyssanapiiri></Yhdyssanapiiri>}>
      </Route>
      <Route path="asetukset" element={<></>}>
      </Route>
    </Routes>
  )
}

export default App
