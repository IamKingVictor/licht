import type { Metadata } from 'next'
import AccountView from '@/components/account/AccountView'
import { PageHero } from '@/components/ui/bits'

export const metadata: Metadata = { title: 'My account', robots: { index: false } }

export default function AccountPage() {
  return (<><PageHero title="My" em="account" crumbs={[{ label: 'Account' }]} /><AccountView /></>)
}
