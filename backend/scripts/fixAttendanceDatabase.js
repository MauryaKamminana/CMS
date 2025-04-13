// This script fixes attendance database issues by:
// 1. Removing any problematic indexes
// 2. Creating the correct compound index
// 3. Normalizing all dates to start of day

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
    // Step 1: Check and drop problematic indexes
    const attendanceCollection = db.collection('attendances');
    const indexes = await attendanceCollection.indexes();
    
    console.log('Current indexes:', indexes);
    
    // Find and drop any problematic indexes
    for (const index of indexes) {
      if (
        index.name !== '_id_' && // Don't drop the _id index
        !(
          index.key.course === 1 && 
          index.key.student === 1 && 
          index.key.date === 1
        )
      ) {
        console.log(`Dropping index: ${index.name}`);
        await attendanceCollection.dropIndex(index.name);
      }
    }
    
    // Step 2: Create the correct compound index if it doesn't exist
    const hasCorrectIndex = indexes.some(
      index => 
        index.key.course === 1 && 
        index.key.student === 1 && 
        index.key.date === 1
    );
    
    if (!hasCorrectIndex) {
      console.log('Creating compound index on course, student, and date');
      await attendanceCollection.createIndex(
        { course: 1, student: 1, date: 1 },
        { unique: true }
      );
    }
    
    // Step 3: Normalize all dates to start of day
    console.log('Normalizing attendance dates...');
    
    const attendanceRecords = await attendanceCollection.find({}).toArray();
    console.log(`Found ${attendanceRecords.length} attendance records`);
    
    let normalizedCount = 0;
    
    for (const record of attendanceRecords) {
      const currentDate = new Date(record.date);
      const normalizedDate = new Date(currentDate);
      normalizedDate.setHours(0, 0, 0, 0);
      
      // Only update if the date needs normalization
      if (currentDate.getTime() !== normalizedDate.getTime()) {
        await attendanceCollection.updateOne(
          { _id: record._id },
          { $set: { date: normalizedDate } }
        );
        normalizedCount++;
      }
    }
    
    console.log(`Normalized ${normalizedCount} attendance dates`);
    
    // Step 4: Check for and fix any duplicate records
    console.log('Checking for duplicate attendance records...');
    
    // Group by course, student, and date to find duplicates
    const pipeline = [
      {
        $group: {
          _id: {
            course: "$course",
            student: "$student",
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$date"
              }
            }
          },
          count: { $sum: 1 },
          records: { $push: "$$ROOT" }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ];
    
    const duplicates = await attendanceCollection.aggregate(pipeline).toArray();
    console.log(`Found ${duplicates.length} duplicate groups`);
    
    let removedDuplicates = 0;
    
    for (const group of duplicates) {
      // Sort by createdAt descending to keep the newest record
      const sortedRecords = group.records.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      // Keep the first (newest) record, delete the rest
      for (let i = 1; i < sortedRecords.length; i++) {
        await attendanceCollection.deleteOne({ _id: sortedRecords[i]._id });
        removedDuplicates++;
      }
    }
    
    console.log(`Removed ${removedDuplicates} duplicate attendance records`);
    
    console.log('Database fix completed successfully');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    mongoose.disconnect();
  }
}); 