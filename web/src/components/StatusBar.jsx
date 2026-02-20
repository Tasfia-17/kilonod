export default function StatusBar({ connected, credits, queue }) {
  return (
    <div className="status-bar">
      <div className="status">
        <span className={`dot ${connected ? 'connected' : 'disconnected'}`} />
        {connected ? 'Connected' : 'Disconnected'}
      </div>
      <div className="credits">💳 {credits.toFixed(2)} credits</div>
      {queue > 0 && <div className="queue">📋 {queue} pending</div>}
    </div>
  )
}
