import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />
      <main className="max-w-[1500px] mx-auto px-6 py-16">
        <Outlet />
      </main>
    </div>
  )
}
