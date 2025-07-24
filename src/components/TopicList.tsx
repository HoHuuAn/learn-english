import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import type { Topic } from '../types'

const TopicList = () => {
    const navigate = useNavigate()
    const [topics, setTopics] = useState<Topic[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTopics()
    }, [])

    const handleTopicSelect = (topic: Topic) => {
        // Store topic data in sessionStorage and navigate
        sessionStorage.setItem('currentTopic', JSON.stringify(topic))
        navigate(`/quiz/${topic.id}`)
    }

    const loadTopics = async () => {
        try {
            // Load index file
            const indexRes = await fetch('/topics/index.json')
            const index = await indexRes.json()

            // Load all topic files
            const topicPromises = index.topics.map(async (topicInfo: any) => {
                const res = await fetch(`/topics/${topicInfo.level}/${topicInfo.id}.json`)
                const topicData = await res.json()
                return topicData
            })

            const loadedTopics = await Promise.all(topicPromises)
            setTopics(loadedTopics)
        } catch (error) {
            console.error('Error loading topics:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredTopics = topics.filter(topic =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const groupedTopics = filteredTopics.reduce((acc, topic) => {
        if (!acc[topic.level]) {
            acc[topic.level] = []
        }
        acc[topic.level].push(topic)
        return acc
    }, {} as Record<string, Topic[]>)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl text-gray-600">Đang tải...</div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-gray-800 mb-4">Học Từ Vựng Tiếng Anh</h1>
                <p className="text-2xl text-gray-600">Chọn chủ đề để bắt đầu học</p>
            </div>

            {/* Search */}
            <div className="relative mb-8 max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                    type="text"
                    placeholder="Tìm kiếm chủ đề..."
                    className="w-full pl-12 pr-4 py-4 text-xl border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Topics by level */}
            {Object.entries(groupedTopics).map(([level, levelTopics]) => (
                <div key={level} className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-700 mb-6 capitalize">
                        {level === 'beginner' && 'Cơ bản'}
                        {level === 'elementary' && 'Sơ cấp'}
                        {level === 'pre-intermediate' && 'Trung cấp sơ bộ'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {levelTopics.map((topic) => (
                            <div
                                key={topic.id}
                                onClick={() => handleTopicSelect(topic)}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 p-6"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="text-4xl mr-4">{topic.icon}</div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{topic.name}</h3>
                                        <p className="text-gray-600">{topic.words?.length || 0} từ</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 text-lg leading-relaxed">{topic.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {filteredTopics.length === 0 && !loading && (
                <div className="text-center text-2xl text-gray-500 mt-12">
                    Không tìm thấy chủ đề nào phù hợp
                </div>
            )}
        </div>
    )
}

export default TopicList
