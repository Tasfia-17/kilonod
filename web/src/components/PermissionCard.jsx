export default function PermissionCard({ permission, onApprove, onReject, onAutoApprove }) {
  const riskColors = {
    low: '#4ade80',
    medium: '#fbbf24',
    high: '#ef4444'
  }

  const actionIcons = {
    edit: '✏️',
    read: '👁️',
    delete: '🗑️',
    execute: '⚡',
    create: '➕',
    modify: '🔧'
  }

  const icon = actionIcons[permission.action] || '📝'

  return (
    <div className="card">
      <div className="card-header">
        <span className="icon">{icon}</span>
        <div className="info">
          <div className="action">{permission.action}</div>
          <div className="target">{permission.target}</div>
        </div>
        <div className="risk" style={{ color: riskColors[permission.risk] }}>
          {permission.risk}
        </div>
      </div>

      <div className="card-body">
        <div className="meta">
          <span>Cost: {permission.credits} credits</span>
          <span>Time: {new Date(permission.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="card-actions">
        <button className="btn-approve" onClick={onApprove}>
          <kbd>A</kbd> Approve
        </button>
        <button className="btn-reject" onClick={onReject}>
          <kbd>R</kbd> Reject
        </button>
      </div>

      <div className="auto-approve">
        {[1, 5, 15, 30].map(min => (
          <button key={min} onClick={() => onAutoApprove(min)}>
            <kbd>{min < 10 ? min : min/10}</kbd> {min}m
          </button>
        ))}
      </div>
    </div>
  )
}
