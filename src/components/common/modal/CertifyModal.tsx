import React, { useState, useEffect } from 'react';
import { X, Shield, CheckCircle } from 'lucide-react';
import successImage from '../../../assets/images/2.svg'; //why i can't import picture

interface ConfirmationModalProps {
  projectName: string;
  projectId: string;
  title: string;
  warningMessage: string;
  confirmButtonText?: string;
  loadingText?: string;
}

export function ConfirmationModal({
  title,
  projectName,
  projectId,
  warningMessage,
  confirmButtonText = "Confirm",
  loadingText = "Processing..."
}: ConfirmationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5); // 5 second countdown

  const isValid = inputValue.trim() === projectName;
  const hasStartedTyping = inputValue.length > 0;

  // Listen for custom event to open modal
  useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      setIsOpen(true);
      setInputValue('');
      setError('');
      setIsLoading(false);
      setIsSuccess(false);
      setCountdown(5);
    };

    window.addEventListener('openCertificationModal', handleOpenModal as EventListener);
    
    return () => {
      window.removeEventListener('openCertificationModal', handleOpenModal as EventListener);
    };
  }, []);

  // Handle countdown and auto-reload after success
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSuccess && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSuccess, countdown]);

  // Handle escape key (disabled during success state)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSuccess) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSuccess]);

  const handleClose = () => {
    if (!isSuccess) {
      setIsOpen(false);
      setInputValue('');
      setError('');
      setIsLoading(false);
    }
  };

  const handleOkClick = () => {
    window.location.reload();
  };

  const handleConfirm = async () => {
    if (!isValid) {
      setError("Project name doesn't match. Please type it exactly as shown above.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${projectId}/certify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        // Success - show success state
        setIsLoading(false);
        setIsSuccess(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to certify project');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Real-time validation - only show error if user has started typing and it doesn't match
    if (value.length > 0 && value.trim() !== projectName) {
      setError("Project name doesn't match. Please type it exactly as shown above.");
    } else {
      setError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="certify-modal"
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && !isSuccess && handleClose()}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md md:max-w-lg lg:max-w-xl w-full mx-4 p-6">
        {/* Success State */}
        {isSuccess ? (
          <>
            {/* Success Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-main-neutral2">Project Certification Confirmation</h3>
              <button 
                onClick={handleOkClick}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            Success Content
            <div className="mb-6 text-center">
              <div className="flex flex-col items-center gap-4 mb-4">
                {/* {successImage && (
                    <img src={successImage} alt="coolDuckImage" width="240" className="mx-auto" />
                )} */}
                <CheckCircle className="w-6 h-6 text-main-secondary" />
                <span className="large text-main-neutral2 mb-2">Project Certified Successfully!</span>
                <div>
                  <p className="flex flex-col subtle text-supporting-ghost">
                    <span>"{projectName}"</span>
                    <span>has been certified and is now marked as approved.</span>
                  </p>
                </div>
              </div>
              
              {/* <p className="detail text-supporting-ghost">
                Page will automatically reload in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p> */}
            </div>
            
            {/* Success Actions */}
            <div>
              <button
                onClick={handleOkClick}
                className="btn-secondary w-full rounded-md transition-colors flex items-center justify-center"
              >
                <span className="small text-white">OK</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Confirmation State */}
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-main-neutral2">{title}</h3>
              <button 
                id="close-modal"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Shield className="w-8 h-8 text-supporting-light-orange" />
                <div>
                  <p className="subtle text-supporting-ghost">You are about to certify:</p>
                  <p id="modal-project-title" className="large text-supporting-support">{projectName}</p>
                </div>
              </div>
              
              <div className="warning-box">
                <p>
                  <strong>Warning:</strong> {warningMessage}
                </p>
              </div>
              
              {/* Confirmation Input */}
              <div className="space-y-3">
                <label className="small text-supporting-support">
                  Type the project name to confirm:
                </label>
                <input
                  type="text"
                  id="project-name-input"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Enter project name exactly as shown above"
                  className={`w-full px-3 py-2 subtle border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                  autoFocus
                />
                
                {/* Show validation state */}
                {hasStartedTyping && (
                  <div className="flex items-center gap-2">
                    {isValid ? (
                      <p className="detail text-main-secondary">✓ Project name matches</p>
                    ) : (
                      <p id="validation-error" className="detail text-supporting-error">
                        Project name doesn't match. Please type it exactly as shown above.
                      </p>
                    )}
                  </div>
                )}
                
                {/* API error (separate from validation error) */}
                {error && !hasStartedTyping && (
                  <p className="detail text-supporting-error">{error}</p>
                )}
              </div>
            </div>
            
            {/* Modal Actions */}
            <div>
              <button
                id="confirm-certification"
                onClick={handleConfirm}
                disabled={!isValid || isLoading}
                className="btn-primary w-full rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <span id="confirm-text" className="small text-white" style={{ display: isLoading ? 'none' : 'block' }}>
                  {confirmButtonText}
                </span>
                <span id="confirm-loading" className="small text-white" style={{ display: isLoading ? 'block' : 'none' }}>
                  {loadingText}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}