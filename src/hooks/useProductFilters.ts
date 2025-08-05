import { useState, useCallback } from 'react';
import { ProductFilters, DropdownOption } from '../types/product.types';

export const useProductFilters = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    kategori: '',
    segmen: '',
    stage: '',
  });

  const [kategoriOptions, setKategoriOptions] = useState<DropdownOption[]>([]);
  const [segmenOptions, setSegmenOptions] = useState<DropdownOption[]>([]);
  const [stageOptions, setStageOptions] = useState<DropdownOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const fetchDropdownOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      const [kategoriRes, segmenRes, stageRes] = await Promise.all([
        fetch('/api/produk/kategoris/get'),
        fetch('/api/produk/segmens/get'),
        fetch('/api/produk/stages/get')
      ]);

      const [kategoriData, segmenData, stageData] = await Promise.all([
        kategoriRes.json(),
        segmenRes.json(),
        stageRes.json()
      ]);

      // PERBAIKAN: Akses data dari property 'data'
      setKategoriOptions(kategoriData.data || []);
      setSegmenOptions(segmenData.data || []);
      setStageOptions(stageData.data || []);
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  const handleFilterChange = useCallback((key: keyof ProductFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      kategori: '',
      segmen: '',
      stage: '',
    });
  }, []);

  return {
    filters,
    kategoriOptions,
    segmenOptions,
    stageOptions,
    loadingOptions,
    fetchDropdownOptions,
    handleFilterChange,
    clearFilters
  };
};