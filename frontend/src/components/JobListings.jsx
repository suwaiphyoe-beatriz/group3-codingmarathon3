import { Link } from "react-router-dom";

const JobListings = ({ jobs }) => {

  return (
    <div className="job-list">
      {jobs.map((job) => (
        <div className="job-preview" key={job._id}>
          <Link to={`/jobs/${job._id}`}>
            <h2>{job.title}</h2>
          </Link>
          <p>Type: {job.type}</p>
          <p>Company: {job.company.name}</p>
          {job.location && <p>Location: {job.location}</p>}
          {job.salary && <p>Salary: ${job.salary.toLocaleString()}</p>}
          {job.status && <p>Status: {job.status}</p>}
          {job.applicationDeadline && (
            <p>
              Application Deadline:{" "}
              {new Date(job.applicationDeadline).toLocaleDateString()}
            </p>
          )}
          {job.postedDate && (
            <p>Posted on: {new Date(job.postedDate).toLocaleDateString()}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default JobListings;