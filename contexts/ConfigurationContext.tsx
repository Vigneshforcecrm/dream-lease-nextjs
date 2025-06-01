"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types based on Salesforce response
interface ProductAttribute {
  code: string;
  displayValue: string;
  id: string;
  name: string;
  textValue: string;
}

interface AttributePickList {
  id: string;
  values: ProductAttribute[];
}

interface AttributeCategory {
  code: string;
  name: string;
  records: Array<{
    id: string;
    label: string;
    name: string;
    attributePickList: AttributePickList;
    defaultValue: string;
    isPriceImpacting: boolean;
  }>;
}

interface ProductComponent {
  id: string;
  name: string;
  description: string;
  displayUrl: string;
  prices: Array<{
    price: number;
    isDefault: boolean;
  }>;
  productRelatedComponent: {
    doesBundlePriceIncludeChild: boolean;
    isComponentRequired: boolean;
    isDefaultComponent: boolean;
  };
}

interface ProductComponentGroup {
  id: string;
  name: string;
  description: string;
  maxBundleComponents: number;
  sequence: number;
  components: ProductComponent[];
}

interface SalesforceProduct {
  id: string;
  name: string;
  description: string;
  displayUrl: string;
  prices: Array<{
    price: number;
    isDefault: boolean;
  }>;
  attributeCategories: AttributeCategory[];
  productComponentGroups: ProductComponentGroup[];
}

interface Configuration {
  productId: string;
  productData: SalesforceProduct | null;
  selectedAttributes: { [key: string]: string };
  selectedComponents: { [groupId: string]: string };
  basePrice: number;
  totalPrice: number;
}

interface ConfigurationContextType {
  configuration: Configuration;
  updateConfiguration: (updates: Partial<Configuration>) => void;
  updateAttribute: (attributeName: string, value: string) => void;
  updateComponent: (groupId: string, componentId: string) => void;
  calculatePrice: () => void;
  getColorPrice: (colorName: string) => number;
  loading: boolean;
  error: string | null;
}

const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

export const useConfiguration = () => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
};

interface ConfigurationProviderProps {
  children: ReactNode;
  productId: string;
}

export const ConfigurationProvider = ({ children, productId }: ConfigurationProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [configuration, setConfiguration] = useState<Configuration>({
    productId,
    productData: null,
    selectedAttributes: {},
    selectedComponents: {},
    basePrice: 0,
    totalPrice: 0,
  });

  // Fetch product data from API
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product data');
        }
        
        const data = await response.json();
        const productData = data.result as SalesforceProduct;
        
        // Set default values
        const selectedAttributes: { [key: string]: string } = {};
        const selectedComponents: { [groupId: string]: string } = {};
        
        // Set default attribute values
        productData.attributeCategories?.forEach(category => {
          category.records.forEach(record => {
            if (record.defaultValue) {
              selectedAttributes[record.name] = record.defaultValue;
            }
          });
        });
        
        // Set default component selections (if any)
        productData.productComponentGroups?.forEach(group => {
          const defaultComponent = group.components.find(comp => 
            comp.productRelatedComponent?.isDefaultComponent
          );
          if (defaultComponent) {
            selectedComponents[group.id] = defaultComponent.id;
          }
        });
        
        const basePrice = productData.prices.find(p => p.isDefault)?.price || 0;
        
        setConfiguration(prev => ({
          ...prev,
          productData,
          selectedAttributes,
          selectedComponents,
          basePrice,
          totalPrice: basePrice,
        }));
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

   // Color pricing function
   const getColorPrice = (colorName: string): number => {
    const whiteVariants = [
      'pearl white', 'pure white', 'solid white', 'arctic white', 
      'glacier white', 'alpine white', 'crystal white', 'white'
    ];
    
    const normalizedName = colorName.toLowerCase();
    const isWhiteVariant = whiteVariants.some(variant => 
      normalizedName.includes(variant) || variant.includes(normalizedName)
    );
    
    return isWhiteVariant ? 0 : 1000;
  };

  const updateConfiguration = (updates: Partial<Configuration>) => {
    setConfiguration(prev => ({ ...prev, ...updates }));
  };

  const updateAttribute = (attributeName: string, value: string) => {
    setConfiguration(prev => ({
      ...prev,
      selectedAttributes: {
        ...prev.selectedAttributes,
        [attributeName]: value
      }
    }));
  };

  const updateComponent = (groupId: string, componentId: string) => {
    setConfiguration(prev => ({
      ...prev,
      selectedComponents: {
        ...prev.selectedComponents,
        [groupId]: componentId
      }
    }));
  };

  const calculatePrice = () => {
    if (!configuration.productData) return;
    
    let totalPrice = configuration.basePrice;
    // Add color pricing (attribute pricing)
    const selectedColor = configuration.selectedAttributes['Colour'];
    if (selectedColor && configuration.productData.attributeCategories) {
      // Find the color attribute
      const colorAttributes = configuration.productData.attributeCategories
        ?.flatMap(cat => cat.records || [])
        ?.find(record => record.name === 'Colour');
      
      if (colorAttributes?.attributePickList?.values) {
        const selectedColorOption = colorAttributes.attributePickList.values.find(
          color => color.code === selectedColor
        );
        
        if (selectedColorOption) {
          const colorPrice = getColorPrice(selectedColorOption.displayValue);
          totalPrice += colorPrice;
        }
      }
    }
    
    // Add component prices
    configuration.productData.productComponentGroups?.forEach(group => {
      const selectedComponentId = configuration.selectedComponents[group.id];
      if (selectedComponentId) {
        const component = group.components.find(c => c.id === selectedComponentId);
        if (component && !component.productRelatedComponent?.doesBundlePriceIncludeChild) {
          const price = component.prices.find(p => p.isDefault)?.price || 0;
          totalPrice += price;
        }
      }
    });
    
    setConfiguration(prev => ({ ...prev, totalPrice }));
  };

  // Recalculate price when selections change
  useEffect(() => {
    calculatePrice();
  }, [configuration.selectedAttributes, configuration.selectedComponents, configuration.productData]);

  return (
    <ConfigurationContext.Provider value={{ 
      configuration, 
      updateConfiguration, 
      updateAttribute,
      updateComponent,
      calculatePrice,
      getColorPrice,
      loading,
      error
    }}>
      {children}
    </ConfigurationContext.Provider>
  );
};