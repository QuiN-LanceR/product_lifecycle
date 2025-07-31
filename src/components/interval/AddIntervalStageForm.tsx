"use client";

import { useState, useEffect } from "react";
import Swal from 'sweetalert2';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

type Stage = {
  id: number;
  stage: string;
};

export default function AddIntervalStageForm({ onSuccess, onCancel }: Props) {
  const [formData, setFormData] = useState({
    id_stage_previous: "",
    id_stage_next: "",
    interval: "",
    keterangan: ""
  });
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStages, setLoadingStages] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Definisi urutan stage yang valid
  const stageOrder = ['introduction', 'growth', 'maturity', 'decline'];

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const response = await fetch('/api/produk/stages/get');
      if (response.ok) {
        const data = await response.json();
        setStages(data || []);
      }
    } catch (error) {
      console.error('Error fetching stages:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat data stage'
      });
    } finally {
      setLoadingStages(false);
    }
  };

  const getStageIndex = (stageName: string) => {
    return stageOrder.findIndex(stage => 
      stageName.toLowerCase().includes(stage)
    );
  };

  const validateStageOrder = (previousStageId: string, nextStageId: string) => {
    if (!previousStageId || !nextStageId) return true;
    
    const previousStage = stages.find(s => s.id.toString() === previousStageId);
    const nextStage = stages.find(s => s.id.toString() === nextStageId);
    
    if (!previousStage || !nextStage) return true;
    
    const previousIndex = getStageIndex(previousStage.stage);
    const nextIndex = getStageIndex(nextStage.stage);
    
    // Jika tidak ditemukan dalam urutan yang didefinisikan, izinkan
    if (previousIndex === -1 || nextIndex === -1) return true;
    
    // Stage next harus lebih tinggi dari stage previous
    return nextIndex > previousIndex;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.id_stage_previous) {
      newErrors.id_stage_previous = 'Stage previous wajib dipilih';
    }
    if (!formData.id_stage_next) {
      newErrors.id_stage_next = 'Stage next wajib dipilih';
    }
    if (!formData.interval || Number(formData.interval) <= 0) {
      newErrors.interval = 'Interval harus lebih dari 0';
    }
    if (formData.id_stage_previous === formData.id_stage_next) {
      newErrors.id_stage_next = 'Stage next tidak boleh sama dengan stage previous';
    }
    
    // Validasi urutan stage
    if (formData.id_stage_previous && formData.id_stage_next) {
      if (!validateStageOrder(formData.id_stage_previous, formData.id_stage_next)) {
        newErrors.id_stage_next = 'Urutan stage tidak valid. Harus mengikuti: Introduction → Growth → Maturity → Decline';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/interval/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id_stage_previous: parseInt(formData.id_stage_previous),
          id_stage_next: parseInt(formData.id_stage_next),
          interval: parseInt(formData.interval)
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Interval stage berhasil ditambahkan!'
        });
        onSuccess();
      } else {
        throw new Error(data.message || 'Gagal menambahkan interval stage');
      }
    } catch (error) {
      console.error('Error adding interval stage:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'Gagal menambahkan interval stage'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Filter stages untuk dropdown previous (exclude decline)
  const getPreviousStageOptions = () => {
    return stages.filter(stage => 
      !stage.stage.toLowerCase().includes('decline')
    );
  };

  // Filter stages untuk dropdown next berdasarkan previous yang dipilih
  const getNextStageOptions = () => {
    if (!formData.id_stage_previous) return stages;
    
    const selectedPrevious = stages.find(s => s.id.toString() === formData.id_stage_previous);
    if (!selectedPrevious) return stages;
    
    const previousIndex = getStageIndex(selectedPrevious.stage);
    if (previousIndex === -1) return stages;
    
    return stages.filter(stage => {
      const stageIndex = getStageIndex(stage.stage);
      return stageIndex > previousIndex || stageIndex === -1;
    });
  };

  if (loadingStages) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stage Previous */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stage Previous <span className="text-red-500">*</span>
            </label>
            <select
              name="id_stage_previous"
              value={formData.id_stage_previous}
              onChange={handleChange}
              disabled={loadingStages}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.id_stage_previous ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              } ${loadingStages ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
            >
              <option value="">{loadingStages ? 'Memuat...' : 'Pilih Stage Previous'}</option>
              {getPreviousStageOptions().map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.stage}
                </option>
              ))}
            </select>
            {errors.id_stage_previous && (
              <p className="text-red-500 text-sm mt-1">{errors.id_stage_previous}</p>
            )}
          </div>

          {/* Stage Next */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stage Next <span className="text-red-500">*</span>
            </label>
            <select
              name="id_stage_next"
              value={formData.id_stage_next}
              onChange={handleChange}
              disabled={loadingStages}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.id_stage_next ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              } ${loadingStages ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
            >
              <option value="">{loadingStages ? 'Memuat...' : 'Pilih Stage Next'}</option>
              {getNextStageOptions().map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.stage}
                </option>
              ))}
            </select>
            {errors.id_stage_next && (
              <p className="text-red-500 text-sm mt-1">{errors.id_stage_next}</p>
            )}
          </div>
        </div>

        {/* Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Interval (Bulan) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="interval"
            value={formData.interval}
            onChange={handleChange}
            min="1"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
              errors.interval ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Masukkan interval dalam bulan"
          />
          {errors.interval && (
            <p className="text-red-500 text-sm mt-1">{errors.interval}</p>
          )}
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Keterangan
          </label>
          <textarea
            name="keterangan"
            value={formData.keterangan}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            placeholder="Masukkan keterangan (opsional)"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors duration-200 font-medium"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center transition-colors duration-200 font-medium"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
}