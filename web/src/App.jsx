import { useState, useEffect } from 'react'
import PermissionCard from './components/PermissionCard'
import StatusBar from './components/StatusBar'
import History from './components/History'
import { useWebSocket } from './hooks/useWebSocket'
import { useKeyboard } from './hooks/useKeyboard'

export default function App() {
  const [permissions, setPermissions] = useState([])
  const [history, setHistory] = useState([])
  const [credits, setCredits] = useState(0)
  const [autoRules, setAutoRules] = useState([])
  const { connected, send } = useWebSocket('ws://localhost:8765', {
    onPermission: (perm) => {
      // Check auto-approve rules
      const rule = autoRules.find(r => 
        perm.action.includes(r.action) && perm.target.includes(r.target)
      )
      if (rule) {
        handleDecision(perm.id, 'approve')
        return
      }
      setPermissions(prev => [...prev, perm])
    },
    onCredits: (data) => setCredits(data.total)
  })

  const currentPerm = permissions[0]

  const handleDecision = (id, decision) => {
    send({ type: 'response', id, decision })
    const perm = permissions.find(p => p.id === id)
    if (perm) {
      setHistory(prev => [{ ...perm, decision, time: Date.now() }, ...prev.slice(0, 49)])
      setPermissions(prev => prev.filter(p => p.id !== id))
    }
  }

  const handleAutoApprove = (minutes) => {
    if (!currentPerm) return
    handleDecision(currentPerm.id, `approve:${minutes}m`)
    setAutoRules(prev => [...prev, {
      action: currentPerm.action,
      target: currentPerm.target,
      expires: Date.now() + minutes * 60000
    }])
  }

  useKeyboard({
    enabled: !!currentPerm,
    onApprove: () => handleDecision(currentPerm.id, 'approve'),
    onReject: () => handleDecision(currentPerm.id, 'deny'),
    onTimed: (n) => handleAutoApprove(n)
  })

  // Clean expired rules
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoRules(prev => prev.filter(r => r.expires > Date.now()))
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="app">
      <StatusBar connected={connected} credits={credits} queue={permissions.length} />
      
      {currentPerm && (
        <PermissionCard
          permission={currentPerm}
          onApprove={() => handleDecision(currentPerm.id, 'approve')}
          onReject={() => handleDecision(currentPerm.id, 'deny')}
          onAutoApprove={handleAutoApprove}
        />
      )}

      <History items={history} />
    </div>
  )
}
