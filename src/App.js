import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage';
import DraftPage from './components/DraftPage';
import { DraftProvider } from './components/DraftContext';
import SleeperFormPage from './pages/SleeperFormPage';
import SleeperDraftPage from './pages/SleeperDraftPage';

function App() {
    return (
      <DraftProvider>
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/draft/:draftType" element={<DraftPage />} />
                <Route path="/sleeper" element={<SleeperFormPage/>}/>
                <Route path='/sleeper/draft' element={<SleeperDraftPage/>}></Route>
            </Routes>
        </Router>
      </DraftProvider>
    );
}

export default App;


