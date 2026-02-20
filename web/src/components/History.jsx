export default function History({ items }) {
  if (items.length === 0) return null

  return (
    <div className="history">
      <h3>Recent Activity</h3>
      <div className="history-list">
        {items.slice(0, 10).map((item, i) => (
          <div key={i} className={`history-item ${item.decision}`}>
            <span className="time">{new Date(item.time).toLocaleTimeString()}</span>
            <span className="action">{item.action}</span>
            <span className="target">{item.target}</span>
            <span className="decision">{item.decision}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
