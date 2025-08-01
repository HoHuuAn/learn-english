import { useState, useEffect } from 'react'
import { X, Maximize2, Minimize2 } from 'lucide-react'

interface DictionaryFrameProps {
    isOpen: boolean
    onClose: () => void
}

const DictionaryFrame = ({ isOpen, onClose }: DictionaryFrameProps) => {
    const [isMaximized, setIsMaximized] = useState(false)
    const [selectedText, setSelectedText] = useState('')

    useEffect(() => {
        if (isOpen) {
            // Enable text selection tracking
            const handleMouseUp = () => {
                const selection = window.getSelection()
                const text = selection?.toString().trim()
                if (text && text.length > 0) {
                    setSelectedText(text)
                }
            }

            document.addEventListener('mouseup', handleMouseUp)
            return () => {
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isOpen])

    useEffect(() => {
        if (isOpen && selectedText) {
            // Send selected text to Laban dictionary frame
            const iframe = document.getElementById('laban-frame') as HTMLIFrameElement
            if (iframe && iframe.contentWindow) {
                try {
                    // Try to communicate with the iframe
                    iframe.contentWindow.postMessage({
                        type: 'LOOKUP_WORD',
                        word: selectedText
                    }, '*')
                } catch (error) {
                    console.log('Could not communicate with dictionary frame')
                }
            }
        }
    }, [selectedText, isOpen])

    if (!isOpen) return null

    const frameUrl = `https://dict.laban.vn/api/frame?word=${encodeURIComponent(selectedText || 'hello')}`

    return (
        <div className={`
            fixed bg-white shadow-2xl border rounded-lg transition-all duration-300 z-50
            ${isMaximized
                ? 'inset-4'
                : 'bottom-4 right-4 w-96 h-96'
            }
        `}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <img
                        src="https://dict.laban.vn/favicon.ico"
                        alt="Laban Dictionary"
                        className="w-5 h-5"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none'
                        }}
                    />
                    <h3 className="font-semibold text-gray-800">Từ điển Laban</h3>
                    {selectedText && (
                        <span className="text-sm text-blue-600 font-medium">- {selectedText}</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMaximized(!isMaximized)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title={isMaximized ? "Thu nhỏ" : "Phóng to"}
                    >
                        {isMaximized ? (
                            <Minimize2 className="w-4 h-4" />
                        ) : (
                            <Maximize2 className="w-4 h-4" />
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Đóng"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Frame Content */}
            <div className="h-full pb-12">
                <iframe
                    id="laban-frame"
                    src={frameUrl}
                    className="w-full h-full border-0"
                    title="Laban Dictionary"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                />
            </div>

            {/* Instructions */}
            <div className="absolute bottom-0 left-0 right-0 bg-blue-50 p-2 text-xs text-blue-700 rounded-b-lg">
                💡 Chọn từ bất kỳ trên trang để tra cứu tự động
            </div>
        </div>
    )
}

export default DictionaryFrame
