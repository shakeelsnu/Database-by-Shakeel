import React, { useRef } from 'react';
import { FileSpreadsheet, Hash, Calendar, Eye } from 'lucide-react';
import { FileResult } from '../types';

interface SearchResultsProps {
  results: FileResult[];
  searchInput: string;
}

export default function SearchResults({ results, searchInput }: SearchResultsProps) {
  const resultsRef = useRef<HTMLDivElement>(null);

  const jumpToLine = (serialNumber: number, fileName: string) => {
    const targetId = `result-${fileName.replace(/\s/g, '-')}-${serialNumber}`;
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add temporary highlight
      targetElement.classList.add('bg-orange-200');
      setTimeout(() => {
        targetElement.classList.remove('bg-orange-200');
      }, 1500);
    }
  };

  if (!searchInput.trim()) {
    return <p className="text-gray-500">Please type something to search.</p>;
  }

  if (results.length === 0) {
    return <p className="text-gray-500">No matches found.</p>;
  }

  return (
    <div id="search-results" ref={resultsRef} className="space-y-6">
      {results.map((fileResult, fileIndex) => {
        // Get headers from the first match to determine table structure
        const headers = ['S.NO'];
        if (fileResult.matches.length > 0) {
          // Assume headers can be derived from data structure
          for (let i = 0; i < fileResult.matches[0].data.length; i++) {
            headers.push(`Column ${i + 1}`);
          }
        }

        const lineLinks = fileResult.matches.map(match => (
          <button
            key={match.serialNumber}
            onClick={() => jumpToLine(match.serialNumber, fileResult.fileName)}
            className="text-blue-600 hover:text-blue-800 underline text-sm mx-1"
          >
            {match.serialNumber}
          </button>
        ));

        return (
          <div key={fileIndex} className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                <h4 className="text-xl font-bold text-blue-800">
                  {fileResult.fileName}
                </h4>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Total Matches:</span>
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {fileResult.matches.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Quick Jump:</span>
                    <div className="flex flex-wrap gap-1">
                      {lineLinks.slice(0, 5)}
                      {lineLinks.length > 5 && (
                        <span className="text-gray-500 text-xs">+{lineLinks.length - 5} more</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">File Type:</span>
                    <span className="text-green-600 font-medium">Excel Spreadsheet</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-100 to-blue-50">
                    {headers.map((header, index) => (
                      <th key={index} className="border-r border-gray-300 px-6 py-4 text-left font-bold text-blue-900 text-sm uppercase tracking-wide">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fileResult.matches.map((match, matchIndex) => {
                    const uniqueId = `result-${fileResult.fileName.replace(/\s/g, '-')}-${match.serialNumber}`;
                    return (
                      <tr
                        key={matchIndex}
                        id={uniqueId}
                        className="hover:bg-blue-50 transition-all duration-200 border-b border-gray-200 group"
                      >
                        <td className="border-r border-gray-300 px-6 py-4 font-bold text-blue-700 bg-blue-25 group-hover:bg-blue-100 transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                              {match.serialNumber}
                            </span>
                          </div>
                        </td>
                        {match.data.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="border-r border-gray-300 px-6 py-4 text-sm leading-relaxed group-hover:bg-blue-25 transition-colors"
                            dangerouslySetInnerHTML={{ __html: cell }}
                          />
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Showing {fileResult.matches.length} matching records</span>
                <div className="flex gap-4">
                  <span>Search terms highlighted in yellow</span>
                  <span>•</span>
                  <span>Click row numbers to jump between results</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}