import { createContext, useContext, type ReactNode } from 'react'

type HeaderSlotContextValue = {
  setHeaderSlot: (node: ReactNode | null) => void
}

const HeaderSlotContext = createContext<HeaderSlotContextValue | null>(null)

export function HeaderSlotProvider({
  children,
  setHeaderSlot,
}: {
  children: ReactNode
  setHeaderSlot: (node: ReactNode | null) => void
}) {
  return (
    <HeaderSlotContext.Provider value={{ setHeaderSlot }}>
      {children}
    </HeaderSlotContext.Provider>
  )
}

export function useHeaderSlot() {
  const context = useContext(HeaderSlotContext)
  if (!context) {
    throw new Error('useHeaderSlot must be used within HeaderSlotProvider')
  }
  return context
}
