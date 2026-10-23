'use client';

import { useState, useRef, useEffect, ChangeEvent, DragEvent } from 'react';
import { ArrowLeft, ArrowUpToLine, UploadCloud, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePostMutation } from '@/hooks/usePostMutation';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessPost?: () => void;
  onShowAlert: (alert: { type: 'success' | 'error'; message: string }) => void;
}

export function CreatePostModal({
  isOpen,
  onClose,
  onSuccessPost,
  onShowAlert,
}: CreatePostModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [imageError, setImageError] = useState<string | null>(null);
  const [captionError, setCaptionError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const resetForm = () => {
    setSelectedFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setCaption('');
    setImageError(null);
    setCaptionError(null);
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  const createPostMutation = useCreatePostMutation({
    onSuccessPost,
    onShowAlert,
    onClose: handleCloseModal,
  });

  const handleFileSelect = (file: File) => {
    setImageError(null);

    if (file.size > 5 * 1024 * 1024) {
      setImageError('File size exceeds 5MB limit.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageError('Please upload a valid PNG or JPG image.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImageError(null);
    setCaptionError(null);

    let hasError = false;

    if (!selectedFile) {
      setImageError('Photo is required.');
      hasError = true;
    }

    if (!caption.trim()) {
      setCaptionError('Caption is required.');
      hasError = true;
    }

    if (hasError) return;

    createPostMutation.mutate({ selectedFile, caption });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto'>
      <div className='flex flex-col max-w-90.25 w-full gap-4 lg:gap-6 lg:max-w-113 bg-neutral-950 p-6 rounded-2xl border border-neutral-900 text-neutral-25 shadow-2xl relative my-auto'>
        <div className='flex items-center gap-2 w-full lg:gap-3'>
          <button
            type='button'
            onClick={handleCloseModal}
            className='flex flex-col items-center justify-center w-6 h-6 rounded-full hover:bg-neutral-800 transition lg:w-8 lg:h-8'
            aria-label='Close Modal'
          >
            <ArrowLeft className='w-5 h-5 lg:w-7 lg:h-7' />
          </button>
          <h1 className='text-md font-bold lg:text-display-xs'>Add Post</h1>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col w-full gap-6'>
          <div className='flex flex-col gap-0.5 w-full'>
            <label className='text-sm font-bold'>Photo</label>

            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center border border-dashed rounded-xl p-xl cursor-pointer transition ${
                  imageError
                    ? 'border-accent-red bg-accent-red/5'
                    : isDragging
                      ? 'border-primary-200 bg-neutral-950'
                      : 'border-neutral-900 bg-neutral-950 hover:border-neutral-800'
                }`}
              >
                <div className='flex flex-col gap-lg items-center justify-center text-center'>
                  <div className='flex items-center justify-center w-10 h-10 border border-neutral-900 rounded-md'>
                    <UploadCloud className='w-6 h-6' />
                  </div>
                  <div className='flex flex-col text-sm gap-xs font-semibold'>
                    <p className='flex gap-xs'>
                      <span className='text-primary-200 font-bold hover:underline'>
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </p>
                    <p className='text-neutral-500 text-xs'>
                      PNG or JPG (max. 5mb)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center p-3 gap-xs w-full bg-neutral-950 border border-dashed border-neutral-900 rounded-xl'>
                <div className='flex flex-col w-full gap-3'>
                  <div className='relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-900'>
                    <Image
                      src={imagePreview}
                      alt='Selected upload preview'
                      fill
                      unoptimized
                      className='object-cover'
                    />
                  </div>

                  <div className='flex justify-center gap-3 w-full'>
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='flex items-center h-10 gap-2 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-900 text-sm font-medium transition'
                    >
                      <ArrowUpToLine className='w-5 h-5' />
                      Change Image
                    </button>
                    <button
                      type='button'
                      onClick={handleRemoveImage}
                      className='flex items-center h-10 gap-2 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-900 text-sm font-medium transition text-accent-red'
                    >
                      <Trash2 className='w-5 h-5' />
                      Delete Image
                    </button>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type='file'
              accept='image/png, image/jpeg, image/jpg'
              className='hidden'
              onChange={handleInputChange}
            />

            {imageError && (
              <span className='text-sm font-medium text-accent-red mt-1'>
                {imageError}
              </span>
            )}
          </div>

          <div className='flex flex-col gap-0.5 w-full'>
            <label htmlFor='caption' className='text-sm font-bold'>
              Caption
            </label>
            <Textarea
              id='caption'
              value={caption}
              error={Boolean(captionError)}
              onChange={(e) => {
                setCaption(e.target.value);
                if (e.target.value.trim()) setCaptionError(null);
              }}
              placeholder='Create your caption'
              rows={4}
            />
            {captionError && (
              <span className='text-sm font-medium text-accent-red mt-1'>
                {captionError}
              </span>
            )}
          </div>

          <button
            type='submit'
            disabled={createPostMutation.isPending}
            className='flex w-full items-center justify-center h-10 gap-2 p-2 rounded-full bg-primary-300 hover:bg-primary-200 disabled:opacity-50 text-sm font-bold transition cursor-pointer lg:h-12'
          >
            {createPostMutation.isPending ? 'Sharing...' : 'Share'}
          </button>
        </form>
      </div>
    </div>
  );
}
