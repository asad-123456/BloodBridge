import { useState, useRef, useEffect } from "react";
import { Share2, Copy, Globe, Send, MessageCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  type ShareableRequest,
  generateShareText,
  getWhatsAppLink,
  getXLink,
  getFacebookLink,
  copyToClipboard,
  nativeShare,
} from "../../utils/shareUtils";

interface ShareMenuProps {
  request: ShareableRequest;
}

export function ShareMenu({ request }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = async (e: React.MouseEvent, action: () => void | Promise<void>) => {
    e.preventDefault();
    e.stopPropagation();
    await action();
    setIsOpen(false);
  };

  const shareText = generateShareText(request);
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleNativeShare = async () => {
    const success = await nativeShare("Urgent Blood Request", shareText);
    if (!success) {
      toast.error("Sharing failed or not supported.");
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(shareText);
    if (success) {
      toast.success("Message copied to clipboard!");
    } else {
      toast.error("Failed to copy text.");
    }
  };

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        title="Share Request"
        className="flex items-center justify-center rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <Share2 size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
          <div className="mb-2 flex items-center justify-between px-2 pt-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Share Request
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {canNativeShare && (
              <button
                onClick={(e) => handleAction(e, handleNativeShare)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Share2 size={16} className="text-slate-400" />
                <span>Share via Device</span>
              </button>
            )}

            <button
              onClick={(e) => handleAction(e, () => openLink(getWhatsAppLink(shareText)))}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
            >
              <MessageCircle size={16} className="text-emerald-500" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={(e) => handleAction(e, () => openLink(getXLink(shareText)))}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <Send size={16} className="text-slate-500" />
              <span>X (Twitter)</span>
            </button>

            <button
              onClick={(e) => handleAction(e, () => openLink(getFacebookLink()))}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-blue-700 hover:bg-blue-50"
            >
              <Globe size={16} className="text-blue-500" />
              <span>Facebook</span>
            </button>

            <div className="my-1 h-px bg-slate-100" />

            <button
              onClick={(e) => handleAction(e, handleCopy)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Copy size={16} className="text-slate-400" />
              <span>Copy text</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

