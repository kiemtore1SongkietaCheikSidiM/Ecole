import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './Pages/Login'
import Accueil from './Pages/Accueil'
import Error from './Pages/Error'
import ForgetPassword from './Pages/ForgetPassword'
import Layout from './Pages/Directeur/Layout/Layout'
import Dashboard from './Pages/Directeur/Dashboard'
import Register from './Pages/Directeur/Register'
import Statistique from './Pages/Directeur/Statistique'
import Liste from './Pages/Directeur/Liste'
import Bulletin from './Pages/Directeur/Bulletin'
import Layoute from './Pages/Parent/Layout/Layoute'
import Tableau from './Pages/Parent/Tableau'
import Notes from './Pages/Parent/Notes'
import Statistic from './Pages/Parent/Statistic'
import Layouts from './Pages/Enseignant/Layout/Layouts'
import Board from './Pages/Enseignant/Board'
import Absences from './Pages/Enseignant/Absences'
import Historique from './Pages/Enseignant/Historique'
import Retard from './Pages/Enseignant/Retard'
import List from './Pages/Enseignant/List'
import Statistiq from './Pages/Enseignant/Statistiq'
import Message from './Pages/Message'
import Setting from './Pages/Setting'
import BulletinEleve from './Pages/Parent/BulletinEleve'
import { ProtectedRoute } from './Declarations/Constant/ProtectedRoutes'
import Emploi_du_temps from './Pages/Directeur/Emploi_du_temps'
import Fichierdevoir from './Pages/Enseignant/Fichierdevoir'

const RoleSettingsLayout = () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null')

  if (!storedUser) {
    return <Navigate to="/login" replace />
  }

  switch (storedUser.role) {
    case 'ADMIN':
      return <Layout />
    case 'PARENT':
      return <Layoute />
    case 'ENSEIGNANT':
      return <Layouts />
    default:
      return <Navigate to="/login" replace />
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Chemin public accessible par tous/ Public routes that anayone can access */}
        <Route path='/login' element={<Login/>}/>
        <Route path='/' element={<Accueil/>}/>
        <Route path='/error' element={<Error/>}/>
        <Route path='/oublie' element={<ForgetPassword/>}/>

        <Route element={<ProtectedRoute roles={['ADMIN', 'PARENT', 'ENSEIGNANT']}><RoleSettingsLayout /></ProtectedRoute>}>
          <Route path='/general' element={<Setting/>} />
          <Route path='/profile' element={<Setting/>} />
          <Route path='/langue' element={<Setting/>} />
          <Route path='/confidentialite' element={<Setting/>} />
          <Route path='/telechargement' element={<Setting/>} />
        </Route>

        {/* Chemin prive qui est accessible que si on a des acces/ private routes that can access only with keys */}
        <Route element={<ProtectedRoute roles={['ADMIN']}><Layout/></ProtectedRoute>}>
          <Route path='/Directeur' element={<Dashboard/>}/>
          <Route path='/statDirecteur' element={<Statistique/>}/>
          <Route path='/liste' element={<Liste/>}/>
          <Route path="/emploi-du-temps" element={<Emploi_du_temps/>}/>
          <Route path='/bulletin' element={<Bulletin/>}/>
          <Route path='/Directeur/message' element={<Message/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/admin/general' element={<Setting/>}/>
          <Route path='/admin/profile' element={<Setting/>}/>
          <Route path='/admin/langue' element={<Setting/>}/>
          <Route path='/admin/confidentialite' element={<Setting/>}/>
          <Route path='/admin/telechargement' element={<Setting/>}/>
        </Route>

        <Route element={<ProtectedRoute roles={['PARENT']}><Layoute/></ProtectedRoute>}>
          <Route path='/Parent' element={<Tableau/>}/>
          <Route path='/note' element={<Notes/>}/>
          <Route path='/statParent' element={<Statistic/>}/>
          <Route path='/Parent/Bulletin' element={<BulletinEleve/>}/>
          <Route path='/Parent/message' element={<Message/>}/>
          <Route path='/parent/general' element={<Setting/>}/>
          <Route path='/parent/profile' element={<Setting/>}/>
          <Route path='/parent/langue' element={<Setting/>}/>
          <Route path='/parent/confidentialite' element={<Setting/>}/>
          <Route path='/parent/telechargement' element={<Setting/>}/>
        </Route>

        <Route element={<ProtectedRoute roles={['ENSEIGNANT']}><Layouts/></ProtectedRoute>}>
          <Route path='/Enseignant' element={<Board/>}/>
          <Route path='/absence' element={<Absences/>}/>
          <Route path='/historique' element={<Historique/>}/>
          <Route path='/retard' element={<Retard/>}/>
          <Route path='/list' element={<List/>}/>
          <Route path='/statEns' element={<Statistiq/>}/>
          <Route path='/Enseignant/message' element={<Message/>}/>
          <Route path="/fichier-devoir" element={<Fichierdevoir/>}/>
          <Route path='/enseignant/general' element={<Setting/>}/>
          <Route path='/enseignant/profile' element={<Setting/>}/>
          <Route path='/enseignant/langue' element={<Setting/>}/>
          <Route path='/enseignant/confidentialite' element={<Setting/>}/>
          <Route path='/enseignant/telechargement' element={<Setting/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App