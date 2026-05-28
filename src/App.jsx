import './App.css'
import Crops from './Crops.jsx'
import heroImg from './assets/Logo sin fondo.png'

function App() {
  return (
    <div className="app">
      <header className="page-header">
        <div className="header-content">
          <p className="eyebrow">Panel agrícola</p>
          <h1>Gestor de cultivos</h1>
          <p>Controla tu inventario de cultivos con registros claros y simples.</p>
        </div>
        <div className="header-image">
          <img src={heroImg} alt="Logo agricola" />
        </div>
      </header>
      <Crops />
    </div>
  )
}

export default App
