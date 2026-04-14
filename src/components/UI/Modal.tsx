// src/components/UI/Modal.tsx
import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className={`bg-white rounded-xl shadow-xl w-full ${sizes[size]}`}>
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                <button 
                  onClick={onClose} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                {children}
              </div>
            </div>
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
};