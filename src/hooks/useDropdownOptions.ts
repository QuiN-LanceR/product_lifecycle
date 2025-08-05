import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface DropdownOption {
  id: number;
  kategori?: string;
  segmen?: string;
  stage?: string;
}

interface LoadingState {
  kategori: boolean;
  segmen: boolean;
  stage: boolean;
}

export const useDropdownOptions = () => {
  const [kategoriOptions, setKategoriOptions] = useState<DropdownOption[]>([]);
  const [segmenOptions, setSegmenOptions] = useState<DropdownOption[]>([]);
  const [stageOptions, setStageOptions] = useState<DropdownOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<LoadingState>({
    kategori: false,
    segmen: false,
    stage: false
  });

  const fetchDropdownOptions = async () => {
    setLoadingOptions({ kategori: true, segmen: true, stage: true });
    
    try {
      const [kategoriRes, segmenRes, stageRes] = await Promise.all([
        fetch('/api/produk/kategoris/get'),
        fetch('/api/produk/segmens/get'),
        fetch('/api/produk/stages/get')
      ]);

      if (kategoriRes.ok) {
        const kategoriData = await kategoriRes.json();
        setKategoriOptions(kategoriData.data || []);
      }

      if (segmenRes.ok) {
        const segmenData = await segmenRes.json();
        setSegmenOptions(segmenData.data || []);
      }

      if (stageRes.ok) {
        const stageData = await stageRes.json();
        setStageOptions(stageData.data || []);
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
      Swal.fire("Gagal", "Gagal memuat opsi dropdown", "error");
    } finally {
      setLoadingOptions({ kategori: false, segmen: false, stage: false });
    }
  };

  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  return {
    kategoriOptions,
    segmenOptions,
    stageOptions,
    loadingOptions
  };
};