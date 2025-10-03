import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [size, setSize] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Entry");
  const [status, setStatus] = useState("open");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [requirements, setRequirements] = useState("");

  // Fetch job by ID
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) throw new Error("Failed to fetch job");
        const data = await res.json();
        setJob(data);

        // Initialize form fields
        setTitle(data.title);
        setType(data.type);
        setDescription(data.description);
        setCompanyName(data.company.name);
        setContactEmail(data.company.contactEmail);
        setContactPhone(data.company.contactPhone);
        setWebsite(data.company.website || "");
        setSize(data.company.size || "");
        setLocation(data.location);
        setSalary(data.salary);
        setExperienceLevel(data.experienceLevel || "Entry");
        setStatus(data.status || "open");
        setApplicationDeadline(
          data.applicationDeadline
            ? new Date(data.applicationDeadline).toISOString().substr(0, 10)
            : ""
        );
        setRequirements(data.requirements ? data.requirements.join(", ") : "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // Update job function
  const updateJob = async (updatedJob) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedJob),
      });
      if (!res.ok) throw new Error("Failed to update job");
      return true;
    } catch (err) {
      console.error(err);
      setError(err.message);
      return false;
    }
  };

  // Form submission
  const submitForm = async (e) => {
    e.preventDefault();

    const updatedJob = {
      title,
      type,
      description,
      company: {
        name: companyName,
        contactEmail,
        contactPhone,
        website,
        size: Number(size),
      },
      location,
      salary: Number(salary),
      experienceLevel,
      status,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      requirements: requirements.split(",").map((r) => r.trim()),
    };

    const success = await updateJob(updatedJob);
    if (success) navigate(`/jobs/${id}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!job) return <p>Job not found.</p>;

  return (
    <div className="create">
      <h2>Edit Job</h2>
      <form onSubmit={submitForm}>
        <label>Job title:</label>
        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Job type:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Full-Time">Full-Time</option>
          <option value="Part-Time">Part-Time</option>
          <option value="Contract">Contract</option>
          <option value="Remote">Remote</option>
          <option value="Internship">Internship</option>
        </select>

        <label>Description:</label>
        <textarea required value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Company Name:</label>
        <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        <label>Contact Email:</label>
        <input type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        <label>Contact Phone:</label>
        <input type="text" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        <label>Website:</label>
        <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} />
        <label>Company Size:</label>
        <input type="number" value={size} onChange={(e) => setSize(e.target.value)} />

        <label>Location:</label>
        <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} />
        <label>Salary:</label>
        <input type="number" required value={salary} onChange={(e) => setSalary(e.target.value)} />

        <label>Experience Level:</label>
        <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
          <option value="Entry">Entry</option>
          <option value="Mid">Mid</option>
          <option value="Senior">Senior</option>
        </select>

        <label>Status:</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>

        <label>Application Deadline:</label>
        <input
          type="date"
          value={applicationDeadline}
          onChange={(e) => setApplicationDeadline(e.target.value)}
        />

        <label>Requirements (comma separated):</label>
        <input
          type="text"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
        />

        <button type="submit">Update Job</button>
      </form>
    </div>
  );
};

export default EditJobPage;