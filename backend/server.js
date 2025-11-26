const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_results';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Simplified Student Schema (NO pre-save hook)
const studentSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  maths: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  english: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  physics: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  biology: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  chemistry: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  history: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  total: {
    type: Number,
    default: 0
  },
  average: {
    type: Number,
    default: 0
  },
  grade: {
    type: String,
    default: 'F'
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

// Helper function to calculate grade
function calculateGrade(average) {
  if (average >= 90) return "A+";
  if (average >= 85) return "A";
  if (average >= 80) return "A-";
  if (average >= 75) return "B+";
  if (average >= 70) return "B";
  if (average >= 65) return "B-";
  if (average >= 60) return "C+";
  if (average >= 55) return "C";
  if (average >= 50) return "C-";
  if (average >= 45) return "D";
  return "F";
}

// Routes

// Get all students with ranking
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ total: -1 });
    
    const studentsWithRanks = students.map((student, index) => ({
      ...student.toObject(),
      rank: index + 1
    }));
    
    res.json({
      message: 'success',
      data: studentsWithRanks
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Create new student - SIMPLIFIED
app.post('/api/students', async (req, res) => {
  try {
    console.log('Received data:', req.body);
    
    const { first_name, last_name, maths, english, physics, biology, chemistry, history } = req.body;
    
    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Calculate scores
    const scores = {
      maths: parseInt(maths) || 0,
      english: parseInt(english) || 0,
      physics: parseInt(physics) || 0,
      biology: parseInt(biology) || 0,
      chemistry: parseInt(chemistry) || 0,
      history: parseInt(history) || 0
    };

    // Validate scores are within range
    for (const [subject, score] of Object.entries(scores)) {
      if (score < 0 || score > 100) {
        return res.status(400).json({ error: `${subject} score must be between 0 and 100` });
      }
    }

    // Calculate total and average
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const average = total / 6;
    const grade = calculateGrade(average);

    // Create student object
    const studentData = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      ...scores,
      total,
      average: parseFloat(average.toFixed(2)),
      grade
    };

    console.log('Creating student with data:', studentData);

    // Save to database
    const student = new Student(studentData);
    const savedStudent = await student.save();
    
    console.log('Student saved successfully:', savedStudent._id);

    res.json({
      message: 'Student added successfully',
      data: savedStudent
    });
    
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { first_name, last_name, maths, english, physics, biology, chemistry, history } = req.body;
    
    // Calculate updated values
    const scores = {
      maths: parseInt(maths) || 0,
      english: parseInt(english) || 0,
      physics: parseInt(physics) || 0,
      biology: parseInt(biology) || 0,
      chemistry: parseInt(chemistry) || 0,
      history: parseInt(history) || 0
    };

    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const average = total / 6;
    const grade = calculateGrade(average);

    const updatedData = {
      first_name,
      last_name,
      ...scores,
      total,
      average: parseFloat(average.toFixed(2)),
      grade
    };

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    
    if (!deletedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({
      message: 'Student deleted successfully',
      data: deletedStudent
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk delete students
app.delete('/api/students', async (req, res) => {
  try {
    const result = await Student.deleteMany({});
    res.json({
      message: 'All students deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting all students:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export results to CSV
app.get('/api/export/csv', async (req, res) => {
  try {
    const students = await Student.find().sort({ total: -1 });
    
    let csv = 'First Name,Last Name,Maths,English,Physics,Biology,Chemistry,History,Total,Average,Grade,Rank\n';
    
    students.forEach((student, index) => {
      csv += `"${student.first_name}","${student.last_name}",${student.maths},${student.english},${student.physics},${student.biology},${student.chemistry},${student.history},${student.total},${student.average.toFixed(2)},"${student.grade}",${index + 1}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=student_results.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const students = await Student.find();
    const totalStudents = students.length;
    
    if (totalStudents === 0) {
      return res.json({
        totalStudents: 0,
        averageTotal: 0,
        highestScore: 0,
        lowestScore: 0,
        gradeDistribution: {}
      });
    }
    
    const totals = students.map(s => s.total);
    const averageTotal = totals.reduce((a, b) => a + b, 0) / totalStudents;
    const highestScore = Math.max(...totals);
    const lowestScore = Math.min(...totals);
    
    const gradeDistribution = students.reduce((acc, student) => {
      acc[student.grade] = (acc[student.grade] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      totalStudents,
      averageTotal: averageTotal.toFixed(2),
      highestScore,
      lowestScore,
      gradeDistribution
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access your application at: http://localhost:${PORT}`);
  console.log(`API test endpoint: http://localhost:${PORT}/api/test`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});