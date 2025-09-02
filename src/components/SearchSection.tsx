import React, { useState } from 'react';
import { Search, Download, FileText } from 'lucide-react';
import { FileData, FileResult, SearchMatch } from '../types';
import SearchResults from './SearchResults';

interface SearchSectionProps {
  files: FileData[];
}

export default function SearchSection({ files }: SearchSectionProps) {
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState<FileResult[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [matchesPerTerm, setMatchesPerTerm] = useState<Map<string, number>>(new Map());
  const [showResults, setShowResults] = useState(false);

  const performSearch = () => {
    const input = searchInput.trim();
    
    if (!input) {
      setResults([]);
      setTotalMatches(0);
      setMatchesPerTerm(new Map());
      setShowResults(true);
      return;
    }

    if (files.length === 0) {
      setResults([]);
      setTotalMatches(0);
      setMatchesPerTerm(new Map());
      setShowResults(true);
      return;
    }

    const terms = input.split(",").map(term => term.trim().toLowerCase());
    const allResults: FileResult[] = [];
    let totalMatches = 0;
    let serialNumber = 1;
    const matchesPerTerm = new Map<string, number>();

    files.forEach(fileData => {
      const lines = fileData.data.split("\n");
      if (lines.length < 2) return;

      const headers = lines[0].split("\t");
      const fileMatches: SearchMatch[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols = line.split("\t");
        let matched = false;
        const highlightedCols = cols.map(col => {
          let highlighted = col;
          terms.forEach(term => {
            const regex = new RegExp(`(${term})`, "gi");
            if (regex.test(col)) {
              matched = true;
              highlighted = highlighted.replace(regex, `<span class="bg-yellow-300 font-bold">$1</span>`);
              matchesPerTerm.set(term, (matchesPerTerm.get(term) || 0) + 1);
            }
          });
          return highlighted;
        });

        if (matched) {
          fileMatches.push({
            lineNo: i + 1,
            data: highlightedCols,
            serialNumber: serialNumber++
          });
        }
      }

      if (fileMatches.length > 0) {
        allResults.push({
          fileName: fileData.fileName,
          matches: fileMatches
        });
        totalMatches += fileMatches.length;
      }
    });

    setResults(allResults);
    setTotalMatches(totalMatches);
    setMatchesPerTerm(matchesPerTerm);
    setShowResults(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const exportToExcel = () => {
    if (results.length === 0) {
      alert("No results to export.");
      return;
    }

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    results.forEach((fileResult, index) => {
      // Get headers from the first file
      const firstFile = files.find(f => f.fileName === fileResult.fileName);
      if (!firstFile) return;
      
      const lines = firstFile.data.split("\n");
      const headers = ['S.NO', ...lines[0].split("\t")];
      
      // Create worksheet data
      const wsData = [headers];
      fileResult.matches.forEach(match => {
        const rowData = [match.serialNumber, ...match.data.map(cell => 
          cell.replace(/<[^>]*>/g, '') // Remove HTML tags for Excel
        )];
        wsData.push(rowData);
      });
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, `Results ${index + 1}`);
    });

    XLSX.writeFile(wb, "search_results.xlsx");
  };

  const printResults = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;
    
    const content = document.getElementById("search-results")?.innerHTML || '';
    printWindow.document.write(`
      <html>
        <head>
          <title>Search Results</title>
          <style>
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #e0f0ff; font-weight: bold; }
            .highlight { background-color: yellow; font-weight: bold; }
          </style>
        </head>
        <body>
          <h3>Search Results</h3>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search keywords separated by commas..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <button
          onClick={performSearch}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {showResults && (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-6 h-6 text-blue-600" />
              <h3 className="text-2xl font-bold text-blue-800">Search Results</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{totalMatches}</div>
                <div className="text-sm text-gray-600 font-medium">Total Matches Found</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{results.length}</div>
                <div className="text-sm text-gray-600 font-medium">Files with Results</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{files.length}</div>
                <div className="text-sm text-gray-600 font-medium">Total Files Available</div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-4">
              <span className="font-medium">Fleet Data:</span> Pre-loaded system data available for immediate searching
            </p>
            
            {matchesPerTerm.size > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Keyword Breakdown:</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(matchesPerTerm.entries()).map(([term, count]) => (
                    <span key={term} className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      <span className="font-bold">{term}</span>: {count} matches
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <SearchResults results={results} searchInput={searchInput} />

          {results.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="w-full text-lg font-semibold text-gray-800 mb-2">Export Options:</h4>
              <button
                onClick={exportToExcel}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
              <button
                onClick={printResults}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <FileText className="w-4 h-4" />
                Download as PDF
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}