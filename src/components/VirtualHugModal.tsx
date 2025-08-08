import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface VirtualHugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VirtualHugModal: React.FC<VirtualHugModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full relative text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-pink-500"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🤗
            </motion.div>

            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              Pelukan Virtual Terkirim!
            </h3>
            <p className="text-gray-600 mb-4 px-2">
              Aku tahu kamu bisa melewati semuanya. Peluk erat dari jauh, semangat terus ya sayang 💖
            </p>

            <motion.div
              className="text-3xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              💞
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VirtualHugModal;
