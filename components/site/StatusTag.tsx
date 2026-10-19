// Marks work that's public but still being iterated on.
export default function StatusTag({ className }: { className?: string }) {
  return (
    <span className={className ? `status-tag ${className}` : 'status-tag'}>
      <span className="status-dot" aria-hidden="true" />
      In progress
    </span>
  )
}
