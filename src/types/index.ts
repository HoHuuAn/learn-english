export interface Topic {
    id: string
    name: string
    level: string
    icon: string
    description: string
    words: Word[]
}

export interface Word {
    word: string
    meaning: string
    pos: string
    example: string
    pronunciation: string
}

export interface TopicIndex {
    id: string
    name: string
    level: string
    icon: string
    wordCount: number
    file: string
}
