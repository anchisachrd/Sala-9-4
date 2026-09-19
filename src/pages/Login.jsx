import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  // Supabase Auth ต้องใช้ email — ผู้ใช้พิมพ์แค่ชื่อ แล้วเราเติมโดเมนคงที่ให้
  const EMAIL_DOMAIN = 'sala94.com'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const email = `${name.trim().toLowerCase()}@${EMAIL_DOMAIN}`
    const { error } = await login(email, password)
    if (error) {
      setError('You put somthing wrong, try again 🤬😤')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl flex flex-col gap-6 bg-white px-20 py-12 rounded-xl"
      >
        <div className="flex flex-col items-center gap-3">
          <img src="/sala-9-4.svg" alt="Sala 9-4" className="w-40 h-auto" />
          <h2 className="font-paprika text-2xl text-center">Hola · Sawaddee</h2>
        </div>
        <div className="flex flex-col gap-2">
          <label className=" font-medium text-[#474747]">Who are you haaaa?????</label>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="username"
            className="text-[#474747] rounded-md px-2 py-2 bg-gray-100"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className=" font-medium text-[#474747]">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-[#474747] rounded-md px-2 py-2 bg-gray-100"
            required
          />
        </div>
        {error && <p className="error-text text-red-500">{error}</p>}
        <button type="submit" className="bg-[#889FCE] text-white py-2 px-4 rounded-md hover:bg-[#748ac0] transition-colors">
          Log In
        </button>
      </form>
    </div>
  )
}