import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage';
import DraftPage from './components/DraftPage';
import { DraftProvider } from './components/DraftContext';

function App() {
    return (
      <DraftProvider>
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/draft/:draftType" element={<DraftPage />} />
            </Routes>
        </Router>
      </DraftProvider>
    );
}

export default App;


