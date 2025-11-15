// MutualFundManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import config from './config.js';

const MutualFundManager = () => {
  const [funds, setFunds] = useState([]);
  const [fund, setFund] = useState({
    fundId: '',
    fundName: '',
    category: '',
    riskLevel: '',
    aum: '',
    expenseRatio: '',
    nav: '',
    launchDate: '',
    description: ''
  });
  const [idToFetch, setIdToFetch] = useState('');
  const [fetchedFund, setFetchedFund] = useState(null);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);

  const baseUrl = `${config.url}/fundapi`;

  useEffect(() => {
    fetchAllFunds();
  }, []);

  const fetchAllFunds = async () => {
    try {
      const res = await axios.get(`${baseUrl}/all`);
      setFunds(res.data);
    } catch (error) {
      setMessage('Failed to fetch funds.');
    }
  };

  const handleChange = (e) => {
    setFund({ ...fund, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    // simple validation: fundId and fundName required
    if (!fund.fundId || fund.fundId.toString().trim() === '') {
      setMessage('Please fill out the fundId field.');
      return false;
    }
    if (!fund.fundName || fund.fundName.trim() === '') {
      setMessage('Please fill out the fundName field.');
      return false;
    }
    return true;
  };

  const addFund = async () => {
    if (!validateForm()) return;
    try {
      // convert numeric fields
      const payload = {
        ...fund,
        fundId: Number(fund.fundId),
        aum: fund.aum ? parseFloat(fund.aum) : 0,
        expenseRatio: fund.expenseRatio ? parseFloat(fund.expenseRatio) : 0,
        nav: fund.nav ? parseFloat(fund.nav) : 0
      };
      await axios.post(`${baseUrl}/add`, payload);
      setMessage('Mutual fund added successfully.');
      fetchAllFunds();
      resetForm();
    } catch (error) {
      setMessage('Error adding fund.');
    }
  };

  const updateFund = async () => {
    if (!validateForm()) return;
    try {
      const payload = {
        ...fund,
        fundId: Number(fund.fundId),
        aum: fund.aum ? parseFloat(fund.aum) : 0,
        expenseRatio: fund.expenseRatio ? parseFloat(fund.expenseRatio) : 0,
        nav: fund.nav ? parseFloat(fund.nav) : 0
      };
      await axios.put(`${baseUrl}/update`, payload);
      setMessage('Mutual fund updated successfully.');
      fetchAllFunds();
      resetForm();
    } catch (error) {
      setMessage('Error updating fund.');
    }
  };

  const deleteFund = async (id) => {
    try {
      const res = await axios.delete(`${baseUrl}/delete/${id}`);
      // backend returns a message string; if JSON, adapt accordingly
      setMessage(res.data || 'Deleted successfully.');
      fetchAllFunds();
    } catch (error) {
      setMessage('Error deleting fund.');
    }
  };

  const getFundById = async () => {
    try {
      const res = await axios.get(`${baseUrl}/get/${idToFetch}`);
      setFetchedFund(res.data);
      setMessage('');
    } catch (error) {
      setFetchedFund(null);
      setMessage('Fund not found.');
    }
  };

  const handleEdit = (f) => {
    // map fields — ensure numbers become strings for inputs
    setFund({
      fundId: f.fundId,
      fundName: f.fundName || '',
      category: f.category || '',
      riskLevel: f.riskLevel || '',
      aum: f.aum !== null && f.aum !== undefined ? String(f.aum) : '',
      expenseRatio: f.expenseRatio !== null && f.expenseRatio !== undefined ? String(f.expenseRatio) : '',
      nav: f.nav !== null && f.nav !== undefined ? String(f.nav) : '',
      launchDate: f.launchDate || '',
      description: f.description || ''
    });
    setEditMode(true);
    setMessage(`Editing fund with ID ${f.fundId}`);
  };

  const resetForm = () => {
    setFund({
      fundId: '',
      fundName: '',
      category: '',
      riskLevel: '',
      aum: '',
      expenseRatio: '',
      nav: '',
      launchDate: '',
      description: ''
    });
    setEditMode(false);
  };

  return (
    <div className="student-container">
      {message && (
        <div className={`message-banner ${message.toLowerCase().includes('error') || message.toLowerCase().includes('failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <h2>Mutual Fund Management App</h2>

      <div>
        <h3>{editMode ? 'Edit Fund' : 'Add Fund'}</h3>
        <div className="form-grid">
          <input type="number" name="fundId" placeholder="Fund ID" value={fund.fundId} onChange={handleChange} />
          <input type="text" name="fundName" placeholder="Fund Name" value={fund.fundName} onChange={handleChange} />
          <select name="category" value={fund.category} onChange={handleChange}>
            <option value="">Select Category</option>
            <option value="Equity">Equity</option>
            <option value="Debt">Debt</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Money Market">Money Market</option>
          </select>
          <select name="riskLevel" value={fund.riskLevel} onChange={handleChange}>
            <option value="">Select Risk</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
          <input type="text" name="aum" placeholder="AUM (numbers)" value={fund.aum} onChange={handleChange} />
          <input type="text" name="expenseRatio" placeholder="Expense Ratio (e.g. 0.012)" value={fund.expenseRatio} onChange={handleChange} />
          <input type="text" name="nav" placeholder="NAV" value={fund.nav} onChange={handleChange} />
          <input type="date" name="launchDate" placeholder="Launch Date" value={fund.launchDate} onChange={handleChange} />
          <input type="text" name="description" placeholder="Short description" value={fund.description} onChange={handleChange} />
        </div>

        <div className="btn-group">
          {!editMode ? (
            <button className="btn-blue" onClick={addFund}>Add Fund</button>
          ) : (
            <>
              <button className="btn-green" onClick={updateFund}>Update Fund</button>
              <button className="btn-gray" onClick={resetForm}>Cancel</button>
            </>
          )}
        </div>
      </div>

      <div>
        <h3>Get Fund By ID</h3>
        <input
          type="number"
          value={idToFetch}
          onChange={(e) => setIdToFetch(e.target.value)}
          placeholder="Enter ID"
        />
        <button className="btn-blue" onClick={getFundById}>Fetch</button>

        {fetchedFund && (
          <div>
            <h4>Fund Found:</h4>
            <pre>{JSON.stringify(fetchedFund, null, 2)}</pre>
          </div>
        )}
      </div>

      <div>
        <h3>All Funds</h3>
        {funds.length === 0 ? (
          <p>No funds found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {Object.keys(fund).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {funds.map((f) => (
                  <tr key={f.fundId}>
                    {Object.keys(fund).map((key) => (
                      <td key={key}>{f[key]}</td>
                    ))}
                    <td>
                      <div className="action-buttons">
                        <button className="btn-green" onClick={() => handleEdit(f)}>Edit</button>
                        <button className="btn-red" onClick={() => deleteFund(f.fundId)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default MutualFundManager;
