import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

interface Mark {
  subject: string;
  score: number;
}

interface StudentData {
  name: string;
  email: string;
  marks: Mark[];
}

const API_URL = process.env.REACT_APP_API_URL || 'https://student-management-cw5w.onrender.com/api';

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StudentData>({
    name: '',
    email: '',
    marks: [{ subject: '', score: 0 }]
  });
 
  useEffect(() => {
    if (id) {
      fetchStudent();
    }
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/students/${id}`);
      setFormData(response.data);
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to fetch student data', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => { 
    if (!formData.name.trim() || !formData.email.trim()) {
      Swal.fire('Error', 'Name and email are required', 'error');
      return false;
    }
 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire('Error', 'Please enter a valid email address', 'error');
      return false;
    }

  
    for (const mark of formData.marks) {
      if (!mark.subject.trim()) {
        Swal.fire('Error', 'Subject name is required for all marks', 'error');
        return false;
      }
      if (mark.score < 0 || mark.score > 100) {
        Swal.fire('Error', 'Scores must be between 0 and 100', 'error');
        return false;
      }
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMarkChange = (index: number, field: keyof Mark, value: string) => {
    const updatedMarks = [...formData.marks];
    if (field === 'score') {
      // Handle empty input or parse the number
      let numValue: number;
      
      // Check if the input is just a minus sign or empty
      if (value === '' || value === '-') {
        numValue = 0;
      } else {
        // Ensure we have a valid number by removing non-numeric characters except digits
        // This will prevent NaN by filtering out invalid characters
        const cleanValue = value.replace(/[^0-9]/g, '');
        numValue = cleanValue === '' ? 0 : Number(cleanValue);
      }
      
      // Validate the range
      if (numValue < 0) numValue = 0; // Convert negative to 0
      if (numValue > 100) numValue = 100; // Cap at 100
      
      updatedMarks[index] = {
        ...updatedMarks[index],
        [field]: numValue
      };
    } else {
      updatedMarks[index] = {
        ...updatedMarks[index],
        [field]: value
      };
    }
    setFormData({ ...formData, marks: updatedMarks });
  };

  const addMark = () => {
    setFormData({
      ...formData,
      marks: [...formData.marks, { subject: '', score: 0 }]
    });
  };

  const removeMark = (index: number) => {
    const updatedMarks = formData.marks.filter((_, i) => i !== index);
    setFormData({ ...formData, marks: updatedMarks });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      if (id) {
        await axios.put(`${API_URL}/students/${id}`, formData);
        Swal.fire('Success', 'Student updated successfully', 'success');
      } else {
        await axios.post(`${API_URL}/students`, formData);
        Swal.fire('Success', 'Student added successfully', 'success');
      }
      navigate('/');
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save student data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title mb-4">{id ? 'Edit Student' : 'Add New Student'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Marks</label>
            {formData.marks.map((mark, index) => (
              <div key={index} className="row mb-2">
                <div className="col">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Subject"
                    value={mark.subject}
                    onChange={(e) => handleMarkChange(index, 'subject', e.target.value)}
                    required
                  />
                </div>
                <div className="col">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="form-control"
                    placeholder="Score (0-100)"
                    min="0"
                    max="100"
                    value={mark.score === 0 ? '' : mark.score}
                    onChange={(e) => handleMarkChange(index, 'score', e.target.value)}
                    required
                  />
                </div>
                <div className="col-auto">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeMark(index)}
                    disabled={formData.marks.length === 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary mt-2"
              onClick={addMark}
            >
              Add Mark
            </button>
          </div>

          <div className="mt-4">
            <button 
              type="submit" 
              className="btn btn-primary me-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {id ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                id ? 'Update' : 'Submit'
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;