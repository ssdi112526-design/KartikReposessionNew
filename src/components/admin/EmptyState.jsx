export default function EmptyState({ message = 'No records found.' }) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-muted">
      {message}
    </div>
  );
}
