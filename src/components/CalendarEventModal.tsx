import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
  selectedDay?: number;
  onSave: () => void;
}

interface TipoOption {
  id: number;
  name: string;
  value: string;
}

interface CategoriaOption {
  id: number;
  name: string;
  value: string;
}

interface SubcategoriaOption {
  id: number;
  name: string;
  value: string;
  tipo_value: string;
  categoria_value: string;
}

interface EventData {
  titulo: string;
  descricao: string;
  tipo: string | null;
  categoria: string | null;
  subcategoria: string | null;
  valor: number;
  dia: number;
}

export default function CalendarEventModal({ 
  isOpen, 
  onClose, 
  eventId,
  selectedDay,
  onSave
}: CalendarEventModalProps) {
  const [event, setEvent] = useState<EventData>({
    titulo: '',
    descricao: '',
    tipo: null,
    categoria: null,
    subcategoria: null,
    valor: 0,
    dia: selectedDay || 1
  });
  
  const [tipos, setTipos] = useState<TipoOption[]>([]);
  const [categorias, setCategorias] = useState<CategoriaOption[]>([]);
  const [subcategorias, setSubcategorias] = useState<SubcategoriaOption[]>([]);
  const [filteredSubcategorias, setFilteredSubcategorias] = useState<SubcategoriaOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [eventLoaded, setEventLoaded] = useState(false);
  const [valorInput, setValorInput] = useState('0');

  // Generate days array for dropdown (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      if (eventId) {
        fetchEventData(eventId);
      } else {
        resetForm();
      }
    }
  }, [isOpen, eventId]);

  useEffect(() => {
    setValorInput(Math.abs(event.valor).toString());
  }, [event.valor]);

  useEffect(() => {
    if (subcategorias.length > 0) {
      filterSubcategorias();
    }
  }, [event.tipo, event.categoria, subcategorias]);

  const fetchOptions = async () => {
    setIsLoading(true);
    setOptionsLoaded(false);
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Fetch tipos
      const { data: tiposData, error: tiposError } = await supabase
        .from('tipos')
        .select('id, name, value')
        .eq('user_id', userId);
      
      if (tiposError) throw tiposError;
      setTipos(tiposData || []);

      // Fetch categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('id, name, value')
        .eq('user_id', userId);
      
      if (categoriasError) throw categoriasError;
      setCategorias(categoriasData || []);

      // Fetch subcategorias
      const { data: subcategoriasData, error: subcategoriasError } = await supabase
        .from('subcategorias')
        .select('id, name, value, tipo_value, categoria_value')
        .eq('user_id', userId);
      
      if (subcategoriasError) throw subcategoriasError;
      setSubcategorias(subcategoriasData || []);
      
      setOptionsLoaded(true);
    } catch (error) {
      console.error('Error fetching options:', error);
      setError('Erro ao carregar opções. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventData = async (id: string) => {
    setIsLoading(true);
    setEventLoaded(false);
    try {
      const { data, error } = await supabase
        .from('calendarios')
        .select('titulo, descricao, tipo, categoria, subcategoria, valor, dia')
        .eq('evento_id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setEvent({
          titulo: data.titulo || '',
          descricao: data.descricao || '',
          tipo: data.tipo,
          categoria: data.categoria,
          subcategoria: data.subcategoria,
          valor: data.valor || 0,
          dia: data.dia || 1
        });
        setEventLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Erro ao carregar dados do evento. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEvent({
      titulo: '',
      descricao: '',
      tipo: null,
      categoria: null,
      subcategoria: null,
      valor: 0,
      dia: selectedDay || 1
    });
    setValorInput('0');
    setError(null);
    setEventLoaded(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'tipo') {
      const selectedTipo = tipos.find(t => t.id.toString() === value);
      setEvent(prev => ({ 
        ...prev, 
        tipo: selectedTipo ? selectedTipo.value : null,
        categoria: null,
        subcategoria: null
      }));
    } else if (name === 'categoria') {
      const selectedCategoria = categorias.find(c => c.id.toString() === value);
      setEvent(prev => ({ 
        ...prev, 
        categoria: selectedCategoria ? selectedCategoria.value : null,
        subcategoria: null
      }));
    } else if (name === 'subcategoria') {
      const selectedSubcategoria = subcategorias.find(s => s.id.toString() === value);
      setEvent(prev => ({ 
        ...prev, 
        subcategoria: selectedSubcategoria ? selectedSubcategoria.value : null 
      }));
    } else if (name === 'dia') {
      setEvent(prev => ({
        ...prev,
        dia: parseInt(value)
      }));
    } else if (name !== 'valor') {
      setEvent(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    if (/^[0-9]*\.?[0-9]*$/.test(input) || input === '') {
      setValorInput(input);
      const numericValue = parseFloat(input) || 0;
      setEvent(prev => ({ ...prev, valor: numericValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      if (!event.titulo) {
        throw new Error('Título é obrigatório');
      }
      
      if (!event.tipo) {
        throw new Error('Tipo é obrigatório');
      }
      
      if (event.valor === 0) {
        throw new Error('Valor não pode ser zero');
      }

      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const eventData = {
        titulo: event.titulo,
        descricao: event.descricao,
        tipo: event.tipo,
        categoria: event.categoria,
        subcategoria: event.subcategoria,
        valor: event.valor,
        dia: event.dia,
        user_id: userId
      };

      let error;

      if (eventId) {
        const { error: updateError } = await supabase
          .from('calendarios')
          .update(eventData)
          .eq('evento_id', eventId);
        
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('calendarios')
          .insert([eventData]);
        
        error = insertError;
      }
      
      if (error) throw error;
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving event:', error);
      setError(error.message || 'Erro ao salvar evento. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const filterSubcategorias = () => {
    if (!event.tipo && !event.categoria) {
      setFilteredSubcategorias(subcategorias);
      return;
    }

    const filtered = subcategorias.filter(sub => {
      const matchesTipo = !event.tipo || sub.tipo_value === event.tipo;
      const matchesCategoria = !event.categoria || sub.categoria_value === event.categoria;
      return matchesTipo && matchesCategoria;
    });

    setFilteredSubcategorias(filtered);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {eventId ? 'Editar Evento' : 'Novo Evento'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 mx-4">
            <p>{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#11ab77]"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-4">
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={event.titulo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                placeholder="Título do evento"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="descricao"
                name="descricao"
                value={event.descricao}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                placeholder="Descrição do evento"
                rows={3}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                id="tipo"
                name="tipo"
                value={tipos.find(t => t.value === event.tipo)?.id.toString() || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                required
              >
                <option value="">Selecione um tipo</option>
                {tipos.map(tipo => (
                  <option key={tipo.id} value={tipo.id.toString()}>
                    {tipo.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                id="categoria"
                name="categoria"
                value={categorias.find(c => c.value === event.categoria)?.id.toString() || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id.toString()}>
                    {categoria.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="subcategoria" className="block text-sm font-medium text-gray-700 mb-1">
                Subcategoria
              </label>
              <select
                id="subcategoria"
                name="subcategoria"
                value={subcategorias.find(s => s.value === event.subcategoria)?.id.toString() || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
              >
                <option value="">Selecione uma subcategoria</option>
                {filteredSubcategorias.map(subcategoria => (
                  <option key={subcategoria.id} value={subcategoria.id.toString()}>
                    {subcategoria.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                id="valor"
                name="valor"
                value={valorInput}
                onChange={handleValorChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="dia" className="block text-sm font-medium text-gray-700 mb-1">
                Dia do mês
              </label>
              <select
                id="dia"
                name="dia"
                value={event.dia}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                required
              >
                {days.map(day => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#11ab77] text-white rounded-md hover:bg-[#0e9968] focus:outline-none focus:ring-2 focus:ring-[#11ab77] flex items-center"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>Salvar</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}