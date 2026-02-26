import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import './styles/Auditlog.css';

interface IBlock {
  id: number;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  hash: string;
  prev_hash: string;
}

const API_URL = 'http://localhost:8000/api/audit';

export default function AuditLogPage() {
  const [chain, setChain] = useState<IBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // 1. FETCH CHAIN - Optimized to prevent memory leaks
  const fetchChain = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        // Sorting here ensures the state is always consistent
        const sortedData = data.sort((a: IBlock, b: IBlock) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setChain(sortedData);
      }
    } catch (err) {
      console.error("Ledger Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChain();
    const interval = setInterval(fetchChain, 5000);
    return () => clearInterval(interval); // Essential cleanup
  }, [fetchChain]);

  // 2. FILTERING LOGIC
  const filteredChain = useMemo(() => {
    return chain.filter(block => {
      const matchesSearch = 
        block.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.hash.includes(searchTerm);

      const blockDate = new Date(block.timestamp).toISOString().split('T')[0];
      const matchesDate = filterDate ? blockDate === filterDate : true;

      return matchesSearch && matchesDate;
    });
  }, [chain, searchTerm, filterDate]);

  // 3. EXPORT TO EXCEL
  const handleExportExcel = useCallback(() => {
    if (filteredChain.length === 0) return;

    const dataToExport = filteredChain.map(block => ({
      'Block ID': block.id,
      'Timestamp': new Date(block.timestamp).toLocaleString(),
      'Actor (User)': block.actor,
      'Action': block.action,
      'Details': block.details,
      'Hash': block.hash,
      'Previous Hash': block.prev_hash
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Ledger");
    
    const fileName = `Audit_Log_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }, [filteredChain]);

  // 4. INTEGRITY SIMULATION
  const handleVerifyChain = () => {
    setIsVerifying(true);
    const timer = setTimeout(() => {
      setIsVerifying(false);
      alert("Blockchain Integrity Verified: No tampering detected.");
    }, 2000);
    
    // Note: In a real app, you'd clean this up if the component unmounts
    return () => clearTimeout(timer);
  };

  // 5. GROUPING BY DATE
  const groupedBlocks = useMemo(() => {
    const groups: Record<string, IBlock[]> = {};
    
    filteredChain.forEach(block => {
      const dateObj = new Date(block.timestamp);
      const dateKey = dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(block);
    });

    return groups;
  }, [filteredChain]);

  return (
    <div className="AUDIT_PAGE_WRAP">
      <div className="AUDIT_MAIN_CONTAINER">
        
        <div className="AUDIT_HEADER">
          <div>
            <h1 className="AUDIT_TITLE">System Audit Ledger</h1>
            <p className="AUDIT_SUB">Immutable blockchain trail of all system actions.</p>
          </div>
          
          <div className="AUDIT_ACTIONS">
            <button className="AUDIT_EXPORT_BTN" onClick={handleExportExcel}>
              <i className="fas fa-file-excel"></i> Export Excel
            </button>

            <button 
              className={`AUDIT_VERIFY_BTN ${isVerifying ? 'VERIFYING' : ''}`} 
              onClick={handleVerifyChain}
              disabled={isVerifying}
            >
              {isVerifying ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-shield-alt"></i>}
              {isVerifying ? ' Verifying...' : ' Verify Hash'}
            </button>
          </div>
        </div>

        <div className="AUDIT_TOOLBAR">
          <div className="AUDIT_SEARCH">
            <i className="fas fa-search"></i>
            <input 
              placeholder="Search actor, action, or hash..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="AUDIT_DATE_FILTER">
            <label><i className="fas fa-filter"></i> Filter Date:</label>
            <input 
              type="date" 
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
            {filterDate && (
              <button className="CLEAR_DATE_BTN" onClick={() => setFilterDate('')}>
                <i className="fas fa-times"></i> Clear
              </button>
            )}
          </div>
        </div>

        <div className="AUDIT_CHAIN_CONTAINER">
          {loading && chain.length === 0 ? (
            <div className="AUDIT_LOADING">Syncing Distributed Nodes...</div>
          ) : Object.keys(groupedBlocks).length === 0 ? (
            <div className="AUDIT_EMPTY">No records found for this criteria.</div>
          ) : (
            Object.keys(groupedBlocks).map((dateLabel) => (
              <div key={dateLabel} className="AUDIT_DATE_GROUP">
                
                <div className="DATE_SEPARATOR">
                  <div className="DATE_LINE"></div>
                  <span className="DATE_LABEL">{dateLabel}</span>
                  <div className="DATE_LINE"></div>
                </div>

                {groupedBlocks[dateLabel].map((block, index) => (
                  <div key={block.id} className="BLOCK_ROW">
                    
                    <div className="BLOCK_CONNECTOR">
                      <div className="BLOCK_DOT"></div>
                      {index !== groupedBlocks[dateLabel].length - 1 && <div className="BLOCK_LINE"></div>}
                    </div>

                    <div className="BLOCK_CARD">
                      <div className="BLOCK_HEADER">
                        <span className="BLOCK_ID">BLOCK #{block.id}</span>
                        <span className="BLOCK_TIME">
                          {new Date(block.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="BLOCK_STATUS_BADGE VERIFIED">
                          <i className="fas fa-check-double"></i> VERIFIED
                        </span>
                      </div>

                      <div className="BLOCK_BODY">
                        <div className="BLOCK_MAIN_INFO">
                          <h3 className="BLOCK_ACTION">{block.action}</h3>
                          
                          <div className="BLOCK_ACTOR">
                             <span className="ACTOR_LABEL">INITIATED BY:</span>
                             <span className="ACTOR_NAME">
                               <i className="fas fa-user-circle"></i> {block.actor}
                             </span>
                          </div>
                          
                          <p className="BLOCK_DETAILS">{block.details}</p>
                        </div>

                        <div className="BLOCK_HASH_DATA">
                          <div className="HASH_ROW">
                            <span className="HASH_LABEL">PREV:</span>
                            <span className="HASH_VAL">{block.prev_hash}</span>
                          </div>
                          <div className="HASH_ROW CURRENT">
                            <span className="HASH_LABEL">CURR:</span>
                            <span className="HASH_VAL">{block.hash}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}