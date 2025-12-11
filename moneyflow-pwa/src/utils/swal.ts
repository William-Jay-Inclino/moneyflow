import Swal from 'sweetalert2';

export function showSuccessAlert(options: { title?: string; text: string }) {
    Swal.fire({
        title: options.title || 'Success',
        text: options.text || 'Your category has been created.',
        icon: 'success',
        confirmButtonText: 'OK',
    });
}

export function showErrorAlert(options: { title?: string; text: string }) {
    Swal.fire({
        title: options.title || 'Error',
        text: options.text || 'An error occurred. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
    });
}

export function showWarningAlert(options: { title?: string; text: string }) {
    Swal.fire({
        title: options.title || 'Warning',
        text: options.text || 'Please be cautious.',
        icon: 'warning',
        confirmButtonText: 'OK',
    });
}

export function showInfoAlert(options: { title?: string; text: string }) {
    Swal.fire({
        title: options.title || 'Information',
        text: options.text || 'Here is some information.',
        icon: 'info',
        confirmButtonText: 'OK',
    });
}

export async function showConfirmDelete(options: {
    title?: string;
    text?: string;
    position?: 'top' | 'center' | 'bottom';
    icon?: 'warning' | 'info' | 'error' | 'success' | 'question';
    confirmButtonText?: string;
    confirmButtonColor?: string;
    cancelButtonText?: string;
    cancelButtonColor?: string;
}) {
    return Swal.fire({
        title: options.title || 'Are you sure?',
        text: options.text || 'This action cannot be undone.',
        position: options.position || 'top',
        icon: options.icon || 'warning',
        showCancelButton: true,
        confirmButtonColor: options.confirmButtonColor || '#dc3545',
        cancelButtonColor: options.cancelButtonColor || '#6c757d',
        confirmButtonText: options.confirmButtonText || 'Yes, delete it!',
        reverseButtons: true,
        showLoaderOnConfirm: true,
        preConfirm: async (remove) => {
            return remove;
        },
        allowOutsideClick: () => !Swal.isLoading(),
    });
}
