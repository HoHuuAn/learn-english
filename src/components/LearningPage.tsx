import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Volume2, Book } from 'lucide-react'
import type { Topic } from '../types'

const LearningPage = () => {
    const { topicId } = useParams()
    const navigate = useNavigate()
    const [topic, setTopic] = useState<Topic | null>(null)
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [preloadedUtterance, setPreloadedUtterance] = useState<SpeechSynthesisUtterance | null>(null)

    useEffect(() => {
        // Try to get topic from sessionStorage first
        const storedTopic = sessionStorage.getItem('currentTopic')
        if (storedTopic) {
            const parsedTopic = JSON.parse(storedTopic)
            setTopic(parsedTopic)
        } else {
            // If not in sessionStorage, redirect back to home
            navigate('/')
        }
    }, [topicId, navigate])

    const currentWord = topic?.words[currentWordIndex]

    useEffect(() => {
        if (currentWord) {
            preloadAudio()
        }
    }, [currentWordIndex, currentWord])

    const getPronunciation = async (word: string) => {
        // Create and return SpeechSynthesisUtterance for the word
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = 'en-US'
        utterance.rate = 0.8
        utterance.pitch = 1
        utterance.volume = 1
        return utterance
    }

    const preloadAudio = async () => {
        if (!currentWord) return

        // Preload the speech utterance
        const utterance = await getPronunciation(currentWord.word)
        setPreloadedUtterance(utterance)
    }

    const playPronunciation = async () => {
        if (!currentWord) return

        if (preloadedUtterance) {
            // Use preloaded utterance if available
            try {
                speechSynthesis.speak(preloadedUtterance)
            } catch (error) {
                console.error('Error playing preloaded utterance:', error)
                // Fallback: create new utterance
                const utterance = new SpeechSynthesisUtterance(currentWord.word)
                utterance.lang = 'en-US'
                utterance.rate = 0.8
                speechSynthesis.speak(utterance)
            }
        } else {
            // Fallback: create and play new utterance
            const utterance = await getPronunciation(currentWord.word)
            speechSynthesis.speak(utterance)
        }
    }

    const handleNext = () => {
        if (currentWordIndex < (topic?.words.length || 0) - 1) {
            setCurrentWordIndex(currentWordIndex + 1)
        }
    }

    const handlePrev = () => {
        if (currentWordIndex > 0) {
            setCurrentWordIndex(currentWordIndex - 1)
        }
    }

    const handleBack = () => {
        navigate('/')
    }

    const startQuiz = () => {
        navigate(`/quiz/${topicId}`)
    }

    if (!topic || !currentWord) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
                <div className="text-3xl text-gray-600">Đang tải...</div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-blue-100 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-xl font-medium"
                    >
                        <ArrowLeft className="w-6 h-6" />
                        Quay lại
                    </button>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{topic.name}</h1>
                        <p className="text-xl text-gray-600">
                            Học từ vựng - Từ {currentWordIndex + 1} / {topic.words.length}
                        </p>
                    </div>

                    <button
                        onClick={startQuiz}
                        className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all text-xl font-medium"
                    >
                        <Book className="w-6 h-6" />
                        Làm bài tập
                    </button>
                </div>

                {/* Learning Content */}
                <div className="flex-1 bg-white rounded-3xl shadow-2xl p-8 text-center flex flex-col justify-center mx-4">
                    {/* English Word */}
                    <div className="mb-8">
                        <h2 className="text-8xl font-bold text-blue-700 mb-4">
                            {currentWord.word}
                        </h2>
                        <p className="text-2xl text-gray-600 font-medium">
                            {currentWord.pronunciation}
                        </p>
                        <p className="text-xl text-gray-500 italic mt-2">
                            ({currentWord.pos})
                        </p>
                    </div>

                    {/* Pronunciation Button */}
                    <div className="mb-8">
                        <button
                            onClick={playPronunciation}
                            className="px-8 py-4 bg-green-600 text-white text-2xl font-bold rounded-2xl hover:bg-green-700 transition-colors flex items-center gap-3 mx-auto shadow-lg"
                        >
                            <Volume2 className="w-8 h-8" />
                            Nghe phát âm
                        </button>
                    </div>

                    {/* Vietnamese Meaning - Always Shown */}
                    <div className="mb-8 bg-blue-50 rounded-2xl p-6">
                        <h3 className="text-4xl font-bold text-green-700 mb-4">
                            {currentWord.meaning}
                        </h3>
                        <div className="bg-white rounded-xl p-4">
                            <p className="text-xl text-gray-700">
                                <span className="font-bold">Ví dụ:</span> {currentWord.example}
                            </p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-center gap-6">
                        <button
                            onClick={handlePrev}
                            disabled={currentWordIndex === 0}
                            className={`
                                px-6 py-3 text-xl font-bold rounded-xl transition-colors flex items-center gap-3 shadow-lg
                                ${currentWordIndex === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-orange-600 text-white hover:bg-orange-700'
                                }
                            `}
                        >
                            <ArrowLeft className="w-6 h-6" />
                            Từ trước
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={currentWordIndex === (topic?.words.length || 0) - 1}
                            className={`
                                px-6 py-3 text-xl font-bold rounded-xl transition-colors flex items-center gap-3 shadow-lg
                                ${currentWordIndex === (topic?.words.length || 0) - 1
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }
                            `}
                        >
                            Từ tiếp
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LearningPage
