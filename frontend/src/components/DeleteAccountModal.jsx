import { AlertTriangle } from "lucide-react";
const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isLoading, password, setPassword }) => {
    if (!isOpen)
        return null;
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="font-bold text-lg flex items-center text-error mb-4">
          <AlertTriangle className="mr-2"/>
          Delete Your Account
        </h3>
        <p className="mb-4">
          Are you sure you want to delete your account? This action cannot be undone.
          All your data will be permanently removed from our servers.
        </p>
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">Enter your password to confirm</span>
          </label>
          <input type="password" placeholder="Your password" className="input input-bordered w-full" value={password} onChange={(e) => setPassword(e.target.value)}/>
        </div>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button type="button" className="btn btn-error" onClick={onConfirm} disabled={isLoading || !password}>
            {isLoading ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>);
};
export default DeleteAccountModal;
