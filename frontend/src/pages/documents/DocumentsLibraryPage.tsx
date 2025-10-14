import { useState } from 'react';
import {
  FileText,
  FolderOpen,
  Upload,
  Download,
  Trash2,
  Search,
  Grid,
  List,
  File,
  Image,
  FileSpreadsheet,
  FileArchive,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'xls' | 'img' | 'other';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  folder: string;
}

export default function DocumentsLibraryPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');

  const folders = ['Policies', 'Contracts', 'Reports', 'Templates', 'Training Materials'];

  const documents: Document[] = [
    {
      id: '1',
      name: 'Employee Handbook 2024.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadedBy: 'HR Admin',
      uploadedAt: '2024-10-01',
      folder: 'Policies',
    },
    {
      id: '2',
      name: 'Employment Contract Template.docx',
      type: 'doc',
      size: '156 KB',
      uploadedBy: 'Legal Team',
      uploadedAt: '2024-09-28',
      folder: 'Templates',
    },
    {
      id: '3',
      name: 'Q3 Performance Report.xlsx',
      type: 'xls',
      size: '892 KB',
      uploadedBy: 'John Smith',
      uploadedAt: '2024-10-15',
      folder: 'Reports',
    },
    {
      id: '4',
      name: 'Company Logo.png',
      type: 'img',
      size: '245 KB',
      uploadedBy: 'Marketing',
      uploadedAt: '2024-08-12',
      folder: 'Templates',
    },
    {
      id: '5',
      name: 'Health & Safety Policy.pdf',
      type: 'pdf',
      size: '1.8 MB',
      uploadedBy: 'HR Admin',
      uploadedAt: '2024-09-15',
      folder: 'Policies',
    },
  ];

  const filteredDocuments = documents.filter(
    (doc) =>
      (selectedFolder === 'all' || doc.folder === selectedFolder) &&
      (search === '' || doc.name.toLowerCase().includes(search.toLowerCase()))
  );

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileArchive className="h-8 w-8 text-red-600" />;
      case 'doc':
        return <FileText className="h-8 w-8 text-blue-600" />;
      case 'xls':
        return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
      case 'img':
        return <Image className="h-8 w-8 text-purple-600" />;
      default:
        return <File className="h-8 w-8 text-gray-600" />;
    }
  };

  const handleUpload = () => {
    toast.success('File upload functionality - Coming soon!');
  };

  const handleDownload = (name: string) => {
    toast.success(`Downloading ${name}...`);
  };

  const handleDelete = (name: string) => {
    toast.success(`Deleting ${name}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents Library</h1>
          <p className="text-gray-600 mt-1">Centralized document management</p>
        </div>
        <Button onClick={handleUpload}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Folders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{folders.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">5.5 MB</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shared</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Folders</option>
              {folders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button
                variant={view === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex justify-center mb-3">{getFileIcon(doc.type)}</div>
                  <p className="font-medium text-gray-900 text-sm mb-1 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-600">{doc.size}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    by {doc.uploadedBy}
                    <br />
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload(doc.name)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(doc.name)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(doc.type)}
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-600">
                        {doc.size} • Uploaded by {doc.uploadedBy} on {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(doc.name)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(doc.name)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
