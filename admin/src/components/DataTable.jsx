import { HiOutlineSearch, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

const DataTable = ({ columns, data, searchValue, onSearch, page, totalPages, onPageChange, actions, emptyMessage = 'No data found' }) => (
  <div className="card overflow-hidden">
    {onSearch && (
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="relative max-w-sm">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={searchValue} onChange={e => onSearch(e.target.value)} placeholder="Search..." className="input-field pl-9 py-2" />
        </div>
      </div>
    )}
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            {columns.map(col => (
              <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{col.label}</th>
            ))}
            {actions && <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-12 text-slate-400">{emptyMessage}</td></tr>
          ) : data.map((row, i) => (
            <tr key={row._id || i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3">{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
              ))}
              {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {totalPages > 1 && (
      <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="btn-ghost disabled:opacity-30"><HiOutlineChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="btn-ghost disabled:opacity-30"><HiOutlineChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    )}
  </div>
);

export default DataTable;
