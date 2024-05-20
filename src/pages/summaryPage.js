import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { firestore } from "./firebase";
import { calculateGrade } from '../pages/calculateGrade';
import backgroundImage from '../components/bg.jpg'; 
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SummaryPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const uid = currentUser ? currentUser.uid : null;

      if (uid) {
        const subjectsCollection = collection(firestore, 'subjects');
        const subjectsQuery = query(subjectsCollection, where("uid", "==", uid));
        const snapshot = await getDocs(subjectsQuery);
        const subjectDocs = snapshot.docs;

        const subjectPromises = subjectDocs.map(async doc => {
          const subjectData = doc.data();
          const categories = subjectData.categories;

          const categoryRecordsPromises = categories.map(async category => {
            const recordsCollection = collection(firestore, 'categoryRecords');
            const recordsQuery = query(recordsCollection, where("categoryId", "==", category.categoryId));
            const recordsSnapshot = await getDocs(recordsQuery);
            const recordsData = recordsSnapshot.docs.map(doc => doc.data());
            return { category: category.category1, records: recordsData };
          });

          const categoryRecords = await Promise.all(categoryRecordsPromises);

          const grade = calculateGrade(categoryRecords.flatMap(record => record.records), categories);

          return {
            subjectName: subjectData.subjectName.toUpperCase(), // Convert to uppercase
            grade: grade
          };
        });

        const gradesData = await Promise.all(subjectPromises);
        setGrades(gradesData);
      }
    } catch (error) {
      console.error("Error fetching grades:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for the chart
  const chartData = {
    labels: grades.map(gradeData => gradeData.subjectName),
    datasets: [
      {
        label: 'Grades',
        data: grades.map(gradeData => gradeData.grade),
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white' 
        }
      },
      title: {
        display: true,
        text: 'Grades From All Subjects',
        color: 'white', 
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white', 
          autoSkip: false,
          maxRotation: 0, 
          minRotation: 0, 
          callback: function(value) {
            return this.getLabelForValue(value).substring(0, 10); 
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)' 
        }
      },
      y: {
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)' 
        }
      }
    },
    layout: {
      padding: {
        bottom: 50 
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen" style={{ position: 'relative' }}>
      <div className="bg-blur" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(5px)' }}></div>
      <div className="container mx-auto px-4 py-8" style={{
        backgroundColor: '#4682B4', 
        padding: '20px',
        borderRadius: '20px',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
        width: '90%', 
        height: '80%', 
        zIndex: 1, // Ensure the container is above the blurred background
        overflow: 'hidden' // Ensure the graph does not overflow the container
      }}>
        <h1 className="text-3xl font-bold text-white mb-4">Summary</h1>
        {loading && <div className="text-white">Loading...</div>}
        {!loading && <div style={{ height: '100%' }}><Bar data={chartData} options={chartOptions} /></div>}
      </div>
    </div>
  );
};

export default SummaryPage;
