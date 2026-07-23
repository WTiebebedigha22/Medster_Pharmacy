import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const [categories, setCategories] = useState([]);

  const fetchProducts = useCallback(async (newFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const allFilters = { ...filters, ...newFilters };
      const response = await api.getProducts(allFilters);
      
      setProducts(response.products);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
      setFilters(allFilters);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const searchProducts = useCallback(async (query, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.searchProducts(query, options);
      setProducts(response.products);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err.message || 'Failed to search products');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setLoading(true);
      try {
        const response = await api.getProducts({ ...filters, page: nextPage });
        setProducts(prev => [...prev, ...response.products]);
        setPage(response.page);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError(err.message || 'Failed to load more products');
      } finally {
        setLoading(false);
      }
    }
  }, [page, totalPages, filters]);

  const filterByCategory = useCallback((category) => {
    fetchProducts({ category });
  }, [fetchProducts]);

  const filterByPrice = useCallback((minPrice, maxPrice) => {
    fetchProducts({ minPrice, maxPrice });
  }, [fetchProducts]);

  const sortProducts = useCallback((sort) => {
    fetchProducts({ sort });
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  return {
    products,
    loading,
    error,
    total,
    page,
    totalPages,
    filters,
    categories,
    fetchProducts,
    searchProducts,
    loadMore,
    filterByCategory,
    filterByPrice,
    sortProducts,
    setFilters,
  };
};