import React, { useState } from "react";
import { sileo } from "sileo";
import { useNavigate } from "react-router-dom";

const DeleteAccountModal = ({ isOpen, onClose, onDelete }) => {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== "confirm-delete") {
      sileo.error({
        title: "Validation failed",
        description: "Please type 'confirm-delete' exactly.",
      });
      return;
    }

    try {
      setIsDeleting(true);
      await sileo.promise(onDelete(), {
        loading: {
          title: "Deleting account...",
          description: "Removing your account and all data.",
        },
        success: () => {
          navigate("/register");
          return {
            title: "Account deleted",
            description: "We're sorry to see you go.",
          };
        },
        error: (err) => ({
          title: "Delete failed",
          description: err?.response?.data?.message || err?.message || "Something went wrong.",
        }),
      });
    } catch (error) {
      // error handled by sileo
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#151923] border border-[#2D3343] rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-100 mb-2">Delete Account</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          This action is permanent and cannot be undone. All your chats, messages, and account details will be permanently deleted. 
          To confirm, type <span className="font-mono text-red-400 bg-red-400/10 px-1 rounded">confirm-delete</span> below.
        </p>
        
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="confirm-delete"
          className="w-full bg-[#0E1117] border border-[#2D3343] text-gray-100 placeholder-gray-600 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
        />

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#202532] transition-colors font-medium text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== "confirm-delete" || isDeleting}
            className="px-5 py-2 rounded-xl bg-red-600/90 text-white font-medium text-sm hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
