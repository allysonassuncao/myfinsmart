import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DollarSign } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      
      const { error } = await signIn(email, password);
      
      if (error) {
        setError('Email ou senha inválidos');
        return;
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError('Ocorreu um erro ao fazer login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Left side with branding */}
      <div className="bg-[#11ab77] text-white p-8 flex flex-col justify-center items-center md:w-1/2">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center mb-6">
            <DollarSign size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center">Fin Smart</h1>
          <p className="text-xl mb-6 text-center">
            Um Assistente Financeiro pessoal para ajudar a organizar seu dinheiro.
          </p>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="flex items-center justify-center p-8 md:w-1/2">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Entrar na sua conta</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                placeholder="Seu email"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                placeholder="Sua senha"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#11ab77] text-white py-2 px-4 rounded-md hover:bg-[#0e9968] focus:outline-none focus:ring-2 focus:ring-[#11ab77] focus:ring-opacity-50 transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-[#11ab77] hover:underline">
              Esqueceu sua senha?
            </a>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-center text-gray-600 text-sm">
              Não tem uma conta?{' '}
              <a href="https://myfinsmart.netlify.app/" className="text-[#11ab77] hover:underline">
                Criar nova conta
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}