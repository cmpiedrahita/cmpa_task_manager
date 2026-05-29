import Modal from "./Modal";
import Button from "./Button";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
}

export default function ConfirmModal({ open, onClose, onConfirm, title = "¿Estás seguro?", message = "Esta acción no se puede deshacer.", loading }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        <Button variant="danger" type="button" loading={loading} onClick={onConfirm}>Eliminar</Button>
      </div>
    </Modal>
  );
}
