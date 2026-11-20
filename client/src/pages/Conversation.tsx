import { ArrowLeft, ArrowUp, MessageCircle, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import {
  getMatches,
  getMessages,
  sendMessage,
  type ChatMessage,
  type MatchProfile,
} from '../services/matchesApi'
import { getTrending } from '../services/trendingApi'

function Conversation() {
  const { matchId: rawMatchId } = useParams()
  const matchId = Number(rawMatchId)
  const { user } = useAuth()
  const [match, setMatch] = useState<MatchProfile | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [prompts, setPrompts] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const afterId = useRef(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!Number.isSafeInteger(matchId) || matchId < 1) return
    let active = true
    const fetchConversation = async () => {
      try {
        const [matches, loadedMessages, trending] = await Promise.all([
          getMatches(),
          getMessages(matchId),
          getTrending(),
        ])
        if (!active) return
        const currentMatch = matches.find((item) => item.matchId === matchId)
        if (!currentMatch) {
          setError('This conversation is not available.')
          return
        }
        setMatch(currentMatch)
        setMessages(loadedMessages)
        afterId.current = loadedMessages.at(-1)?.id ?? 0
        setPrompts(trending.prompts)
      } catch {
        if (active) {
          setError('We could not open this conversation. Check your connection and try again.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchConversation()
    return () => { active = false }
  }, [matchId])

  useEffect(() => {
    if (!match) return
    const timer = window.setInterval(() => {
      void getMessages(matchId, afterId.current)
        .then((newMessages) => {
          if (newMessages.length === 0) return
          setMessages((current) => {
            const knownIds = new Set(current.map((message) => message.id))
            return [...current, ...newMessages.filter((message) => !knownIds.has(message.id))]
          })
          afterId.current = Math.max(afterId.current, ...newMessages.map((message) => message.id))
        })
        .catch(() => setError('New messages could not be refreshed.'))
    }, 3000)
    return () => window.clearInterval(timer)
  }, [match, matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = draft.trim()
    if (!body || sending || !match) return
    setSending(true)
    setError('')
    try {
      const message = await sendMessage(matchId, body)
      setMessages((current) => current.some((item) => item.id === message.id)
        ? current
        : [...current, message])
      afterId.current = Math.max(afterId.current, message.id)
      setDraft('')
    } catch {
      setError('Your message could not be sent. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  if (!Number.isSafeInteger(matchId) || matchId < 1) {
    return <section className="conversation-state conversation-error">This conversation is not available.</section>
  }

  if (loading) {
    return <section className="conversation-state" role="status">Opening your conversation…</section>
  }

  if (error && !match) {
    return (
      <section className="conversation-state conversation-error" role="alert">
        <p>{error}</p>
        <Link className="coy-button coy-button-secondary" to="/matches">
          <ArrowLeft size={16} aria-hidden="true" /> Back to matches
        </Link>
      </section>
    )
  }

  return (
    <section className="conversation-view" aria-labelledby="conversation-title">
      <header className="conversation-header">
        <Link className="conversation-back" to="/matches" aria-label="Back to matches">
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
        <div className="conversation-avatar" aria-hidden="true">
          {match?.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="conversation-person">
          <h1 id="conversation-title">{match?.name}</h1>
          <span>You matched — say hello</span>
        </div>
        <MessageCircle size={20} aria-hidden="true" />
      </header>

      <div className="conversation-messages" aria-live="polite" aria-label="Messages">
        <div className="conversation-welcome">
          <Sparkles size={18} aria-hidden="true" />
          <p>You both chose to connect. Start with something kind and curious.</p>
        </div>
        {messages.map((message) => {
          const ownMessage = message.senderUserId === user?.id
          return (
            <article
              key={message.id}
              className={`chat-message${ownMessage ? ' chat-message-own' : ''}`}
            >
              <p>{message.body}</p>
              <time>{new Date(`${message.createdAt.replace(' ', 'T')}Z`).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}</time>
            </article>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="conversation-compose-area">
        {prompts.length > 0 && messages.length === 0 && (
          <div className="chat-prompts" aria-label="Conversation starters">
            {prompts.slice(0, 2).map((prompt) => (
              <button key={prompt} type="button" onClick={() => setDraft(prompt)}>
                <Sparkles size={13} aria-hidden="true" /> {prompt}
              </button>
            ))}
          </div>
        )}
        {error && <p className="chat-inline-error" role="alert">{error}</p>}
        <form className="conversation-composer" onSubmit={(event) => void handleSend(event)}>
          <textarea
            aria-label="Write a message"
            maxLength={1000}
            placeholder={`Message ${match?.name ?? ''}…`}
            rows={1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleComposerKeyDown}
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={sending || !draft.trim()}
          >
            <ArrowUp size={19} aria-hidden="true" />
          </button>
        </form>
        <p className="composer-hint">Only you and {match?.name} can see this conversation.</p>
      </div>
    </section>
  )
}

export default Conversation
