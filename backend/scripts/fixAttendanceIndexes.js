// This script will fix the attendance indexes in the database
// Run this script once to fix the issue

const mongoose = require('mongoose');
const config = require('../config/config');

// Connect to MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function() {
  console.log('Connected to MongoDB');
  
  try {
    // Get the attendances collection
    const attendanceCollection = db.collection('attendances');
    
    // List all indexes
    const indexes = await attendanceCollection.indexes();
    console.log('Current indexes:', indexes);
    
    // Drop the problematic index if it exists
    try {
      await attendanceCollection.dropIndex('course_1_date_1');
      console.log('Successfully dropped the problematic index: course_1_date_1');
    } catch (error) {
      if (error.code === 27) {
        console.log('Index course_1_date_1 does not exist, skipping...');
      } else {
        console.error('Error dropping index:', error);
      }
    }
    
    // Create the correct compound index
    try {
      await attendanceCollection.createIndex(
        { course: 1, student: 1, date: 1 },
        { unique: true }
      );
      console.log('Successfully created the correct compound index');
    } catch (error) {
      console.error('Error creating index:', error);
    }
    
    // Check for and fix any records without a student field
    const invalidRecords = await attendanceCollection.find({
      student: { $exists: false }
    }).toArray();
    
    console.log(`Found ${invalidRecords.length} invalid records without student field`);
    
    if (invalidRecords.length > 0) {
      for (const record of invalidRecords) {
        console.log('Deleting invalid record:', record._id);
        await attendanceCollection.deleteOne({ _id: record._id });
      }
      console.log(`Deleted ${invalidRecords.length} invalid records`);
    }
    
    // List indexes after changes
    const updatedIndexes = await attendanceCollection.indexes();
    console.log('Updated indexes:', updatedIndexes);
    
    console.log('Index fix completed successfully');
  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    mongoose.disconnect();
  }
}); 