// Add these form fields for eligibility criteria
<div className="form-section">
  <h3>Eligibility Criteria</h3>
  
  <div className="form-group">
    <label htmlFor="eligibilityDegrees">Eligible Degrees (comma separated)</label>
    <input
      type="text"
      id="eligibilityDegrees"
      name="eligibility.degrees"
      value={formData.eligibility?.degrees?.join(', ') || ''}
      onChange={(e) => {
        const degrees = e.target.value.split(',').map(d => d.trim()).filter(d => d);
        setFormData({
          ...formData,
          eligibility: {
            ...formData.eligibility,
            degrees
          }
        });
      }}
      placeholder="B.Tech, M.Tech, BCA, MCA, etc."
    />
  </div>
  
  <div className="form-group">
    <label htmlFor="eligibilityCgpa">Minimum CGPA Required</label>
    <input
      type="number"
      id="eligibilityCgpa"
      name="eligibility.cgpa"
      value={formData.eligibility?.cgpa || ''}
      onChange={(e) => {
        setFormData({
          ...formData,
          eligibility: {
            ...formData.eligibility,
            cgpa: e.target.value
          }
        });
      }}
      step="0.1"
      min="0"
      max="10"
      placeholder="7.0"
    />
  </div>
  
  <div className="form-group">
    <label htmlFor="eligibilityBatch">Eligible Batches (comma separated)</label>
    <input
      type="text"
      id="eligibilityBatch"
      name="eligibility.batch"
      value={formData.eligibility?.batch?.join(', ') || ''}
      onChange={(e) => {
        const batch = e.target.value.split(',').map(b => b.trim()).filter(b => b);
        setFormData({
          ...formData,
          eligibility: {
            ...formData.eligibility,
            batch
          }
        });
      }}
      placeholder="2022, 2023, 2024"
    />
  </div>
  
  <div className="form-group">
    <label htmlFor="eligibilityAdditionalCriteria">Additional Criteria</label>
    <textarea
      id="eligibilityAdditionalCriteria"
      name="eligibility.additionalCriteria"
      value={formData.eligibility?.additionalCriteria || ''}
      onChange={(e) => {
        setFormData({
          ...formData,
          eligibility: {
            ...formData.eligibility,
            additionalCriteria: e.target.value
          }
        });
      }}
      placeholder="Any additional eligibility criteria..."
    ></textarea>
  </div>
</div>

// Add this for attachments
<div className="form-section">
  <h3>Attachments</h3>
  
  {formData.attachments && formData.attachments.map((attachment, index) => (
    <div key={index} className="attachment-item">
      <input
        type="text"
        placeholder="Attachment name"
        value={attachment.name}
        onChange={(e) => {
          const newAttachments = [...formData.attachments];
          newAttachments[index].name = e.target.value;
          setFormData({
            ...formData,
            attachments: newAttachments
          });
        }}
      />
      <input
        type="url"
        placeholder="Attachment URL"
        value={attachment.url}
        onChange={(e) => {
          const newAttachments = [...formData.attachments];
          newAttachments[index].url = e.target.value;
          setFormData({
            ...formData,
            attachments: newAttachments
          });
        }}
      />
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={() => {
          const newAttachments = formData.attachments.filter((_, i) => i !== index);
          setFormData({
            ...formData,
            attachments: newAttachments
          });
        }}
      >
        Remove
      </button>
    </div>
  ))}
  
  <button
    type="button"
    className="btn btn-secondary"
    onClick={() => {
      setFormData({
        ...formData,
        attachments: [...(formData.attachments || []), { name: '', url: '' }]
      });
    }}
  >
    Add Attachment
  </button>
</div>

// Add this for application link
<div className="form-group">
  <label htmlFor="applicationLink">Application Link (Optional)</label>
  <input
    type="url"
    id="applicationLink"
    name="applicationLink"
    value={formData.applicationLink || ''}
    onChange={handleChange}
    placeholder="External application link (if any)"
  />
</div>

// Add this for application process
<div className="form-group">
  <label htmlFor="applicationProcess">Application Process</label>
  <textarea
    id="applicationProcess"
    name="applicationProcess"
    value={formData.applicationProcess || ''}
    onChange={handleChange}
    placeholder="Describe the application process..."
  ></textarea>
</div> 