import React from 'react'
import Icon from '~/components/Icon/Icon'
import c from 'classnames'
import { useRouter } from 'next/router'

export type PageType =
  | 'lending'
  | 'borrowing'
  | 'want-to-borrow'
  | 'timeline'
  | 'others'

export type Props = {
  type: PageType
}

type ItemProps = {
  Icon: React.ReactElement
  label: string
  isActive: boolean
  onClick: () => void
}

const BottomBarItem: React.FC<ItemProps> = ({
  Icon,
  label,
  isActive,
  onClick,
}) => {
  return (
    <div
      className={c(
        'flex-1 flex flex-col items-center justify-center m-2 py-2 rounded-md transition-all',
        isActive ? 'bg-gray-100 text-brand-600' : 'bg-brand-400 text-text',
      )}
      onClick={onClick}
    >
      {Icon}
      <p className={c('text-xs mt-1', isActive && 'font-bold')}>{label}</p>
    </div>
  )
}

const BottomBar: React.FC<Props> = ({ type }) => {
  const router = useRouter()
  return (
    <nav className="fixed bottom-0 w-screen flex flex-row items-center bg-brand-400 shadow-lg">
      <BottomBarItem
        Icon={<Icon type="downarrow" className="text-2xl" />}
        label="借物"
        isActive={type === 'borrowing'}
        onClick={() => router.push('/borrowing')}
      />
      <BottomBarItem
        Icon={<Icon type="uparrow" className="text-2xl" />}
        label="貸出"
        isActive={type === 'lending'}
        onClick={() => router.push('/lending')}
      />
      <BottomBarItem
        Icon={<Icon type="list" className="text-2xl" />}
        label="借りたい"
        isActive={type === 'want-to-borrow'}
        onClick={() => router.push('/want-to-borrow')}
      />
      <BottomBarItem
        Icon={<Icon type="friends" className="text-2xl" />}
        label="タイムライン"
        isActive={type === 'timeline'}
        onClick={() => router.push('/timeline')}
      />
    </nav>
  )
}

export default BottomBar
