"use client";
import React, {
    useRef,
    useEffect,
    useCallback,
    useImperativeHandle,
    forwardRef,
} from "react";

interface DialogProps {
    withCloseButton?: boolean;
    children: React.ReactNode | React.ReactNode[];
    onClose?: () => void;
    id?: React.HTMLProps<HTMLDialogElement>["id"];
    className?: React.HTMLProps<HTMLDialogElement>["className"];
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

        if (onClose) {
            onClose();
        }
        dialogRef.current.close();
    }, [onClose, dialogRef]);

    const openModal = useCallback(() => {
        if (!dialogRef.current) {
            return;
        }
        dialogRef.current.showModal();
    }, [dialogRef]);

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

    const checkClose = useCallback(
        (e: React.MouseEvent) => {
            if (!dialogRef.current) {
                return;
            }
            const dimensions = dialogRef.current.getBoundingClientRect();

            if (
                e.clientX < dimensions.left ||
                e.clientX > dimensions.right ||
                e.clientY < dimensions.top ||
                e.clientY > dimensions.bottom
            ) {
                closeModal();
            }
        },
        [dialogRef, closeModal]
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
        if (dialog) {
            dialog.showModal();
            dialog.addEventListener("close", closeModal);
        }

        return () => {
            if (dialog) {
                dialog.removeEventListener("close", closeModal);
            }
        };
    }, [closeModal, onClose]);

    return (
        <dialog
            ref={dialogRef}
            id={id}
            className="relative bg-passfort-vibrant/10 border border-passfort-vibrant text-white p-3 rounded-xl backdrop:bg-black/50 backdrop:backdrop-blur-sm backdrop-blur"
            onClick={checkClose}>
            {children}

            {withCloseButton && (
                <button
                    type="button"
                    className="absolute top-4 right-2 w-6 h-6 rounded-lg text-passfort-vibrant"
                    onClick={closeModal}
                    aria-label="Close">
                    <span className="sr-only">Close</span>
                    <svg
                        className="w-4 h-4"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14">
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
