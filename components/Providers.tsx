'use client'
import type { ReactNode } from 'react'
import { ToastProvider } from '@/lib/toast'
import { AuthProvider } from '@/lib/auth'
import { StoreProvider } from '@/lib/store'
import { CartProvider } from '@/lib/cart'
import { WishlistProvider } from '@/lib/wishlist'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <StoreProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </StoreProvider>
    </ToastProvider>
  )
}
