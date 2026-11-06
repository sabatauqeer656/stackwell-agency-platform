import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';

// "Are you sure?" before something that cannot be undone. Built on the Modal, so Escape cancels,
// focus stays inside the dialog and returns to the button that opened it.
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', loading = false, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <p className="text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
