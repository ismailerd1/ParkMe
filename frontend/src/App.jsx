import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/registerpage';
import Register2Page from './pages/register2page';
import LoginPage from './pages/loginpage';
import HomePage from './pages/homepage';
import UserProfile from './pages/profile';
import Map from './components/map';
import CreateParkSpot from './pages/parkcreatepage';
import QrScan from './pages/qrscanpage';
import ParkDetail from './pages/parkdetailpage';
import AddCredit from './pages/addcreditpage';
import OwnedParks from './pages/ownedparkspage';
import LastParks from './pages/lastparkspage';
import ReportForm from './pages/reportpage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/home" element={<HomePage/>} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register2" element={<Register2Page />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/createparkspot" element={<CreateParkSpot />} />
          <Route path="/qrscan" element={<QrScan />} /> 
          <Route path="/parkspot/:id" element={<ParkDetail />} />
          <Route path="/ownedparks" element={<OwnedParks />} /> 
          <Route path="/lastparks" element={<LastParks />} /> 
          <Route path="/addcredit" element={<AddCredit />} />
          <Route path="/reports" element={<ReportForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
