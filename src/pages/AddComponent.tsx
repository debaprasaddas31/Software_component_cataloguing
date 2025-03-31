import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, componentStorageName } from '../lib/firebase';
import { collection, addDoc, getDoc, doc, updateDoc } from 'firebase/firestore';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { php } from '@codemirror/lang-php';
import { python } from '@codemirror/lang-python';
import { xml } from '@codemirror/lang-xml';
import { swift } from '@codemirror/legacy-modes/mode/swift';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import { rust } from '@codemirror/legacy-modes/mode/rust';
import { Extension } from '@codemirror/state';
import { X } from 'lucide-react';

interface Component {
  id?: string;
  componentName: string;
  componentType: string;
  programmingLanguage: string;
  codeBlock: string;
  componentCategory: string;
  description: string;
  keywords: string[];
  designNotation?: string;
  usageCount: number;
  queryCount: number;
  timestamp: Date;
  createdBy: string;
  status: 'active' | 'archived';
  version: string;
  dependencies: string[];
  parentCategory?: string;
  designFile?: string | null;
}

export function AddComponent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { componentId } = useParams();
  const formRef = useRef<HTMLFormElement>(null);

  const [loading, setLoading] = useState(false);
  const [componentName, setComponentName] = useState('');
  const [componentType, setComponentType] = useState('code');
  const [programmingLanguage, setProgrammingLanguage] = useState('none');
  const [designNotation, setDesignNotation] = useState('none');
  const [codeBlock, setCodeBlock] = useState('');
  const [componentCategory, setComponentCategory] = useState('none');
  const [languageCompiler, setLanguageCompiler] = useState<Extension>(json);
  const [designFile, setDesignFile] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [newDependency, setNewDependency] = useState('');
  const [parentCategory, setParentCategory] = useState('');

  useEffect(() => {
    if (componentId) {
      fetchComponentData();
    }
  }, [componentId]);

  useEffect(() => {
    switch (programmingLanguage) {
      case 'java':
        setLanguageCompiler(java);
        break;
      case 'cpp':
        setLanguageCompiler(cpp);
        break;
      case 'js':
        setLanguageCompiler(javascript);
        break;
      case 'php':
        setLanguageCompiler(php);
        break;
      case 'css':
        setLanguageCompiler(css);
        break;
      case 'html':
        setLanguageCompiler(html);
        break;
      case 'python':
        setLanguageCompiler(python);
        break;
      case 'json':
        setLanguageCompiler(json);
        break;
      case 'xml':
        setLanguageCompiler(xml);
        break;
      case 'swift':
        setLanguageCompiler(swift);
        break;
      case 'ruby':
        setLanguageCompiler(ruby);
        break;
      case 'rust':
        setLanguageCompiler(rust);
        break;
      default:
        setLanguageCompiler(json);
        break;
    }
  }, [programmingLanguage]);

  const fetchComponentData = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, componentStorageName, componentId!);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Component;
        setComponentName(data.componentName);
        setComponentCategory(data.componentCategory);
        setCodeBlock(data.codeBlock || '');
        setComponentType(data.componentType);
        setProgrammingLanguage(data.programmingLanguage || 'none');
        setDesignNotation(data.designNotation || 'none');
        setDesignFile(data.designFile || null);
        setDescription(data.description || '');
        setKeywords(data.keywords || []);
        setVersion(data.version || '1.0.0');
        setDependencies(data.dependencies || []);
        setParentCategory(data.parentCategory || '');
      }
    } catch (error) {
      console.error('Error fetching component:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const componentData: Omit<Component, 'id'> = {
        componentName,
        componentType,
        programmingLanguage,
        designNotation: componentType === 'design' ? designNotation : undefined,
        codeBlock,
        componentCategory,
        description,
        keywords,
        usageCount: 0,
        queryCount: 0,
        timestamp: new Date(),
        createdBy: user.uid,
        status: 'active',
        version,
        dependencies,
        parentCategory: parentCategory || undefined,
        designFile
      };

      if (componentId) {
        await updateDoc(doc(db, componentStorageName, componentId), componentData);
      } else {
        await addDoc(collection(db, componentStorageName), componentData);
      }

      navigate('/components');
    } catch (error) {
      console.error('Error saving component:', error);
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const addDependency = () => {
    if (newDependency && !dependencies.includes(newDependency)) {
      setDependencies([...dependencies, newDependency]);
      setNewDependency('');
    }
  };

  const removeDependency = (dependency: string) => {
    setDependencies(dependencies.filter(d => d !== dependency));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        {componentId ? 'Edit Component' : 'Add New Component'}
      </h1>

      <form onSubmit={handleSubmit} ref={formRef} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Component Name</label>
            <input
              type="text"
              required
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Version</label>
            <input
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="1.0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Component Type</label>
            <select
              value={componentType}
              onChange={(e) => setComponentType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="code">Code</option>
              <option value="design">Design</option>
            </select>
          </div>

          {componentType === 'code' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">Programming Language</label>
              <select
                value={programmingLanguage}
                onChange={(e) => setProgrammingLanguage(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="none">Select Language</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="js">JavaScript</option>
                <option value="php">PHP</option>
                <option value="python">Python</option>
                <option value="ruby">Ruby</option>
                <option value="swift">Swift</option>
                <option value="rust">Rust</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="xml">XML</option>
                <option value="json">JSON</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">Design Notation</label>
              <select
                value={designNotation}
                onChange={(e) => setDesignNotation(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="none">Select Notation</option>
                <option value="UML">UML</option>
                <option value="ERD">ERD</option>
                <option value="Structured Design">Structured Design</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              required
              value={componentCategory}
              onChange={(e) => setComponentCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Parent Category</label>
            <input
              type="text"
              value={parentCategory}
              onChange={(e) => setParentCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Keywords</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add keyword"
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="ml-2 inline-flex items-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Dependencies</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newDependency}
              onChange={(e) => setNewDependency(e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add dependency"
            />
            <button
              type="button"
              onClick={addDependency}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {dependencies.map((dependency, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {dependency}
                <button
                  type="button"
                  onClick={() => removeDependency(dependency)}
                  className="ml-2 inline-flex items-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {componentType === 'code' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
            <CodeMirror
              value={codeBlock}
              height="400px"
              extensions={[languageCompiler]}
              onChange={(value) => setCodeBlock(value)}
              className="border rounded-md"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700">Design File URL</label>
            <input
              type="text"
              value={designFile || ''}
              onChange={(e) => setDesignFile(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter design file URL"
            />
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/components')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : componentId ? 'Update Component' : 'Add Component'}
          </button>
        </div>
      </form>
    </div>
  );
}