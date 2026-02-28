import { ref, h, watch, RendererElement, RendererNode, VNode, InputHTMLAttributes, computed } from 'vue';

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
      onValueUpdate?: (value: string) => void;
      onValue?: (value: string) => void;
    } & DialogOptions,
  ) => DialogReactive;
  overrideNegativeText: (text: string | null) => void;
  overridePositiveText: (text: string | null) => void;
  setLoadingMessage: (message: string) => void;
  setErrorMessage: (message: string) => void;
} {
  const { t } = useI18n<[I18NMessageSchema]>();

  const dialog = useDialog();
  const { listenForKey } = useHotkey();

  const dialogRef = ref<DialogReactive>();
  const inputValue = ref<string>('');
  const loading = ref(false);
  const isInvalid = ref(false);
  const negativeTextOverwritten = ref<string | null>();
  const positiveTextOverwritten = ref<string | null>();
  const loadingMessage = ref('');
  const errorMessage = ref('');

  const negativeText = computed(() => negativeTextOverwritten.value ?? t('common.cancel'));
  const positiveText = computed(() => positiveTextOverwritten.value ?? t('common.enter'));

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

  function resetMessages(): void {
    isInvalid.value = false;
    loadingMessage.value = '';
    errorMessage.value = '';
  }

  return {
    open: ({ placeholder, value, inputType, minRows, inputProps, onValueUpdate, onValue, beforeClose, ...options }) => {
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
              resetMessages();
              inputValue.value = newValue;
              onValueUpdate?.(newValue);
            },
            type: inputType,
            inputProps,
            autosize: inputType === 'textarea' ? { minRows } : false,
            disabled: loading.value,
            status: isInvalid.value ? 'error' : undefined,
            loadingMessage: loadingMessage.value,
            errorMessage: errorMessage.value,
          }),
        negativeText: negativeText.value,
        positiveText: positiveText.value,
        onPositiveClick: submit,
        onAfterEnter: focusLastButtonOfDialog,
        ...options,
      });
      const unwatchNegativeText = watch(negativeText, () => (dialogRef.value!.negativeText = negativeText.value));
      const unwatchPositiveText = watch(positiveText, () => (dialogRef.value!.positiveText = positiveText.value));
      wrapOnDialogCloseEvents(dialogRef.value, () => {
        unwatchNegativeText();
        unwatchPositiveText();
        unsubscribeHotkeys();
      });
      return dialogRef.value;
    },
    overrideNegativeText: (text: string | null) => (negativeTextOverwritten.value = text),
    overridePositiveText: (text: string | null) => (positiveTextOverwritten.value = text),
    setLoadingMessage: (message: string) => {
      resetMessages();
      loadingMessage.value = message;
    },
    setErrorMessage: (message: string) => {
      resetMessages();
      errorMessage.value = message;
    },
  };
}
