import React, { useState, useEffect } from 'react';
import { Exercise, MuscleGroup, Equipment, Difficulty, ExerciseCategory } from '../types';
import { db } from '../db';
import { Search, Filter, Plus, X, Dumbbell, Clock, Target } from 'lucide-react';

interface ExerciseSelectorProps {
  selectedExercises: Exercise[];
  onExerciseSelect: (exercise: Exercise) => void;
  onExerciseRemove: (exerciseId: string) => void;
  onCustomExerciseAdd?: (exercise: Omit<Exercise, 'id'>) => void;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  selectedExercises,
  onExerciseSelect,
  onExerciseRemove,
  onCustomExerciseAdd
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<{
    muscleGroups: MuscleGroup[];
    equipment: Equipment[];
    difficulty: Difficulty[];
    category: ExerciseCategory[];
  }>({
    muscleGroups: [],
    equipment: [],
    difficulty: [],
    category: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customExercise, setCustomExercise] = useState({
    name: '',
    description: '',
    instructions: [''],
    muscleGroup: 'petto' as MuscleGroup,
    equipment: ['a corpo libero'] as Equipment[],
    difficulty: 'principiante' as Difficulty,
    category: 'forza' as ExerciseCategory
  });

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchTerm, selectedFilters]);

  const loadExercises = async () => {
    try {
      const exerciseList = await db.exercises.toArray();
      setExercises(exerciseList);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    // Ricerca per testo
    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtri
    if (selectedFilters.muscleGroups.length > 0) {
      filtered = filtered.filter(exercise =>
        selectedFilters.muscleGroups.includes(exercise.muscleGroup)
      );
    }

    if (selectedFilters.equipment.length > 0) {
      filtered = filtered.filter(exercise =>
        exercise.equipment.some(eq => selectedFilters.equipment.includes(eq))
      );
    }

    if (selectedFilters.difficulty.length > 0) {
      filtered = filtered.filter(exercise =>
        selectedFilters.difficulty.includes(exercise.difficulty)
      );
    }

    if (selectedFilters.category.length > 0) {
      filtered = filtered.filter(exercise =>
        selectedFilters.category.includes(exercise.category)
      );
    }

    setFilteredExercises(filtered);
  };

  const toggleFilter = (type: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value as never)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value as never]
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      muscleGroups: [],
      equipment: [],
      difficulty: [],
      category: []
    });
    setSearchTerm('');
  };

  const handleCustomExerciseSubmit = () => {
    if (!customExercise.name.trim()) return;

    const newExercise: Omit<Exercise, 'id'> = {
      name: customExercise.name.trim(),
      description: customExercise.description.trim(),
      instructions: customExercise.instructions.filter(i => i.trim()).length > 0
        ? customExercise.instructions.filter(i => i.trim())
        : ['Nessuna istruzione disponibile'],
      muscleGroup: customExercise.muscleGroup,
      equipment: customExercise.equipment,
      difficulty: customExercise.difficulty,
      category: customExercise.category,
      isCustom: true
    };

    if (onCustomExerciseAdd) {
      onCustomExerciseAdd(newExercise);
    }

    // Reset form
    setCustomExercise({
      name: '',
      description: '',
      instructions: [''],
      muscleGroup: MuscleGroup.CHEST,
      equipment: [Equipment.BODYWEIGHT],
      difficulty: Difficulty.BEGINNER,
      category: ExerciseCategory.STRENGTH
    });
    setShowCustomForm(false);
  };

  const addInstruction = () => {
    setCustomExercise(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setCustomExercise(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst)
    }));
  };

  const removeInstruction = (index: number) => {
    setCustomExercise(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const toggleEquipment = (equipment: Equipment) => {
    setCustomExercise(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(eq => eq !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  const isSelected = (exerciseId: string) => {
    return selectedExercises.some(e => e.id === exerciseId);
  };

  const activeFiltersCount = Object.values(selectedFilters).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Seleziona Esercizi</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCustomForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Personalizzato</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              activeFiltersCount > 0
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Ricerca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cerca esercizi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Filtri */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-700">Filtri</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Cancella tutti
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gruppi muscolari */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Gruppo Muscolare</h4>
              <div className="space-y-1">
                {Object.values(MuscleGroup).map((group) => (
                  <label key={group} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedFilters.muscleGroups.includes(group)}
                      onChange={() => toggleFilter('muscleGroups', group)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{group}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Attrezzatura */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Attrezzatura</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Object.values(Equipment).map((eq) => (
                  <label key={eq} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedFilters.equipment.includes(eq)}
                      onChange={() => toggleFilter('equipment', eq)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{eq}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Difficoltà */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Difficoltà</h4>
              <div className="space-y-1">
                {Object.values(Difficulty).map((diff) => (
                  <label key={diff} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedFilters.difficulty.includes(diff)}
                      onChange={() => toggleFilter('difficulty', diff)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{diff}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categoria */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Categoria</h4>
              <div className="space-y-1">
                {Object.values(ExerciseCategory).map((cat) => (
                  <label key={cat} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedFilters.category.includes(cat)}
                      onChange={() => toggleFilter('category', cat)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form esercizio personalizzato */}
      {showCustomForm && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-700">Nuovo Esercizio Personalizzato</h3>
            <button
              onClick={() => setShowCustomForm(false)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={customExercise.name}
                onChange={(e) => setCustomExercise(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome dell'esercizio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrizione
              </label>
              <textarea
                value={customExercise.description}
                onChange={(e) => setCustomExercise(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Descrizione dell'esercizio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Istruzioni
              </label>
              <div className="space-y-2">
                {customExercise.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Istruzione ${index + 1}`}
                    />
                    {customExercise.instructions.length > 1 && (
                      <button
                        onClick={() => removeInstruction(index)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addInstruction}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Aggiungi istruzione
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gruppo Muscolare
                </label>
                <select
                  value={customExercise.muscleGroup}
                  onChange={(e) => setCustomExercise(prev => ({ ...prev, muscleGroup: e.target.value as MuscleGroup }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.values(MuscleGroup).map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficoltà
                </label>
                <select
                  value={customExercise.difficulty}
                  onChange={(e) => setCustomExercise(prev => ({ ...prev, difficulty: e.target.value as Difficulty }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.values(Difficulty).map((diff) => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={customExercise.category}
                  onChange={(e) => setCustomExercise(prev => ({ ...prev, category: e.target.value as ExerciseCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.values(ExerciseCategory).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attrezzatura
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.values(Equipment).map((eq) => (
                  <label key={eq} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={customExercise.equipment.includes(eq)}
                      onChange={() => toggleEquipment(eq)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{eq}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCustomForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleCustomExerciseSubmit}
                disabled={!customExercise.name.trim()}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  customExercise.name.trim()
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-400 cursor-not-allowed'
                }`}
              >
                Aggiungi Esercizio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista esercizi */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || activeFiltersCount > 0
              ? 'Nessun esercizio trovato con i filtri applicati'
              : 'Nessun esercizio disponibile'
            }
          </div>
        ) : (
          filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                isSelected(exercise.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => {
                if (!isSelected(exercise.id)) {
                  onExerciseSelect(exercise);
                }
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">
                    {exercise.name}
                    {exercise.isCustom && (
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        Personalizzato
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {exercise.muscleGroup}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {exercise.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      {exercise.category}
                    </span>
                    {exercise.equipment.map((eq) => (
                      <span key={eq} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>

                {isSelected(exercise.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExerciseRemove(exercise.id);
                    }}
                    className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};