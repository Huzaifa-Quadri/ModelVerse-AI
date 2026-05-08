import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  MenuIcon,
  PlusIcon,
  MessageSquareIcon,
  TrashIcon,
  LogoutIcon,
} from "./Icons";
import DeleteAccountModal from "./DeleteAccountModal";

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  sortedChats,
  currentChatId,
  loadChat,
  startNewChat,
  deleteChatById,
  isLoading,
}) => {
  const { user } = useSelector((state) => state.auth);
  const [deletingChatId, setDeletingChatId] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { handleLogout, handleDeleteAccount } = useAuth();

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    setDeletingChatId(chatId);
    await deleteChatById(chatId);
    setDeletingChatId(null);
  };

  return (
    <div
      className={`shrink-0 bg-[#151923] border-r border-[#2D3343]/50 transition-all duration-300 ease-in-out relative flex flex-col z-20 shadow-2xl ${isSidebarOpen
          ? "w-70 translate-x-0"
          : "-translate-x-full w-0 sm:translate-x-0 sm:w-18"
        } absolute sm:relative h-full`}
    >
      {/*//! Sidebar Header */}
      <div className="h-18 flex items-center justify-between px-4 border-b border-[#2D3343]/50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl hover:bg-[#2D3343] text-gray-400 hover:text-white transition-colors flex items-center justify-center w-10 h-10 shrink-0"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
        {isSidebarOpen && (
          <span className="font-semibold text-lg bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-indigo-400 truncate select-none pl-2 tracking-wide w-full pr-2">
            ModelVerse
          </span>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={startNewChat}
          className={`flex items-center gap-3 w-full p-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] border border-blue-400/20 ${!isSidebarOpen ? "justify-center p-3!" : ""}`}
        >
          <PlusIcon className="w-5 h-5 shrink-0" />
          {isSidebarOpen && (
            <span className="font-semibold whitespace-nowrap text-[15px]">
              New Chat
            </span>
          )}
        </button>
      </div>

      {/*//* Chat History List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 custom-scrollbar">
        {isSidebarOpen ? (
          <>
            <div className="text-[11px] font-bold text-gray-500 mt-2 mb-3 px-2 uppercase tracking-wider">
              Recent Chats
            </div>

            {sortedChats.length === 0 && !isLoading && (
              <p className="text-gray-600 text-sm text-center mt-6 px-2">
                No chats yet. Start a new conversation!
              </p>
            )}

            {sortedChats.map(([chatId, chatData]) => (
              <button
                key={chatId}
                onClick={() => loadChat(chatId)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors text-left group ${chatId === currentChatId
                    ? "bg-[#202532] text-white border border-blue-500/20"
                    : "hover:bg-[#202532] text-gray-300 hover:text-white"
                  }`}
              >
                <MessageSquareIcon
                  className={`w-4 h-4 shrink-0 transition-colors ${chatId === currentChatId
                      ? "text-blue-400"
                      : "text-gray-500 group-hover:text-gray-300"
                    }`}
                />
                <span className="truncate text-sm font-medium flex-1">
                  {chatData.title}
                </span>
                <span
                  onClick={(e) => handleDeleteChat(e, chatId)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-gray-500 transition-all shrink-0"
                >
                  {deletingChatId === chatId ? (
                    <div className="w-4 h-4 border-2 border-gray-500 border-t-red-400 rounded-full animate-spin" />
                  ) : (
                    <TrashIcon className="w-4 h-4" />
                  )}
                </span>
              </button>
            ))}

            {isLoading && sortedChats.length === 0 && (
              <div className="space-y-2 mt-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-11 rounded-xl bg-[#202532] animate-pulse"
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="mt-2 space-y-2">
            {sortedChats.map(([chatId, chatData]) => (
              <button
                key={chatId}
                onClick={() => loadChat(chatId)}
                className={`flex justify-center w-full p-3 rounded-xl transition-colors ${chatId === currentChatId
                    ? "bg-[#202532] text-blue-400"
                    : "hover:bg-[#202532] text-gray-500 hover:text-gray-200"
                  }`}
                title={chatData.title}
              >
                <MessageSquareIcon className="w-5 h-5 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom User Area */}
      {isSidebarOpen && (
        <div className="p-4 border-t border-[#2D3343]/50 bg-[#151923] relative">
          {isProfileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileMenuOpen(false)}
              />
            </>
          )}

          <div className={`absolute left-4 right-4 z-50 transition-all duration-300 ease-in-out ${isProfileMenuOpen ? "bottom-full mb-2 opacity-100 visible" : "-bottom-10 opacity-0 invisible"}`}>
            <div className="bg-[#202532] border border-[#2D3343] rounded-xl shadow-xl overflow-hidden">
              <button
                onClick={() => {
                  handleLogout();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#2D3343]/50 text-gray-300 hover:text-white transition-colors text-sm font-medium border-b border-[#2D3343]"
              >
                <LogoutIcon className="w-5 h-5" />
                Log out
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(true);
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 text-red-400/80 hover:text-red-400 transition-colors text-sm font-medium"
              >
                <TrashIcon className="w-5 h-5" />
                Delete Account
              </button>
            </div>
          </div>

          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer border ${isProfileMenuOpen ? 'bg-[#202532] border-[#2D3343]' : 'border-transparent hover:bg-[#202532] hover:border-[#2D3343]'}`}
          >
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 shrink-0 text-lg">
              {(user ? user.name || "U" : "G").charAt(0).toUpperCase()}
            </div>
            <div className="truncate flex-1">
              <div className="text-sm font-semibold text-gray-100 truncate">
                {user ? user.name || "User" : "Guest"}
              </div>
              <div className="text-[12px] text-gray-400 truncate">
                {user ? user.email || "Free Plan" : "Sign in required"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteAccount}
      />
    </div>
  );
};

export default Sidebar;
