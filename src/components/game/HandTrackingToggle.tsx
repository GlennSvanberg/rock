type HandTrackingToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function HandTrackingToggle({
  checked,
  onChange,
  disabled = false,
}: HandTrackingToggleProps) {
  return (
    <label className="game-toggle">
      <input
        type="checkbox"
        className="game-toggle-input"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="game-toggle-track" aria-hidden="true">
        <span className="game-toggle-thumb" />
      </span>
      <span className="game-toggle-label">Hand</span>
    </label>
  )
}
