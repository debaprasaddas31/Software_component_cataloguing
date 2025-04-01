import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, componentStorageName } from '../lib/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Package, Edit, Trash2, Plus, Search, Eye, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Component {
  id: string;
  componentName: string;
  description?: string;
  componentType: string;
  programmingLanguage?: string;
  designNotation?: string;
  componentCategory: string;
  keywords?: string[];
  usageCount?: number;
  queryCount?: number;
  timestamp: Date;
  createdBy: string;
  status?: 'active' | 'archived';
  version?: string;
  parentCategory?: string;
}

interface CategoryTree {
  [key: string]: {
    components: Component[];
    subcategories: CategoryTree;
  };
}

export function Components() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryTree, setCategoryTree] = useState<CategoryTree>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');

  useEffect(() => {
    fetchComponents();
  }, []);

  useEffect(() => {
    if (components.length > 0) {
      buildCategoryTree();
    }
  }, [components]);

  const buildCategoryTree = () => {
    const tree: CategoryTree = {};

    components.forEach(component => {
      let currentLevel = tree;
      const categories = component.parentCategory 
        ? [component.parentCategory, component.componentCategory]
        : [component.componentCategory];

      categories.forEach((category, index) => {
        if (!currentLevel[category]) {
          currentLevel[category] = {
            components: [],
            subcategories: {}
          };
        }

        if (index === categories.length - 1) {
          currentLevel[category].components.push(component);
        } else {
          currentLevel = currentLevel[category].subcategories;
        }
      });
    });

    setCategoryTree(tree);
  };

  async function fetchComponents() {
    try {
      setLoading(true);
      const q = query(collection(db, componentStorageName), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const componentsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore timestamp to Date
        const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();
        return {
          id: doc.id,
          ...data,
          timestamp,
          // Ensure these fields are defined with defaults
          keywords: data.keywords || [],
          usageCount: data.usageCount || 0,
          queryCount: data.queryCount || 0,
          version: data.version || '1.0.0',
          status: data.status || 'active'
        };
      }) as Component[];
      setComponents(componentsData);
    } catch (error) {
      console.error('Error fetching components:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this component?')) return;
    
    try {
      await deleteDoc(doc(db, componentStorageName, id));
      fetchComponents();
    } catch (error) {
      console.error('Error deleting component:', error);
    }
  }

  async function incrementUsageCount(component: Component) {
    try {
      const componentRef = doc(db, componentStorageName, component.id);
      await updateDoc(componentRef, {
        usageCount: (component.usageCount || 0) + 1,
        lastUsed: new Date()
      });
      fetchComponents();
    } catch (error) {
      console.error('Error updating usage count:', error);
    }
  }

  async function incrementQueryCount(component: Component) {
    try {
      const componentRef = doc(db, componentStorageName, component.id);
      await updateDoc(componentRef, {
        queryCount: (component.queryCount || 0) + 1
      });
      fetchComponents();
    } catch (error) {
      console.error('Error updating query count:', error);
    }
  }

  const filteredComponents = components.filter(component => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      component.componentName.toLowerCase().includes(searchLower) ||
      component.description?.toLowerCase().includes(searchLower) ||
      component.componentType.toLowerCase().includes(searchLower) ||
      component.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower));
    
    if (selectedCategory) {
      return matchesSearch && (
        component.componentCategory === selectedCategory ||
        component.parentCategory === selectedCategory
      );
    }
    
    return matchesSearch;
  });

  const renderCategoryTree = (tree: CategoryTree, level: number = 0) => {
    return Object.entries(tree).map(([category, { components, subcategories }]) => (
      <div key={category} style={{ marginLeft: `${level * 20}px` }}>
        <button
          onClick={() => setSelectedCategory(category)}
          className={`flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 ${
            selectedCategory === category ? 'bg-blue-100' : ''
          }`}
        >
          <Package className="h-4 w-4" />
          <span>{category}</span>
          <span className="text-sm text-gray-500">({components.length})</span>
        </button>
        {Object.keys(subcategories).length > 0 && (
          <div className="ml-4">
            {renderCategoryTree(subcategories, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Components</h1>
        <Link
          to="/components/add"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Component
        </Link>
      </div>

      <div className="flex space-x-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-md ${
              viewMode === 'list' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1 rounded-md ${
              viewMode === 'tree' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tree
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {viewMode === 'tree' && (
          <div className="w-64 bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-4">Categories</h2>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 ${
                  !selectedCategory ? 'bg-blue-100' : ''
                }`}
              >
                <Package className="h-4 w-4" />
                <span>All Components</span>
              </button>
              {renderCategoryTree(categoryTree)}
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="bg-white shadow-sm rounded-lg">
            <ul className="divide-y divide-gray-200">
              {filteredComponents.map((component) => (
                <li key={component.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {component.componentName}
                        <span className="ml-2 text-sm text-gray-500">v{component.version}</span>
                      </h3>
                      <p className="mt-1 text-gray-600">{component.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {component.componentType}
                        </span>
                        {component.componentType === 'code' && component.programmingLanguage && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {component.programmingLanguage}
                          </span>
                        )}
                        {component.componentType === 'design' && component.designNotation && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {component.designNotation}
                          </span>
                        )}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {component.componentCategory}
                        </span>
                      </div>
                      {component.keywords && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {component.keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Used {component.usageCount || 0} times</span>
                        <span>Queried {component.queryCount || 0} times</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => incrementUsageCount(component)}
                        className="p-2 text-gray-400 hover:text-gray-500"
                        title="Use Component"
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </button>
                      <Link
                        to={`/components/edit/${component.id}`}
                        className="p-2 text-gray-400 hover:text-gray-500"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(component.id)}
                        className="p-2 text-gray-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}