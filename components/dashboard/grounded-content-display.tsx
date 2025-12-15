"use client"

import { useState } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { ExternalLink } from "lucide-react"

interface GroundingChunk {
  web: {
    uri: string
    title: string
  }
}

interface GroundingSupport {
  segment: {
    startIndex: number
    endIndex: number
    text: string
  }
  groundingChunkIndices: number[]
  confidenceScores: number[]
}

interface GroundingMetadata {
  groundingChunks: GroundingChunk[]
  groundingSupports: GroundingSupport[]
  webSearchQueries?: string[]
}

interface GroundedContentDisplayProps {
  content: string
  groundingMetadata?: GroundingMetadata
}

export function GroundedContentDisplay({ content, groundingMetadata }: GroundedContentDisplayProps) {
  if (!groundingMetadata || !groundingMetadata.groundingSupports || groundingMetadata.groundingSupports.length === 0) {
    // No grounding metadata, display content as-is
    return <div className="whitespace-pre-wrap">{content}</div>
  }

  // Remove citation markers [1], [2], [3] etc from the content
  let cleanContent = content.replace(/\[\d+\]/g, '')
  
  // Build segments with grounding information
  const segments: Array<{
    text: string
    isGrounded: boolean
    sources?: GroundingChunk[]
    confidence?: number
  }> = []

  let lastIndex = 0
  const sortedSupports = [...groundingMetadata.groundingSupports].sort((a, b) => 
    a.segment.startIndex - b.segment.startIndex
  )

  // Calculate text adjustments due to removed citations
  const citationPattern = /\[\d+\]/g
  let match
  const removedCitations: Array<{ index: number; length: number }> = []
  while ((match = citationPattern.exec(content)) !== null) {
    removedCitations.push({ index: match.index, length: match[0].length })
  }

  // Adjust segment indices based on removed citations
  const adjustIndex = (originalIndex: number) => {
    let adjustment = 0
    for (const citation of removedCitations) {
      if (citation.index < originalIndex) {
        adjustment += citation.length
      }
    }
    return originalIndex - adjustment
  }

  sortedSupports.forEach((support) => {
    const startIdx = adjustIndex(support.segment.startIndex)
    const endIdx = adjustIndex(support.segment.endIndex)
    
    // Add non-grounded text before this segment
    if (startIdx > lastIndex) {
      segments.push({
        text: cleanContent.substring(lastIndex, startIdx),
        isGrounded: false
      })
    }

    // Add grounded text
    const sources = support.groundingChunkIndices
      ?.map(idx => groundingMetadata.groundingChunks?.[idx])
      .filter(Boolean) ?? []
    segments.push({
      text: cleanContent.substring(startIdx, endIdx),
      isGrounded: true,
      sources,
      confidence: support.confidenceScores?.[0] ?? 0
    })

    lastIndex = endIdx
  })

  // Add remaining non-grounded text
  if (lastIndex < cleanContent.length) {
    segments.push({
      text: cleanContent.substring(lastIndex),
      isGrounded: false
    })
  }

  return (
    <div className="whitespace-pre-wrap">
      {segments.map((segment, index) => {
        if (!segment.isGrounded) {
          return <span key={index}>{segment.text}</span>
        }

        return (
          <HoverCard key={index} openDelay={200}>
            <HoverCardTrigger asChild>
              <span className="cursor-help bg-yellow-200 text-gray-900 dark:bg-yellow-400 dark:text-gray-900">
                {segment.text}
              </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-80" side="top">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Sources ({segment.sources?.length || 0})
                </p>
                {segment.sources && segment.sources.length > 0 && (
                  <div className="space-y-2">
                    {segment.sources.map((source, sourceIndex) => (
                      <a
                        key={sourceIndex}
                        href={source.web.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-colors group"
                      >
                        <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0 text-gray-400 group-hover:text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors truncate">
                            {source.web.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {new URL(source.web.uri).hostname}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
                {segment.confidence && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
                    Confidence: {(segment.confidence * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
        )
      })}
    </div>
  )
}
