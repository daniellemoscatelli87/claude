import { useEffect, useState } from 'react'

export function useChecklist(key: string, size: number) {
  const storageKey = `checklist:${key}`
  const [checked, setChecked] = useState<boolean[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as boolean[]
        if (Array.isArray(parsed) && parsed.length === size) return parsed
      }
    } catch {
      // ignore malformed storage
    }
    return Array(size).fill(false)
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checked))
  }, [storageKey, checked])

  function toggle(index: number) {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)))
  }

  return { checked, toggle }
}
