import Swal from 'sweetalert2';

export async function confirmDialog(options: {
  title?: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
  icon?: 'warning' | 'error' | 'info' | 'question';
}): Promise<boolean> {
  const result = await Swal.fire({
    title: options.title ?? '¿Estás seguro?',
    text: options.text,
    icon: options.icon ?? 'warning',
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? 'Sí, continuar',
    cancelButtonText: options.cancelText ?? 'Cancelar',
    reverseButtons: true,
    customClass: {
      popup: '!rounded-2xl !shadow-2xl',
      title: '!text-slate-800 !text-lg !font-bold',
      htmlContainer: '!text-slate-500 !text-sm',
      confirmButton: '!bg-red-600 !rounded-xl !px-5 !py-2.5 !text-sm !font-semibold !shadow-lg !shadow-red-200 hover:!bg-red-700 focus:!ring-2 focus:!ring-red-300',
      cancelButton: '!bg-slate-100 !text-slate-700 !rounded-xl !px-5 !py-2.5 !text-sm !font-semibold hover:!bg-slate-200 focus:!ring-2 focus:!ring-slate-300',
    },
    buttonsStyling: false,
  });
  return result.isConfirmed;
}
