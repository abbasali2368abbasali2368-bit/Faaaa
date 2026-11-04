import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { X, Upload, Film, Image as ImageIcon, Check } from 'lucide-react';

export const GalleryPickerModal: React.FC = () => {
  const { isGalleryOpen, galleryTarget, closeGallery, postStatus, sendMessage, activeChatId } = useChat();

  const [caption, setCaption] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  if (!isGalleryOpen) return null;

  const sampleGalleryItems: { id: string; url: string; type: 'image' | 'video'; title: string }[] = [
    {
      id: 'media-1',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      type: 'image',
      title: 'Tropical Beach',
    },
    {
      id: 'media-2',
      url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80',
      type: 'image',
      title: 'Ocean Sunset',
    },
    {
      id: 'media-3',
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
      type: 'image',
      title: 'Mountain Fog',
    },
    {
      id: 'media-4',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      type: 'image',
      title: 'Cyber Tech Pattern',
    },
    {
      id: 'media-video-1',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      type: 'video',
      title: 'Sample Video Clip 🎥',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith('video') ? 'video' : 'image';
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedMedia({
        url: reader.result as string,
        type: fileType,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmSend = () => {
    if (!selectedMedia) return;

    if (galleryTarget === 'status') {
      postStatus(selectedMedia.type, selectedMedia.url, caption);
    } else if (galleryTarget === 'chat' && activeChatId) {
      sendMessage(activeChatId, caption || undefined, selectedMedia.type, selectedMedia.url);
    }

    setCaption('');
    setSelectedMedia(null);
    closeGallery();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-[#111b21] rounded-3xl max-w-lg w-full p-6 text-gray-900 dark:text-gray-100 shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Film className="w-5 h-5 text-emerald-500" />
              <span>
                {galleryTarget === 'status' ? 'Upload Video / Photo for Status' : 'Attach Media to Chat'}
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Select from your device gallery or choose sample videos & photos
            </p>
          </div>

          <button onClick={closeGallery} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Custom File Input */}
        <div className="my-4">
          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-emerald-500/50 hover:border-emerald-500 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 cursor-pointer transition-colors">
            <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Upload Video or Photo from Device
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              MP4, MOV, WEBM, JPG, PNG supported
            </span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Sample Gallery Grid */}
        <div className="flex-1 overflow-y-auto mb-4">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Sample Gallery Assets
          </p>

          <div className="grid grid-cols-2 gap-2">
            {sampleGalleryItems.map((item) => {
              const isSelected = selectedMedia?.url === item.url;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedMedia({ url: item.url, type: item.type })}
                  className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-transform ${
                    isSelected ? 'border-emerald-500 scale-95 shadow-lg' : 'border-transparent hover:opacity-90'
                  }`}
                >
                  {item.type === 'video' ? (
                    <video src={item.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-2 flex items-end justify-between text-white">
                    <span className="text-[10px] font-bold truncate">{item.title}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#25D366]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Media Preview & Caption */}
        {selectedMedia && (
          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full px-4 py-2 text-xs bg-gray-50 dark:bg-[#202c33] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              onClick={handleConfirmSend}
              className="w-full py-2.5 bg-[#128C7E] hover:bg-[#075E54] text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95"
            >
              {galleryTarget === 'status' ? 'Post as Status Story 🚀' : 'Send to Chat 💬'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
