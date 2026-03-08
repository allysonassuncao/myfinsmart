import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Left side with branding - Premium Gradient */}
      <div className="bg-gradient-to-br from-[#11ab77] to-[#0d8a5f] text-white p-12 flex flex-col justify-center items-center md:w-1/2">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm mb-4">
            <DollarSign size={64} className="text-white drop-shadow-lg" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-2">Fin Smart</h1>
          <p className="text-xl text-white/90 font-medium leading-relaxed">
            Seu assistente financeiro inteligente para simplificar sua vida e organizar seu futuro.
          </p>
          <div className="pt-8 grid grid-cols-2 gap-4 text-left">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="font-bold text-lg">Controle Total</p>
              <p className="text-sm text-white/70">Visualize seus gastos em tempo real.</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="font-bold text-lg">Metas Reais</p>
              <p className="text-sm text-white/70">Economize para o que realmente importa.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="flex items-center justify-center p-8 md:w-1/2">
        <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center tracking-tight text-gray-900">Boas-vindas!</CardTitle>
            <CardDescription className="text-center text-gray-500 text-base">
              Entre com suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium px-4 py-3 rounded-lg mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-11 border-gray-200 focus:ring-[#11ab77] focus:border-[#11ab77] transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Senha</Label>
                  <a href="#" className="text-sm font-medium text-[#11ab77] hover:underline transition-all">
                    Esqueceu a senha?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 border-gray-200 focus:ring-[#11ab77] focus:border-[#11ab77] transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-lg font-bold bg-[#11ab77] hover:bg-[#0e9968] text-white rounded-xl shadow-lg shadow-[#11ab77]/20 active:scale-[0.98] transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </div>
                ) : 'Entrar na Conta'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 font-medium">Não tem uma conta?</span>
              </div>
            </div>
            <Button variant="outline" className="w-full h-12 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all text-gray-700" asChild>
              <a href="https://myfinsmart.netlify.app/">
                Criar Nova Conta Grátis
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
