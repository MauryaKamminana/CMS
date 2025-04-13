// Add these fields to the student profile form

// For student profiles
<div className="form-section">
  <h3>Placement Information</h3>
  
  <div className="form-group">
    <label htmlFor="cgpa">CGPA</label>
    <input
      type="number"
      id="cgpa"
      name="profile.cgpa"
      value={formData.profile?.cgpa || ''}
      onChange={handleChange}
      step="0.01"
      min="0"
      max="10"
      placeholder="Enter your CGPA"
    />
  </div>
  
  <div className="form-group">
    <label htmlFor="degree">Degree</label>
    <select
      id="degree"
      name="profile.degree"
      value={formData.profile?.degree || ''}
      onChange={handleChange}
    >
      <option value="">Select your degree</option>
      <option value="B.Tech">B.Tech</option>
      <option value="M.Tech">M.Tech</option>
      <option value="BCA">BCA</option>
      <option value="MCA">MCA</option>
      <option value="B.Sc">B.Sc</option>
      <option value="M.Sc">M.Sc</option>
      <option value="BBA">BBA</option>
      <option value="MBA">MBA</option>
      <option value="B.Com">B.Com</option>
      <option value="M.Com">M.Com</option>
    </select>
  </div>
  
  <div className="form-group">
    <label htmlFor="batch">Batch/Graduation Year</label>
    <select
      id="batch"
      name="profile.batch"
      value={formData.profile?.batch || ''}
      onChange={handleChange}
    >
      <option value="">Select your batch</option>
      <option value="2023">2023</option>
      <option value="2024">2024</option>
      <option value="2025">2025</option>
      <option value="2026">2026</option>
      <option value="2027">2027</option>
    </select>
  </div>
  
  <div className="form-group">
    <label htmlFor="skills">Skills (comma separated)</label>
    <input
      type="text"
      id="skills"
      name="profile.skills"
      value={formData.profile?.skills || ''}
      onChange={handleChange}
      placeholder="e.g., JavaScript, React, Node.js"
    />
  </div>
  
  <div className="form-group">
    <label htmlFor="resumeLink">Resume Link</label>
    <input
      type="url"
      id="resumeLink"
      name="profile.resumeLink"
      value={formData.profile?.resumeLink || ''}
      onChange={handleChange}
      placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
    />
  </div>
</div> 