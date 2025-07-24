import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Volume2, Eye } from 'lucide-react'
import type { Topic } from '../types'

// Shuffle function to randomize word order
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

const VocabularyQuizPage = () => {
    const { topicId } = useParams()
    const navigate = useNavigate()
    const [topic, setTopic] = useState<Topic | null>(null)
    const [shuffledWords, setShuffledWords] = useState<any[]>([])
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [userAnswer, setUserAnswer] = useState<string[]>([])
    const [isAnswered, setIsAnswered] = useState(false)
    const [showAnswer, setShowAnswer] = useState(false)
    const [feedback, setFeedback] = useState('')
    const [focusIndex, setFocusIndex] = useState(1) // Start at position 1 since first letter is shown
    const [preloadedAudio, setPreloadedAudio] = useState<HTMLAudioElement | null>(null)
    const underscoreRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        // Try to get topic from sessionStorage first
        const storedTopic = sessionStorage.getItem('currentTopic')
        if (storedTopic) {
            const parsedTopic = JSON.parse(storedTopic)
            setTopic(parsedTopic)
            setShuffledWords(shuffleArray(parsedTopic.words))
        } else {
            // If not in sessionStorage, redirect back to home
            navigate('/')
        }
    }, [topicId, navigate])

    const currentWord = shuffledWords[currentWordIndex]

    useEffect(() => {
        if (currentWord) {
            resetWord()
            // Preload audio without playing
            preloadAudio()
        }
    }, [currentWordIndex, currentWord])

    useEffect(() => {
        if (underscoreRefs.current[focusIndex]) {
            underscoreRefs.current[focusIndex]?.focus()
        }
    }, [focusIndex, userAnswer])

    const resetWord = () => {
        if (!currentWord) return

        const word = currentWord.word
        const newAnswer = Array(word.length).fill('')

        // Fill spaces automatically and only set first letter of the first word
        for (let i = 0; i < word.length; i++) {
            if (word[i] === ' ') {
                newAnswer[i] = ' '
            } else if (word[i] === '?' && i === word.length - 1) {
                // Auto-fill question mark at the end
                newAnswer[i] = '?'
            } else if (i === 0) {
                // Only the very first letter of the entire phrase
                newAnswer[i] = word[i].toLowerCase()
            }
        }

        setUserAnswer(newAnswer)
        setIsAnswered(false)
        setShowAnswer(false)
        setFeedback('')

        // Find first editable position (first letter that's not prefilled)
        let firstEditableIndex = 1
        while (firstEditableIndex < word.length &&
            (word[firstEditableIndex] === ' ' ||
                (word[firstEditableIndex] === '?' && firstEditableIndex === word.length - 1))) {
            firstEditableIndex++
        }
        setFocusIndex(firstEditableIndex)
    }

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (!currentWord) return

        const word = currentWord.word
        // Don't allow editing spaces, the first letter, or question marks at the end
        const isSpace = word[index] === ' '
        const isFirstLetter = index === 0
        const isQuestionMark = word[index] === '?' && index === word.length - 1

        if (isSpace || isFirstLetter || isQuestionMark) return

        // Allow letters and apostrophes
        if (e.key.length === 1 && /^[a-zA-Z']$/.test(e.key)) {
            const newAnswer = [...userAnswer]
            newAnswer[index] = e.key.toLowerCase()
            setUserAnswer(newAnswer)

            // Find next editable position
            let nextIndex = index + 1
            while (nextIndex < word.length) {
                const nextIsSpace = word[nextIndex] === ' '
                const nextIsFirstLetter = nextIndex === 0
                const nextIsQuestionMark = word[nextIndex] === '?' && nextIndex === word.length - 1
                if (!nextIsSpace && !nextIsFirstLetter && !nextIsQuestionMark) {
                    break
                }
                nextIndex++
            }
            if (nextIndex < word.length) {
                setFocusIndex(nextIndex)
            }
        } else if (e.key === 'Backspace') {
            const newAnswer = [...userAnswer]
            newAnswer[index] = ''
            setUserAnswer(newAnswer)

            // Find previous editable position
            let prevIndex = index - 1
            while (prevIndex >= 0) {
                const prevIsSpace = word[prevIndex] === ' '
                const prevIsFirstLetter = prevIndex === 0
                const prevIsQuestionMark = word[prevIndex] === '?' && prevIndex === word.length - 1
                if (!prevIsSpace && !prevIsFirstLetter && !prevIsQuestionMark) {
                    break
                }
                prevIndex--
            }
            if (prevIndex >= 0) {
                setFocusIndex(prevIndex)
            }
        } else if (e.key === 'ArrowLeft') {
            let prevIndex = index - 1
            while (prevIndex >= 0) {
                const prevIsSpace = word[prevIndex] === ' '
                const prevIsFirstLetter = prevIndex === 0
                const prevIsQuestionMark = word[prevIndex] === '?' && prevIndex === word.length - 1
                if (!prevIsSpace && !prevIsFirstLetter && !prevIsQuestionMark) {
                    break
                }
                prevIndex--
            }
            if (prevIndex >= 0) {
                setFocusIndex(prevIndex)
            }
        } else if (e.key === 'ArrowRight') {
            let nextIndex = index + 1
            while (nextIndex < word.length) {
                const nextIsSpace = word[nextIndex] === ' '
                const nextIsFirstLetter = nextIndex === 0
                const nextIsQuestionMark = word[nextIndex] === '?' && nextIndex === word.length - 1
                if (!nextIsSpace && !nextIsFirstLetter && !nextIsQuestionMark) {
                    break
                }
                nextIndex++
            }
            if (nextIndex < word.length) {
                setFocusIndex(nextIndex)
            }
        } else if (e.key === 'Enter') {
            e.preventDefault()
            checkAnswer()
        }
    }

    const checkAnswer = () => {
        if (!currentWord) return

        const answer = userAnswer.join('').toLowerCase()
        const correctAnswer = currentWord.word.toLowerCase()

        if (answer === correctAnswer) {
            setFeedback('Chính xác! 🎉')
            setIsAnswered(true)
        } else {
            setFeedback(`Sai rồi! Đáp án đúng: ${currentWord.word}`)
            setIsAnswered(true)
            setShowAnswer(true)
        }
    }

    const handleShowAnswer = () => {
        if (!currentWord) return

        setShowAnswer(true)
        setFeedback(`Đáp án: ${currentWord.word}`)
        const correctAnswer = currentWord.word.toLowerCase().split('')
        setUserAnswer(correctAnswer)
        setIsAnswered(true)
    }

    const handleNext = () => {
        if (currentWordIndex < shuffledWords.length - 1) {
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

    const getPronunciation = async (word: string) => {
        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
            const [entry] = await res.json()
            const phon = entry.phonetics.find((p: any) => p.audio)
            return phon?.audio
        } catch (error) {
            console.error('Error fetching pronunciation:', error)
            return null
        }
    }

    const preloadAudio = async () => {
        if (!currentWord) return

        const audioUrl = await getPronunciation(currentWord.word)
        if (audioUrl) {
            const audio = new Audio(audioUrl)
            audio.preload = 'auto' // Preload the audio file
            audio.load() // Start loading
            setPreloadedAudio(audio)
        } else {
            setPreloadedAudio(null)
        }
    }

    const playPronunciation = async () => {
        if (!currentWord) return

        if (preloadedAudio) {
            // Use preloaded audio if available
            try {
                await preloadedAudio.play()
            } catch (error) {
                console.error('Error playing preloaded audio:', error)
                // Fallback to speech synthesis
                const utterance = new SpeechSynthesisUtterance(currentWord.word)
                utterance.lang = 'en-US'
                speechSynthesis.speak(utterance)
            }
        } else {
            // Fallback: try to load and play immediately
            const audioUrl = await getPronunciation(currentWord.word)
            if (audioUrl) {
                const audio = new Audio(audioUrl)
                try {
                    await audio.play()
                } catch (error) {
                    console.error('Error playing audio:', error)
                    // Fallback to speech synthesis
                    const utterance = new SpeechSynthesisUtterance(currentWord.word)
                    utterance.lang = 'en-US'
                    speechSynthesis.speak(utterance)
                }
            } else {
                // Fallback to speech synthesis
                const utterance = new SpeechSynthesisUtterance(currentWord.word)
                utterance.lang = 'en-US'
                speechSynthesis.speak(utterance)
            }
        }
    }

    if (!topic || !currentWord) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-2xl text-gray-600">Đang tải...</div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại
                    </button>

                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">{topic.name}</h1>
                        <p className="text-base text-gray-600">
                            Từ {currentWordIndex + 1} / {shuffledWords.length}
                        </p>
                    </div>

                    <div className="w-20"></div> {/* Spacer for centering */}
                </div>

                {/* Quiz Content */}
                <div className="flex-1 bg-white rounded-2xl shadow-2xl p-6 text-center flex flex-col justify-center mx-2">
                    {/* Vietnamese Word */}
                    <div className="mb-6">
                        <h2 className="text-5xl font-bold text-gray-800 mb-2">
                            {currentWord.meaning}
                        </h2>
                        <p className="text-lg text-gray-600 italic">
                            ({currentWord.pos})
                        </p>
                    </div>

                    {/* Input Area */}
                    <div className="flex justify-center gap-2 mb-6 flex-wrap">
                        {Array.from({ length: currentWord.word.length }).map((_, index) => {
                            const char = currentWord.word[index]
                            const isSpace = char === ' '
                            const isFirstLetter = index === 0 // Only the very first letter
                            const isQuestionMark = char === '?' && index === currentWord.word.length - 1

                            if (isSpace) {
                                return (
                                    <div key={index} className="w-4 h-14 flex items-end justify-center">
                                        <div className="w-full h-1"></div>
                                    </div>
                                )
                            }

                            return (
                                <div
                                    key={index}
                                    ref={(el) => { underscoreRefs.current[index] = el }}
                                    tabIndex={isFirstLetter || isQuestionMark ? -1 : 0} // First letter and question marks are not focusable
                                    onClick={() => !(isFirstLetter || isQuestionMark) && setFocusIndex(index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className={`
                                        relative w-12 h-14 border-b-4 transition-all duration-200
                                        ${isFirstLetter || isQuestionMark
                                            ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                                            : focusIndex === index
                                                ? 'border-blue-500 bg-blue-50 focus:outline-none cursor-pointer'
                                                : 'border-gray-400 cursor-pointer hover:border-gray-500'
                                        }
                                    `}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-gray-800">
                                            {userAnswer[index]?.toUpperCase() || ''}
                                        </span>
                                    </div>
                                    {focusIndex === index && !isAnswered && !(isFirstLetter || isQuestionMark) && (
                                        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-10 bg-blue-500 cursor-blink"></div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Feedback */}
                    {feedback && (
                        <div className={`text-xl font-bold mb-4 ${feedback.includes('Chính xác') ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {feedback}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-3 mb-4">
                        {!isAnswered && (
                            <>
                                <button
                                    onClick={checkAnswer}
                                    className="px-5 py-2 bg-blue-600 text-white text-base font-bold rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    Kiểm tra
                                </button>
                                <button
                                    onClick={handleShowAnswer}
                                    className="px-5 py-2 bg-gray-600 text-white text-base font-bold rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    Quên
                                </button>
                            </>
                        )}

                        {(isAnswered || showAnswer) && (
                            <button
                                onClick={playPronunciation}
                                className="px-5 py-2 bg-green-600 text-white text-base font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <Volume2 className="w-4 h-4" />
                                Phát âm
                            </button>
                        )}
                    </div>

                    {/* Example */}
                    {(isAnswered || showAnswer) && (
                        <div className="bg-gray-50 rounded-xl p-3 mb-4">
                            <p className="text-base text-gray-700">
                                <span className="font-bold">Ví dụ:</span> {currentWord.example}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                <span className="font-bold">Phiên âm:</span> {currentWord.pronunciation}
                            </p>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handlePrev}
                            disabled={currentWordIndex === 0}
                            className={`
                                px-4 py-2 text-base font-bold rounded-xl transition-colors flex items-center gap-2
                                ${currentWordIndex === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-orange-600 text-white hover:bg-orange-700'
                                }
                            `}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={currentWordIndex === shuffledWords.length - 1}
                            className={`
                                px-4 py-2 text-base font-bold rounded-xl transition-colors flex items-center gap-2
                                ${currentWordIndex === shuffledWords.length - 1
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }
                            `}
                        >
                            Tiếp tục
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VocabularyQuizPage
