import React, { useRef } from 'react';
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
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-blue-600">
                File: {fileResult.fileName} ({fileResult.matches.length} matches)
              </h4>
              <div className="text-sm text-gray-600">
                Jump to: {lineLinks}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    {headers.map((header, index) => (
                      <th key={index} className="bg-blue-100 border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">
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
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="border border-gray-300 px-4 py-3 font-medium">{match.serialNumber}</td>
                        {match.data.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="border border-gray-300 px-4 py-3"
                            dangerouslySetInnerHTML={{ __html: cell }}
                          />
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}