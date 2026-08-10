import './style/style.css'
import { Route, Routes } from 'react-router-dom'
import Vastakohtamuistipeli from './components/Vastakohtamuistipeli'

function App() {

  return (
    <Routes>
      <Route path="" element={<></>}>
      </Route>
      <Route path="vastakohtamuistipeli" element={<Vastakohtamuistipeli></Vastakohtamuistipeli>}>
      </Route>
      <Route path="asetukset" element={<></>}>
      </Route>
    </Routes>
  )
}

export default App
