import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Layout from './components/Layout'
import Public from './components/Public'
import PeopleLayout from './components/PeopleLayout'
import Welcome from './pages/Welcome'
import VerifyDoc from './pages/VerifyDoc'
import LocationVerification from "./pages/LocationVerification";
// import PersistLogin from './features/auth/PersistLogin'
import { ROLES } from './config/roles'
import RequireAuth from './features/auth/RequireAuth'


function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>

        <Route index element={<Public />} />
        <Route path='/login' element={<Login />} />
        <Route path='/verify_location' element={<LocationVerification/>}/>
        <Route path='/signup' element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<RequireAuth allowedRoles={[...Object.values(ROLES)]} />}>

          <Route path='/verify' element={<VerifyDoc />} />

          <Route path='people' element={<PeopleLayout />}>
            <Route index element={<Welcome />} />

            {/* here i will write code for admin portal */}
          </Route>
        </Route>
        {/* </Route> End Protected Routes */}


      </Route>
    </Routes>
  );
}

export default App;