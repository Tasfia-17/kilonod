import { useEffect, useRef, useState } from 'react'

export function useWebSocket(url, handlers) {
  const [connected, setConnected] = useState(false)
  const ws = useRef(null)

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        setConnected(true)
        console.log('[WS] Connected')
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'permission' && handlers.onPermission) {
            handlers.onPermission(data)
          } else if (data.type === 'credits' && handlers.onCredits) {
            handlers.onCredits(data)
          }
        } catch (e) {
          console.error('[WS] Parse error:', e)
        }
      }

      ws.current.onclose = () => {
        setConnected(false)
        console.log('[WS] Disconnected, reconnecting...')
        setTimeout(connect, 2000)
      }

      ws.current.onerror = (err) => {
        console.error('[WS] Error:', err)
      }
    }

    connect()

    return () => {
      if (ws.current) ws.current.close()
    }
  }, [url])

  const send = (data) => {
    if (ws.current?.readyState === 1) {
      ws.current.send(JSON.stringify(data))
    }
  }

  return { connected, send }
}
