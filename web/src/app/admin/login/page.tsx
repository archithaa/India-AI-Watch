import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-lg font-bold text-slate-900 mb-1">Admin access</h1>
        <p className="text-sm text-slate-500 mb-6">India AI Watch</p>
        <LoginForm />
      </div>
    </div>
  )
}
