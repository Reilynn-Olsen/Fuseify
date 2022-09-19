import React from 'react';
import './css/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Home';
import InviteFriends from './InviteFriends';
import JoinFuse from './JoinFuse';
import Group from './Group'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/InviteFriends/:groupId" element={<InviteFriends />} />
          <Route path="/login/group/:groupId/user/:userId" element={<JoinFuse />}/>
          <Route path="/fuse/group/:groupId" element={<Group />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
