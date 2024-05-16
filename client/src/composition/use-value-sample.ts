import { Ref, ref, watch, UnwrapRef, ComputedRef } from 'vue';

export function useValueSample<T>(source: ComputedRef<UnwrapRef<T>>, open: Ref<boolean>): Ref<UnwrapRef<T>> {
  const sampleResult = ref<T>(source.value as T);

  watch(source, updateValue);
  watch(open, updateValue);

  function updateValue(): void {
    if (open.value) {
      sampleResult.value = source.value;
    }
  }

  return sampleResult;
}
