import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  PickIcon,
  ProfileIcon,
  ChevronDownIcon,
  LogOutIcon,
} from './icons'
import { useAuth } from '../context/AuthContext'

const iconLink = ({ isActive }) =>
  `p-2 rounded-md text-[#474747] hover:bg-gray-100 transition-colors ${
    isActive ? 'bg-gray-100' : ''
  }`

function ProfileMenu() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 py-1.5  pr-2.5 rounded-md text-[#474747]"
      >
        <ProfileIcon size={25} />
        <span className="font-medium">
          Hola, {profile?.display_name}
        </span>
        <ChevronDownIcon
          size={16}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-md bg-white shadow-lg ring-1 ring-black/5 py-1 z-20">
          <button
            onClick={() => {
              setOpen(false)
              navigate('/profile')
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[#474747] hover:bg-gray-100"
          >
            <ProfileIcon size={18} />
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-500 hover:bg-gray-100"
          >
            <LogOutIcon size={18} />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  return (
    <nav className="text-lg py-10 mx-auto px-4 h-16 flex items-center justify-between bg-white">
      <Link to="/" className="flex items-center">
        <img src="/sala-9-4.svg" alt="Sala 9.4" className="h-14 w-auto" />
      </Link>

      <div className="flex items-center gap-2">
        <NavLink
          to="/catalog"
          className="flex items-center gap-2 rounded-md px-3 py-2 bg-[#8FBC93] text-white hover:bg-[#7BA87F] transition-colors"
        >
          <PickIcon size={22} />
          Pick a Flick
        </NavLink>

        <NavLink to="/" end className={iconLink}>
          <HomeIcon size={25} />
        </NavLink>

        <ProfileMenu />
      </div>
    </nav>
  )
}
