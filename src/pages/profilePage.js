import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { app, firestore } from "./firebase";
import { collection, getDocs, addDoc, query, where, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faList, faEdit, faTrashAlt, faBook } from '@fortawesome/free-solid-svg-icons';
import backgroundImage from "../components/bg.jpg";
import { calculateGrade } from '../pages/calculateGrade';

const ProfilePage = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const auth = getAuth(app);
  const currentUser = auth.currentUser;
  const uid = currentUser ? currentUser.uid : null;

  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.displayName || "User");
    } else {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };
  

  const [subjects, setSubjects] = useState([]);
  const [loading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [clickedCategory, setClickedCategory] = useState(null);
  const [recordInputs, setRecordInputs] = useState({ name: '', item: '', score: '' });
  const [viewRecordsCategory, setViewRecordsCategory] = useState(null);
  const [categoryRecords, setCategoryRecords] = useState([]);
  const [showViewGradePopup, setShowViewGradePopup] = useState(false);
  const [selectedSubjectGrade, setSelectedSubjectGrade] = useState(null);
  const [editRecordId, setEditRecordId] = useState(null);
  const [editRecordInputs, setEditRecordInputs] = useState({ name: '', item: '', score: '' });
  const [editSuccessMessage, setEditSuccessMessage] = useState('');



  useEffect(() => {
    fetchDataFromServer();
  },
);

  const fetchDataFromServer = async () => {
    try {
      const subjectsCollection = collection(firestore, 'subjects');
      const subjectsQuery = query(subjectsCollection, where("uid", "==", uid));
      const snapshot = await getDocs(subjectsQuery);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };
  

  const handleRemoveSubject = (id) => {
    setShowRemoveConfirmation(true);
    setSubjectToDelete(id);
  };

  const confirmRemoveSubject = async () => {
    try {
      await deleteDoc(doc(firestore, 'subjects', subjectToDelete));
      const updatedSubjects = subjects.filter(subject => subject.id !== subjectToDelete);
      setSubjects(updatedSubjects);
      setSuccessMessage('Subject successfully removed!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error removing subject:', error.message);
      setError('Failed to remove subject. Please try again.');
    } finally {
      setSubjectToDelete(null);
      setShowRemoveConfirmation(false);
    }
  };

  const cancelRemoveSubject = () => {
    setSubjectToDelete(null);
    setShowRemoveConfirmation(false);
  };

  const handleAddRecord = async (categoryId, categoryName) => {
    setClickedCategory(categoryId);
    setShowPopup(true);
  };

  const handleViewRecords = async (categoryId) => {
    try {
      const recordsCollection = collection(firestore, 'categoryRecords');
      const recordsQuery = query(recordsCollection, where("categoryId", "==", categoryId));
      const snapshot = await getDocs(recordsQuery);
      const recordsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategoryRecords(recordsData);
      setViewRecordsCategory(categoryId);
    } catch (error) {
      console.error("Error fetching records:", error.message);
    }
  };



  const handleViewGrade = async (subjectId) => {
    try {
      const subject = subjects.find(sub => sub.id === subjectId);
      if (subject) {
        const categories = subject.categories;
        const recordsCollection = collection(firestore, 'categoryRecords');
        const recordsQuery = query(recordsCollection, where("categoryId", "in", categories.map(cat => cat.categoryId)));
        const snapshot = await getDocs(recordsQuery);
        const records = snapshot.docs.map(doc => doc.data());
        const finalGrade = calculateGrade(records, categories);
        setSelectedSubjectGrade({ subjectName: subject.subjectName, grade: finalGrade });
      }
    } catch (error) {
      console.error("Error calculating grade:", error.message);
    }
    setShowViewGradePopup(true);
  };

  const handleAddRecordSubmit = async () => {
    try {
      const recordCollectionRef = collection(firestore, 'categoryRecords');
      const newRecord = {
        categoryId: clickedCategory,
        name: recordInputs.name,
        item: recordInputs.item,
        score: recordInputs.score
      };

      const docRef = await addDoc(recordCollectionRef, newRecord);
      console.log("Document written with ID: ", docRef.id);

      setShowPopup(false);
      setRecordInputs({ name: '', item: '', score: '' });

      setSuccessMessage('Record successfully added!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error adding record:', error.message);
      setError('Failed to add record. Please try again.');
    }
  };

  const handleEditRecord = (recordId, recordName, recordItem, recordScore) => {
    setEditRecordId(recordId);
    setEditRecordInputs({ name: recordName, item: recordItem, score: recordScore });
  };
  
  const handleEditRecordSubmit = async () => {
    try {
      const recordDocRef = doc(firestore, 'categoryRecords', editRecordId);
      await updateDoc(recordDocRef, {
        name: editRecordInputs.name,
        item: editRecordInputs.item,
        score: editRecordInputs.score
      });
  
      // Update the local state with the edited record
      const updatedRecords = categoryRecords.map(record => {
        if (record.id === editRecordId) {
          return {
            ...record,
            name: editRecordInputs.name,
            item: editRecordInputs.item,
            score: editRecordInputs.score
          };
        } else {
          return record;
        }
      });
  
      setCategoryRecords(updatedRecords);
  
      setEditSuccessMessage('Record successfully updated!');
      setTimeout(() => {
        setEditSuccessMessage('');
      }, 2000);
  
      // Close the edit form
      setEditRecordId(null);
      console.log('Record successfully updated!');
    } catch (error) {
      console.error('Error updating record:', error.message);
      setError('Failed to update record. Please try again.');
      
    }
  };
  
  
  const handleDeleteRecord = async (recordId) => {
    try {
      await deleteDoc(doc(firestore, 'categoryRecords', recordId));
      const updatedRecords = categoryRecords.filter(record => record.id !== recordId);
      setCategoryRecords(updatedRecords);
      setSuccessMessage('Record successfully deleted!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error deleting record:', error.message);
      setError('Failed to delete record. Please try again.');
    }
  };

return (
  <div
    className='flex flex-col items-center justify-center min-h-screen'
    style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' }}
  >
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex justify-between items-center w-full px-4 mb-6">
        <p className="text-3xl mt-10" style={{ fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: 'white', textShadow: '4px 4px 4px rgba(0,0,0,0.5)' }}>Hi, {userName}!</p>
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout
        </button>
      </div>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerText}>EduStat</h1>
          <div className="flex items-center">
            <Link to="/summary" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-center text-xl shadow mr-2">
              <FontAwesomeIcon icon={faBook} className="mr-2" /> Summary
            </Link>
            <Link to="/addsubject" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-center text-xl shadow">
              +
            </Link>
          </div>
        </div>

        <div style={styles.subjectsContainer}>
          {loading && <div>Loading...</div>}

          {subjects.map((subject, index) => (
            <div key={index} style={{ ...styles.subjectContainer, marginLeft: index % 4 === 0 ? 0 : 20 }}>
              <div style={styles.subjectData}>
                <p style={styles.subjectDataText}>{subject.subjectName}</p>
                <div style={styles.contentContainer}>
                  {subject.categories.map((category, subIndex) => (
                    <div key={subIndex} style={styles.noteStyle}>
                      <div onClick={() => handleAddRecord(category.categoryId, category.category1)} style={styles.categoryClickable}>
                        <p style={styles.categoryText}>{`${category.category1}`}</p>
                        <p style={styles.percentageText}>{`Percentage: ${category.category2}%`}</p>
                      </div>
                      <button
                        onClick={() => handleViewRecords(category.categoryId)}
                        style={{
                          ...styles.actionButton,
                          color: '#0077cc',
                        }}
                      >
                        <FontAwesomeIcon icon={faList} style={styles.actionButtonIcon} /> View Records
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div style={styles.buttonContainer}>
                <button onClick={() => handleRemoveSubject(subject.id)} style={styles.removeButton}>Remove</button>
                <button onClick={() => handleViewGrade(subject.id)} style={styles.viewGradeButton}>View Grade</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPopup && (
        <div className="popup" style={styles.popup}>
          <div className="popup-content" style={styles.popupContent}>
            <h2>Add Record</h2>
            <input
              type="text"
              placeholder="Name"
              value={recordInputs.name}
              onChange={(e) => setRecordInputs({ ...recordInputs, name: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Item"
              value={recordInputs.item}
              onChange={(e) => setRecordInputs({ ...recordInputs, item: e.target.value })}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Score"
              value={recordInputs.score}
              onChange={(e) => setRecordInputs({ ...recordInputs, score: e.target.value })}
              style={styles.input}
            />
              <button onClick={handleAddRecordSubmit} style={{ ...styles.addButton, marginRight: '10px' }}>Add Record</button>
              <button onClick={() => setShowPopup(false)} style={styles.cancelButton}>Cancel</button>

          </div>
        </div>
      )}
      {editRecordId && (
        <div className="popup" style={{ ...styles.popup, zIndex: 3 }}>
          <div className="popup-content" style={styles.popupContent}>
            {editSuccessMessage && (
              <div className="bg-green-600 text-white px-4 py-2 rounded-md mb-4">
                {editSuccessMessage}
              </div>
            )}
            <h2>Edit Record</h2>
            <input
              type="text"
              placeholder="Name"
              value={editRecordInputs.name}
              onChange={(e) => setEditRecordInputs({ ...editRecordInputs, name: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Item"
              value={editRecordInputs.item}
              onChange={(e) => setEditRecordInputs({ ...editRecordInputs, item: e.target.value })}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Score"
              value={editRecordInputs.score}
              onChange={(e) => setEditRecordInputs({ ...editRecordInputs, score: e.target.value })}
              style={styles.input}
            />
              <button onClick={handleEditRecordSubmit} style={{ ...styles.addButton, marginRight: '10px' }}>Update Record</button>
              <button onClick={() => setEditRecordId(null)} style={styles.cancelButton}>Cancel</button>

          </div>
        </div>
      )}


      {showViewGradePopup && selectedSubjectGrade && (
        <div className="popup" style={styles.popup}>
          <div className="popup-content" style={styles.popupContent}>
            <h2 className="font-bold text-2xl mb-4">View Grade</h2>
            <div style={styles.noteStyle}>
              <p>{`Subject: ${selectedSubjectGrade.subjectName}`}</p>
              <p>{`Grade: ${selectedSubjectGrade.grade.toFixed(2)}%`}</p>
            </div>
            <button onClick={() => setShowViewGradePopup(false)} style={styles.cancelButton}>Close</button>
          </div>
        </div>
      )}

      {showRemoveConfirmation && (
        <div className="popup" style={styles.popup}>
          <div className="popup-content" style={styles.popupContent}>
            <h2>Confirmation</h2>
            <p>Are you sure you want to remove this subject?</p>
            <button onClick={confirmRemoveSubject} style={{ ...styles.addButton, marginRight: '10px' }}>Yes</button>
            <button onClick={cancelRemoveSubject} style={styles.cancelButton}>No</button>

          </div>
        </div>
      )}

      {viewRecordsCategory && (
        <div className="popup" style={{ ...styles.popup, zIndex: 2 }}>
          <div className="popup-content" style={styles.popupContent}>
            <h2 className="font-bold text-2xl">Records</h2>
            {categoryRecords.length === 0 ? (
              <p>No records found</p>
            ) : (
              categoryRecords.map((record, index) => (
                <div key={index}>
                  <p>Name: {record.name}</p>
                  <p>Item: {record.item}</p>
                  <p>Score: {record.score}</p>
                  <div style={styles.actionButtonContainer}>
                  <button onClick={() => handleEditRecord(record.id)} style={{ ...styles.editButton, marginRight: '10px' }}>
                    <FontAwesomeIcon icon={faEdit} style={styles.actionButtonIcon} /> Edit</button>
                  <button onClick={() => handleDeleteRecord(record.id)} style={styles.deleteButton}>
                    <FontAwesomeIcon icon={faTrashAlt} style={styles.actionButtonIcon} /> Delete
                    </button>
                  </div>
                  {index !== categoryRecords.length - 1 && <hr style={styles.separator} />}
                </div>
              ))
            )}
            <button onClick={() => setViewRecordsCategory(null)} style={styles.cancelButton}>Close</button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-4 py-2 rounded-md">
          {successMessage}
        </div>
      )}


      {error && (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  </div>
);
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Reduced opacity
    paddingBottom: 100,
    paddingLeft: 20,
    paddingRight: 20,
    minWidth: 1350,
    borderRadius: 20,
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottom: '1px solid #ccc',
  },
  headerText: {
    fontSize: 35, // Increased font size to 36 pixels
    fontWeight: 'bold',
    color: '#071952',
    letterSpacing: 1,
  },
  subjectsContainer: {
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
    borderRadius: 30,
    padding: 10,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  subjectContainer: {
    marginBottom: 20,
    width: 'calc(25% - 20px)',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
    border: '1px solid #ccc',
  },
  subjectData: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  subjectDataText: {
    backgroundColor: '#38b6f1',
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    minWidth: 150,
    margin: '0 auto',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  noteStyle: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    height: '80px',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  percentageText: {
    fontSize: 14,
  },
  popup: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popupContent: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    width: '300px',
  },
  input: {
    marginBottom: '10px',
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  addButton: {
    backgroundColor: '#00c3e3',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
  },

  cancelButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '5px',
    marginBottom: '10px',
  },
  removeButton: {
    color: 'black',
    textDecoration: 'underline',
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'color 0.3s',
  },
  viewGradeButton: {
    color: 'black',
    textDecoration: 'underline',
    cursor: 'pointer',
    transition: 'color 0.3s',
  },
  removeButtonHover: {
    color: 'red',
  },
  viewGradeButtonHover: {
    color: 'green',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    margin: '10px 0',
  },

  editButton: {
    backgroundColor: '#0077cc',
    color: 'white',
    padding: '5px 10px',
    borderRadius: 5,
    border: 'none',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '5px  10px',
    borderRadius: 5,
    border: 'none',
    cursor: 'pointer',
  },
};
export default ProfilePage;