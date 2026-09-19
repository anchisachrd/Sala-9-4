import { useState } from 'react'
import { CloseIcon, DeleteIcon } from './icons'

export default function DeleteConfirmModal({ title, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    setDeleting(true)
    setError('')
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Something went wrong')
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs bg-[#FAF6EC] rounded-2xl p-5 flex flex-col gap-4 font-pangolin"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg text-[#474747]">Delete movie</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <CloseIcon size={18} className="text-[#474747]" />
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Remove <span className="font-medium text-[#474747]">{title}</span> and its
          ratings + notes? This can't be undone.
        </p>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-1.5 text-sm text-[#474747] bg-white shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
          >
            <DeleteIcon size={14} />
            {deleting ? 'deleting…' : 'delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
