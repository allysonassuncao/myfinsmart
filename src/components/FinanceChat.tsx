import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function FinanceChat() {
  const { user, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([
    { text: "Olá! Sou o MyFinSmart Bot. Como posso ajudar a analisar suas finanças hoje?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Se o usuário não estiver logado, não renderiza o chat
  if (authLoading || !user) {
    return null;
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    
    // Constrói o histórico COM a nova mensagem do usuário para enviar
    const updatedMessages = [...messages, { text: userMessage, sender: "user" as const }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("finance-chat", {
        body: { 
          message: userMessage, // Mantém compatibilidade
          messages: updatedMessages, // Envia histórico completo para memória
          userId: user.id 
        }
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { text: data.response || "Desculpe, não consegui entender o que aconteceu.", sender: "bot" }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { text: `Erro: ${err.message || err}. Verifique se a Edge Function está implantada.`, sender: "bot" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para traduzir o padrão **bold** em elementos HTML <strong>
  const formatMessageText = (text: string) => {
    if (!text) return "";
    
    // Divide o texto pelos padrões de negrito (**texto**)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove os asteriscos e renderiza em Negrito
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-bold text-foreground">{boldText}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 z-50 flex items-center justify-center"
        title="Conversar com assistente"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {/* Caixa de Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[550px] max-h-[calc(100vh-10rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden text-card-foreground animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Cabeçalho */}
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <span className="font-semibold block text-sm">Assistente AI</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  Online agora
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground p-1.5 rounded-lg transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Área de Histórico */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-sm whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-card-foreground rounded-bl-none border border-border"
                  }`}
                >
                  {formatMessageText(m.text)}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="p-3 bg-muted border border-border rounded-2xl rounded-bl-none text-muted-foreground text-xs flex items-center gap-1.5">
                  <span>Pensando</span>
                  <div className="flex gap-0.5">
                    <span className="h-1 w-1 bg-muted-foreground rounded-full animate-bounce"></span>
                    <span className="h-1 w-1 bg-muted-foreground rounded-full animate-bounce delay-100"></span>
                    <span className="h-1 w-1 bg-muted-foreground rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Área de Prompt (Sugestões Rápidas) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {["Qual meu saldo?", "Resumo da semana", "Quais contas vencem hoje?"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); }}
                  className="text-xs px-2.5 py-1 bg-muted hover:bg-accent border border-border rounded-full hover:cursor-pointer transition duration-150"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Área de Entrada */}
          <div className="p-4 border-t border-border flex items-center gap-2 bg-background">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Digite sua dúvida financeira..."
              className="flex-1 bg-muted px-4 py-2 rounded-xl text-sm border border-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 active:scale-95 transition disabled:opacity-40 shadow-sm flex items-center justify-center h-9 w-9"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
