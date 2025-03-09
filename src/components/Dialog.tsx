'use client';
import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

interface DialogProps {
    withCloseButton?: boolean;
    children: React.ReactNode | React.ReactNode[];
    onClose?: () => void;
    id?: string;
    className?: string;
}

export interface DialogMethods {
    closeModal: () => void;
    openModal: () => void;
    toggleModal: () => void;
}

export const Dialog = forwardRef<DialogMethods, DialogProps>(function Dialog(
    { onClose, children, className, id, withCloseButton = true }: DialogProps,
    ref
) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const closeModal = useCallback(() => {
        if (!dialogRef.current) {
            return;
        }

        dialogRef.current.close();
        if (onClose) {
            onClose();
        }
    }, [onClose]);

    const openModal = useCallback(() => {
        if (!dialogRef.current) {
            return;
        }
        dialogRef.current.showModal();
        dialogRef.current.focus(); // Ensure focus is set to the dialog
    }, []);

    const toggleModal = useCallback(() => {
        if (!dialogRef.current) {
            return;
        }

        if (dialogRef.current.open) {
            closeModal();
        } else {
            openModal();
        }
    }, [closeModal, openModal]);

    const handleBackdropClick = useCallback(
        (e: React.MouseEvent) => {
            if (!dialogRef.current) {
                return;
            }

            const dialogElement = dialogRef.current;
            const rect = dialogElement.getBoundingClientRect();

            // Check if the click is outside the dialog
            if (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
            ) {
                closeModal();
            }
        },
        [closeModal]
    );

    const handleEscapeKey = useCallback(
        (e: React.KeyboardEvent<HTMLDialogElement>) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        },
        [closeModal]
    );

    useImperativeHandle(
        ref,
        () => ({
            closeModal,
            openModal,
            toggleModal,
        }),
        [closeModal, openModal, toggleModal]
    );

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) {
            return;
        }

        // Open the dialog when the component mounts
        dialog.showModal();
        dialog.focus();
    }, [closeModal, handleEscapeKey]);

    return (
        <dialog
            ref={dialogRef}
            id={id}
            className={`relative m-auto bg-zinc-950 border-2 border-passfort-500 text-white p-3 rounded-xl backdrop:bg-black/50 backdrop:backdrop-blur-xs ${className}`}
            onMouseDown={handleBackdropClick}
            onClose={closeModal}
            onKeyDown={handleEscapeKey}
            role="dialog"
            aria-modal="true"
        >
            {children}

            {withCloseButton && (
                <button
                    type="button"
                    className="absolute top-6 right-4 w-6 h-6 rounded-lg text-passfort-500"
                    onClick={closeModal}
                    aria-label="Close"
                >
                    <span className="sr-only">Close</span>
                    <svg
                        className="w-4 h-4"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                    </svg>
                </button>
            )}
        </dialog>
    );
});
