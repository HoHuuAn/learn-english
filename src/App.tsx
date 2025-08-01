import { Routes, Route } from 'react-router-dom'
import TopicList from './components/TopicList'
import VocabularyQuizPage from './components/VocabularyQuizPage'
import LearningPage from './components/LearningPage'
import './App.css'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<TopicList />} />
        <Route path="/learn/:topicId" element={<LearningPage />} />
        <Route path="/quiz/:topicId" element={<VocabularyQuizPage />} />
      </Routes>
    </>
  )
}

export default App
