import React, { useState } from "react";
import { app, firestore } from "./firebase";
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import backgroundImage from "../components/bg.jpg"; // Import your background image

const AddSubjectPage = ({ location }) => {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [categoryInputs, setCategoryInputs] = useState([{ category1: '', category2: '' }]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = location?.state?.navigate;

  const auth = getAuth(app);
  const uid = auth.currentUser ? auth.currentUser.uid : null;

  const handleAddSubject = async () => {
    if (!newSubjectName || categoryInputs.some(input => !input.category1 || !input.category2)) {
      setError('Subject or category details are incomplete.');
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }

    // Validate percentage inputs
    const totalPercentage = categoryInputs.reduce((total, input) => total + parseInt(input.category2), 0);
    if (totalPercentage !== 100) {
      setError('Total percentage must be 100%.');
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }

    try {
      // Check if a subject with a similar name already exists
      const subjectsCollection = collection(firestore, 'subjects');
      const subjectQuery = query(subjectsCollection, where("uid", "==", uid));
      const subjectSnapshot = await getDocs(subjectQuery);
      const existingSubject = subjectSnapshot.docs.find(doc => doc.data().subjectName.toLowerCase() === newSubjectName.toLowerCase());
      if (existingSubject) {
        setError('Subject with a similar name already exists.');
        setTimeout(() => {
          setError('');
        }, 3000);
        return;
      }

      // If no subject with a similar name exists and percentage is valid, add the new subject
      const categoriesWithIds = categoryInputs.map((input, index) => ({
        categoryId: Date.now().toString() + index, // Generating unique category ID
        ...input
      }));
      
      const docRef = await addDoc(subjectsCollection, { uid, subjectName: newSubjectName, categories: categoriesWithIds });
      setSuccessMessage('Subject successfully added!');
      if (navigate) {
        navigate("/");
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error adding subject:', error.message);
      setError('Failed to add subject. Please try again.');
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  const handleAddCategoryInput = () => {
    setCategoryInputs([...categoryInputs, { category1: '', category2: '' }]);
  };

  const handleCategoryInputChange = (index, fieldName, value) => {
    const updatedInputs = [...categoryInputs];
    updatedInputs[index][fieldName] = value;
    setCategoryInputs(updatedInputs);
  };

  const handleRemoveCategoryInput = (index) => {
    const updatedInputs = [...categoryInputs];
    updatedInputs.splice(index, 1);
    setCategoryInputs(updatedInputs);
  };

  return (
    <div
      className='flex flex-col items-center justify-center min-h-screen'
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' }}
    >
      <div style={styles.container}>
        <h1 style={styles.heading}>Add Subject</h1>
        <input
          type="text"
          placeholder="Subject Name"
          value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)}
          style={styles.input}
        />
        {categoryInputs.map((input, index) => (
          <div key={index} style={styles.categoryInputContainer}>
            <input
              type="text"
              placeholder="Category"
              value={input.category1}
              onChange={(e) => handleCategoryInputChange(index, 'category1', e.target.value)}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Percentage"
              value={input.category2}
              onChange={(e) => handleCategoryInputChange(index, 'category2', e.target.value)}
              style={styles.input}
            />
            <button onClick={() => handleRemoveCategoryInput(index)} style={styles.removeButton}>Remove</button>
          </div>
        ))}
        <div style={styles.buttonContainer}>
          <button onClick={handleAddCategoryInput} style={{ ...styles.addButton, marginRight: '10px' }}>Add Category</button>
          <button onClick={handleAddSubject} style={styles.addButton}>Add Subject</button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        {successMessage && <p style={styles.success}>{successMessage}</p>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '600px',
    margin: '0 auto',
  },
  heading: {
    color: '#333',
    fontSize: '32px',
    marginBottom: '30px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  input: {
    marginBottom: '20px',
    marginTop: '20px',
    width: '100%',
    padding: '12px',
    boxSizing: 'border-box',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  addButton: {
    backgroundColor: '#00c3e3',
    color: '#fff',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '20px',
    boxShadow: '0 0 15px rgba(0, 195, 227, 0.4)',
    transition: 'background-color 0.3s ease',
  },
  removeButton: {
    backgroundColor: '#FF6347',
    color: '#fff',
    border: 'none',
    padding: '12px 26px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginLeft: '10px',
    boxShadow: '0 0 15px rgba(255, 99, 71, 0.4)',
    transition: 'background-color 0.3s ease',
  },
  error: {
    color: 'red',
    marginTop: '20px',
    },
    success: {
    color: 'green',
    marginTop: '20px',
    },
    categoryInputContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '5px',
    },
    buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    marginTop: '20px',
    },
    };
    
    export default AddSubjectPage;