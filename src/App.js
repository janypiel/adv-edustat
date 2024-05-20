// App.js

import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import BrowserRouter or HashRouter
import LoginPage from './pages/loginPage';
import HomePage from './pages/profilePage';
import RegisterPage from './pages/registerPage';
import AddSubjectPage from './pages/addSubjectPage';
import SummaryPage from './pages/summaryPage'; // Import the SummaryPage component

function App() {
  return (
    <Router> {/* Wrap Routes with BrowserRouter or HashRouter */}
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/profile' element={<HomePage />} />
        <Route path='/addsubject' element={<AddSubjectPage />} />
        <Route path='/summary' element={<SummaryPage />} /> {/* Add route for the SummaryPage */}

        <Route path='*' element={<div>Page not found</div>} /> {/* Wrap text in div */}
      </Routes>
    </Router>
  );
}

export default App;