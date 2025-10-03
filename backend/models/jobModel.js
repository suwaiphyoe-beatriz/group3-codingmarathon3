const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true }, // e.g., Full-time, Part-time, Contract
  description: { type: String, required: true },
  company: {
    name: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    website: { type: String }, // Optional: Company's website URL
    size: { type: Number }, // Number of employees
  },
  location: { type: String, required: true }, // e.g., City, State, or Remote
  salary: { type: Number, required: true }, // e.g., Annual or hourly salary
  experienceLevel: { type: String, enum: ['Entry', 'Mid', 'Senior'], default: 'Entry' }, // Experience level
  postedDate: { type: Date, default: Date.now }, // Date the job was posted
  status: { type: String, enum: ['open', 'closed'], default: 'open' }, // Job status (open/closed)
  applicationDeadline: { type: Date }, // Deadline for job applications  
  requirements: [String], // List of required skills or qualifications
});

//add  virtual field id
jobSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    // ensure id is a string and remove internal fields
    ret.id = ret._id ? String(ret._id) : ret.id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;