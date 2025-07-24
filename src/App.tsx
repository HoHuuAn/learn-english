import { Routes, Route } from 'react-router-dom'
import TopicList from './components/TopicList'
import VocabularyQuizPage from './components/VocabularyQuizPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<TopicList />} />
      <Route path="/quiz/:topicId" element={<VocabularyQuizPage />} />
    </Routes>
  )
}

export default App
