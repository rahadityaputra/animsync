"use client"; // Diperlukan untuk komponen React di Next.js yang menggunakan hooks

import { Fragment, useRef } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean; // State untuk mengontrol apakah modal terbuka
  onClose: () => void; // Callback saat modal ditutup
  title: string; // Judul modal
  children: React.ReactNode; // Konten yang akan ditampilkan di dalam modal
  initialFocusRef?: React.RefObject<HTMLElement>; // Opsional: ref ke elemen yang akan difokuskan saat modal terbuka
  panelClassName?: string; // Opsional: class Tailwind untuk styling panel modal
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  initialFocusRef,
  panelClassName = '', // Default styling untuk panel modal

}) => {
  // useRef untuk elemen yang akan difokuskan saat modal pertama kali terbuka jika tidak disediakan dari luar
  const defaultInitialFocusRef = useRef(null);
  const focusElement = initialFocusRef || defaultInitialFocusRef;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50" // z-index tinggi agar modal selalu di atas
        onClose={onClose}
        initialFocus={focusElement} // Fokus elemen ini saat modal terbuka
      >
        {/* Backdrop (overlay latar belakang) */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 transition-opacity" />
        </TransitionChild>

        {/* Kontainer Utama Modal */}
        <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Panel Modal */}
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                className={`relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 ${panelClassName}`}
              >
                {/* Tombol Tutup */}
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Header Modal */}
                <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                  {title}
                </DialogTitle>

                {/* Konten Modal */}
                <div className="mt-2">
                  {children}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
