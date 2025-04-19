import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

interface Student {
  id: number;
  name: string;
  email: string;
  marks: {
    subject: string;
    score: number;
  }[];
}

const API_URL = process.env.REACT_APP_API_URL || 'https://student-management-cw5w.onrender.com/api';

const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const limit = 10;

  const fetchStudents = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/students?page=${page}&limit=${limit}`);
      setStudents(response.data.students);
      setTotalPages(Math.ceil(response.data.total / limit));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch students';
      setError(errorMessage);
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(currentPage);
  }, [currentPage]);

  const handleDelete = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await axios.delete(`${API_URL}/students/${id}`);
        Swal.fire('Deleted!', 'Student has been deleted.', 'success');
        // If we're on the last page and delete the last item, go to previous page
        if (students.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          fetchStudents(currentPage);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete student';
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const showStudentDetails = (student: Student) => {
    const marksList = student.marks
      .map(mark => `${mark.subject}: ${mark.score}`)
      .join('\n');

    Swal.fire({
      title: `${student.name}'s Details`,
      html: `
        <div class="text-start">
          <p><strong>Email:</strong> ${student.email}</p>
          <p><strong>Marks:</strong></p>
          <pre class="text-start">${marksList}</pre>
        </div>
      `,
      icon: 'info'
    });
  };

  if (loading && students.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Students List</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/add')}
        >
          Add New Student
        </button>
      </div>

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>
                      <button 
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={() => showStudentDetails(student)}
                      >
                        {student.name}
                      </button>
                    </td>
                    <td>{student.email}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => navigate(`/edit/${student.id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(student.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav aria-label="Student list pagination">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li
                    key={page}
                    className={`page-item ${currentPage === page ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default StudentList;