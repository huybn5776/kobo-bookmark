import { ref, h, watch, RendererElement, RendererNode, VNode, InputHTMLAttributes } from 'vue';

import { useDialog, DialogReactive, DialogOptions, InputProps } from 'naive-ui';
import { takeUntil, Subject } from 'rxjs';
import { useI18n } from 'vue-i18n';

import InputDialogContent from '@/component/InputDialogContent/InputDialogContent.vue';
import { useHotkey } from '@/composition/use-hotkey';
import { I18NMessageSchema } from '@/config/i18n-config';
import { wrapOnDialogCloseEvents, focusLastButtonOfDialog } from '@/util/dialog-utils';

export function useInputDialog(): {
  open: (
    options: {
      placeholder: string;
      value: string;
      inputType?: 'text' | 'textarea';
      minRows?: number;
      inputProps?: InputHTMLAttributes;
      beforeClose?: (value: string) => (boolean | undefined) | Promise<boolean | undefined>;
      onValue?: (value: string) => void;
    } & DialogOptions,
  ) => DialogReactive;
  onConfirm?: (value: string) => void;
  setErrorMessage: (message: string) => void;
} {
  const { t } = useI18n<[I18NMessageSchema]>();

  const dialog = useDialog();
  const { listenForKey } = useHotkey();

  const dialogRef = ref<DialogReactive>();
  const inputValue = ref<string>('');
  const loading = ref(false);
  const isInvalid = ref(false);
  const errorMessage = ref('');

  const dialogClosed$$ = new Subject<void>();

  let inputVNode: VNode<RendererNode, RendererElement, InputProps> | undefined;

  watch(
    () => loading.value,
    () => {
      if (dialogRef.value) {
        dialogRef.value.loading = loading.value;
      }
      if (inputVNode?.props) {
        inputVNode.props.loading = loading.value;
      }
    },
  );

  return {
    open: ({ placeholder, value, inputType, minRows, inputProps, onValue, beforeClose, ...options }) => {
      inputValue.value = value;

      const beforeSubmitCheck = async (): Promise<boolean | undefined> => {
        const beforeCloseResult = beforeClose?.(inputValue.value);
        let canClose: boolean | undefined;
        if (beforeCloseResult instanceof Promise) {
          loading.value = true;
          canClose = await beforeCloseResult;
          loading.value = false;
        } else {
          canClose = beforeCloseResult;
        }
        return canClose;
      };

      const submit = async (): Promise<boolean> => {
        if ((await beforeSubmitCheck()) === false) {
          isInvalid.value = true;
          return false;
        }
        unsubscribeHotkeys();
        onValue?.(inputValue.value);
        dialogRef.value?.destroy();
        return true;
      };

      listenForKey(
        (event) => event.key === 'Enter' && (inputType === 'textarea' ? event.metaKey || event.ctrlKey : true),
      )
        .pipe(takeUntil(dialogClosed$$))
        .subscribe((event) => {
          event.preventDefault();
          submit();
        });

      function unsubscribeHotkeys(): void {
        dialogClosed$$.next(undefined);
      }

      dialogRef.value = dialog.info({
        content: () =>
          h(InputDialogContent, {
            placeholder,
            value: inputValue.value,
            'onUpdate:value': (newValue: string) => {
              errorMessage.value = '';
              inputValue.value = newValue;
            },
            type: inputType,
            inputProps,
            autosize: inputType === 'textarea' ? { minRows } : false,
            disabled: loading.value,
            status: isInvalid.value ? 'error' : undefined,
            errorMessage: errorMessage.value,
          }),
        negativeText: t('common.cancel'),
        positiveText: t('common.enter'),
        onPositiveClick: submit,
        onAfterEnter: focusLastButtonOfDialog,
        ...options,
      });
      wrapOnDialogCloseEvents(dialogRef.value, unsubscribeHotkeys);
      return dialogRef.value;
    },
    setErrorMessage: (message: string) => (errorMessage.value = message),
  };
}
