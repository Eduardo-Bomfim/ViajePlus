import { Routes, Route } from 'react-router-dom';
import ChatPage from './pages/Chat/ChatPage';

function App() {

  return (
    <Routes>
      <Route path="/*" element={<ChatPage />} />
    </Routes>
  )
}

export default App
