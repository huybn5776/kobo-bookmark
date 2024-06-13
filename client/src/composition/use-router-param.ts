import { ref, watch, Ref } from 'vue';

import { useRoute, useRouter } from 'vue-router';

export function useRouterParam<T extends string | string[]>(paramsKey: string): Ref<T | undefined> {
  const route = useRoute();
  const router = useRouter();

  const paramValue = ref<T>();

  watch(
    () => route.params[paramsKey],
    (value) => (paramValue.value = value as T),
    { immediate: true },
  );
  watch(
    () => paramValue.value,
    (value) => router.push({ name: route.name as string, params: { [paramsKey]: value } }),
  );

  return paramValue;
}
