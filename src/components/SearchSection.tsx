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
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <div className="mb-4 space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Last Excel Upload:</span> {files.length > 0 ? files[files.length - 1].uploadDate : 'Not uploaded yet'}
            </p>
            <p className="text-lg font-semibold">
              Total Matches: <span className="text-blue-600">{totalMatches}</span>
            </p>
            {matchesPerTerm.size > 0 && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Matches per keyword:</span>{' '}
                {Array.from(matchesPerTerm.entries()).map(([term, count], index) => (
                  <span key={term}>
                    {index > 0 && ', '}
                    <span className="font-semibold">{term}</span>: {count}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-600">Search Results</h3>
          </div>

          <SearchResults results={results} searchInput={searchInput} />

          {results.length > 0 && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={exportToExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
              <button
                onClick={printResults}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
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