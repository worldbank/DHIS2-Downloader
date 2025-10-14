// DownloadResultsTable.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { queryDb } from '../service/db'
import { useTranslation } from 'react-i18next'
import { MicroArrowTopRight } from '../components/Icons'

const headers = [
  'runId',
  'queryId',
  'ok',
  'chunkIndex',
  'ou',
  'startPeriod',
  'endPeriod',
  'dxCount',
  'errorMessage',
  'createdAt'
]

const esc = (v) => (v == null ? '' : /[,"\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : v)

const toCsv = (rows) =>
  [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n')

const DownloadResultsTable = () => {
  const { t } = useTranslation()
  const [activeRunId, setActiveRunId] = useState(null)

  // Fetch all runs
  const runs = useLiveQuery(async () => {
    return await queryDb.runs.orderBy('id').reverse().toArray()
  }, [])

  // Set default active run (latest)
  useEffect(() => {
    if (runs?.length && !activeRunId) setActiveRunId(runs[0].id)
  }, [runs, activeRunId])

  // Load results for current run
  const results = useLiveQuery(
    async () => {
      if (!activeRunId) return []
      const rows = await queryDb.results.where('runId').equals(activeRunId).toArray()
      const queryIds = [...new Set(rows.map((r) => r.queryId).filter(Boolean))]
      const qs = queryIds.length ? await queryDb.query.bulkGet(queryIds) : []
      const qMap = new Map(qs.filter(Boolean).map((q) => [q.id, q]))
      return rows.map((r) => ({
        ...r,
        _dimensionName: qMap.get(r.queryId)?.dimensionName
      }))
    },
    [activeRunId],
    []
  )

  const summary = useMemo(() => {
    let success = 0,
      fail = 0
    results.forEach((r) => (r.ok ? success++ : fail++))
    return { success, fail }
  }, [results])

  const handleExport = async () => {
    if (!results.length) return
    const csv = toCsv(results)
    const path = await window.electronAPI.selectSaveLocation?.()
    if (!path) return
    const stream = window.fileSystem.createWriteStream(path, { flags: 'w', encoding: 'utf8' })
    stream.write('\uFEFF')
    stream.write(csv)
    stream.end()
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!runs || runs.length === 0) {
    return (
      <p className="text-center text-gray-500">{t('history.resultsTitle', 'No runs available')}</p>
    )
  }

  return (
    <div className="mb-8 w-full flex flex-col space-y-4">
      {/* Toolbar Component */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 rounded-t-lg">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-semibold text-gray-700">{t('history.resultsTitle')}</label>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Run:</label>
            <select
              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
              value={activeRunId || ''}
              onChange={(e) => setActiveRunId(Number(e.target.value))}
            >
              {(runs || []).map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} • {r.ok ? t('history.ok') : '✗ ' + t('history.failed')}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600">
            <span className="text-green-600 font-medium">✓ {summary.success}</span>
            {' · '}
            <span className="text-red-600 font-medium">✗ {summary.fail}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            disabled={!results.length}
            className="text-blue-600 hover:text-blue-800 font-semibold px-4 text-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MicroArrowTopRight /> {t('history.exportCsv')}
          </button>
        </div>
      </div>

      {/* Table Component */}
      <div className="overflow-x-auto px-4">
        <div className="w-full bg-white rounded-lg shadow-lg">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-gray-800 uppercase text-sm leading-normal">
                <th className="py-2 px-2 whitespace-nowrap">Run</th>
                <th className="py-2 px-2 whitespace-nowrap">Query</th>
                <th className="py-2 px-2 whitespace-nowrap">Status</th>
                <th className="py-2 px-2 whitespace-nowrap">Idx</th>
                <th className="py-2 px-2 whitespace-nowrap">OU</th>
                <th className="py-2 px-2 whitespace-nowrap">Start</th>
                <th className="py-2 px-2 whitespace-nowrap">End</th>
                <th className="py-2 px-2 whitespace-nowrap">DX</th>
                <th className="py-2 px-2 whitespace-nowrap">Query Name</th>
                <th className="py-2 px-2 whitespace-nowrap">Timestamp</th>
                <th className="py-2 px-2 whitespace-nowrap">Error</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 text-xs font-light">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-2 px-2 [word-break:break-word]">{r.runId}</td>
                  <td className="py-2 px-2 [word-break:break-word]">{r.queryId}</td>
                  <td
                    className={`py-2 px-2 font-medium ${r.ok ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {r.ok ? '✓ OK' : '✗ Failed'}
                  </td>
                  <td className="py-2 px-2 [word-break:break-word]">{r.chunkIndex ?? '-'}</td>
                  <td className="py-2 px-2 [word-break:break-word] max-w-[280px]" title={r.ou}>
                    {r.ou || '-'}
                  </td>
                  <td className="py-2 px-2 [word-break:break-word]">{r.startPeriod || '-'}</td>
                  <td className="py-2 px-2 [word-break:break-word]">{r.endPeriod || '-'}</td>
                  <td className="py-2 px-2 [word-break:break-word]">{r.dxCount ?? '-'}</td>
                  <td
                    className="py-2 px-2 [word-break:break-word] max-w-[260px]"
                    title={r._dimensionName || ''}
                  >
                    {r._dimensionName || '-'}
                  </td>
                  <td className="py-2 px-2 [word-break:break-word]">{formatDate(r.createdAt)}</td>
                  <td
                    className="py-2 px-2 [word-break:break-word] text-red-600 max-w-[280px]"
                    title={r.errorMessage || ''}
                  >
                    {r.errorMessage || '-'}
                  </td>
                </tr>
              ))}
              {!results.length && (
                <tr>
                  <td colSpan={11} className="text-center text-gray-500 py-4">
                    {t('history.noResults', 'No results available')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DownloadResultsTable
