import { useEffect, useState } from "react"

/**
 * Дебаунс значения input-а
 */
export function useInputDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)
    return () => clearTimeout(timer)
  }, [value, delay, setDebouncedValue])

  return debouncedValue
}
