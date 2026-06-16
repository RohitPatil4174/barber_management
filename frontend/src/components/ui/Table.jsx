import React from 'react';

export const Table = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      {children}
    </table>
  </div>
);

export const Thead = ({ children }) => (
  <thead className="bg-surface border-b border-white/10 text-muted uppercase text-sm">
    {children}
  </thead>
);

export const Tbody = ({ children }) => (
  <tbody className="divide-y divide-white/5">
    {children}
  </tbody>
);

export const Tr = ({ children, className = '' }) => (
  <tr className={`hover:bg-white/5 transition-colors ${className}`}>
    {children}
  </tr>
);

export const Th = ({ children, className = '' }) => (
  <th className={`px-6 py-4 font-medium ${className}`}>
    {children}
  </th>
);

export const Td = ({ children, className = '' }) => (
  <td className={`px-6 py-4 ${className}`}>
    {children}
  </td>
);
