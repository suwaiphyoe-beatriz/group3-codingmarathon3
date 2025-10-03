const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app"); // Your Express app
const api = supertest(app);
const Job = require("../models/jobModel");
const User = require("../models/userModel");

const jobs = [
  {
    title: "Senior React Developer",
    type: "Full-Time",
    description: "We are seeking a talented Front-End Developer to join our team in Boston, MA.",
    company: {
      name: "NewTek Solutions",
      contactEmail: "contact@teksolutions.com",
      contactPhone: "555-555-5555"
    }
    ,
    location: "Boston, MA",
    salary: 120000
  },
  {
    title: "Junior Backend Developer",
    type: "Part-Time",
    description: "Join our backend team to help build scalable APIs.",
    company: {
      name: "Tech Innovators",
      contactEmail: "hr@techinnovators.com",
      contactPhone: "555-555-1234"
    }
    ,
    location: "Remote",
    salary: 40000
  },
];

describe("Job Controller", () => {
  let token;
  const testUser = {
    name: "Test User",
    username: `testuser_${Date.now()}`,
    password: "testpass",
    phone_number: "1234567890",
    gender: "other",
    date_of_birth: new Date(1990, 1, 1).toISOString(),
    membership_status: "free",
  };

  beforeAll(async () => {
    // ensure users collection is clean for test user creation
    await User.deleteMany({});

    // create test user via signup route
    await api.post('/api/users/signup').send(testUser);

    // login to get token
    const loginRes = await api.post('/api/users/login').send({
      username: testUser.username,
      password: testUser.password,
    });
    token = loginRes.body.token;
  });

  beforeEach(async () => {
    await Job.deleteMany({});
    await Job.insertMany(jobs);
  });

  afterAll(() => {
    mongoose.connection.close();
  });

  // Test GET /api/jobs
  it("should return all jobs as JSON when GET /api/jobs is called", async () => {
    const response = await api
      .get("/api/jobs")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toHaveLength(jobs.length);
  });

  // Test POST /api/jobs
  it("should create a new job when POST /api/jobs is called", async () => {
    const newJob = {
      title: "Mid-Level DevOps Engineer",
      type: "Full-Time",
      description: "We are looking for a DevOps Engineer to join our team.",
      company: {
        name: "Cloud Solutions",
        contactEmail: "jobs@cloudsolutions.com",
        contactPhone: "555-555-6789"
      }
      ,
      location: "San Francisco, CA",
      salary: 140000
    };

    await api
      .post("/api/jobs")
      .set('Authorization', `Bearer ${token}`)
      .send(newJob)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const jobsAfterPost = await Job.find({});
    expect(jobsAfterPost).toHaveLength(jobs.length + 1);
    const jobTitles = jobsAfterPost.map((job) => job.title);
    expect(jobTitles).toContain(newJob.title);
  });

  it("should create a job with all fields and default values when POST /api/jobs is called", async () => {
    const fullJob = {
      title: "Full Stack Engineer",
      type: "Contract",
      description: "A job with all fields provided",
      company: {
        name: "Complete Co",
        contactEmail: "hello@complete.co",
        contactPhone: "555-000-1111",
        website: "https://complete.co",
        size: 250
      },
      location: "Austin, TX",
      salary: 130000,
      experienceLevel: "Mid",
      applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      requirements: ["Node.js", "React", "MongoDB"]
    };

    const response = await api
      .post("/api/jobs")
      .set('Authorization', `Bearer ${token}`)
      .send(fullJob)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const created = response.body;
    // required fields
    expect(created.title).toBe(fullJob.title);
    expect(created.location).toBe(fullJob.location);
    expect(created.salary).toBe(fullJob.salary);
    // company nested fields
    expect(created.company).toBeDefined();
    expect(created.company.website).toBe(fullJob.company.website);
    expect(created.company.size).toBe(fullJob.company.size);
    // array field
    expect(created.requirements).toEqual(expect.arrayContaining(fullJob.requirements));
    // enum field preserved
    expect(created.experienceLevel).toBe(fullJob.experienceLevel);
    // defaults: status should default to 'open'
    expect(created.status).toBeDefined();
    expect(created.status).toBe("open");
    // postedDate should exist
    expect(created.postedDate).toBeDefined();
    // virtual id should exist
    expect(created.id).toBeDefined();
  });

  it("should return 400 when creating a job with invalid experienceLevel enum", async () => {
    const badJob = {
      title: "Invalid Enum",
      type: "Full-Time",
      description: "Invalid experience level",
      company: {
        name: "Bad Co",
        contactEmail: "bad@co.com",
        contactPhone: "555-222-3333"
      },
      location: "Nowhere",
      salary: 50000,
      experienceLevel: "Expert" // invalid according to schema
    };

    await api
      .post("/api/jobs")
      .set('Authorization', `Bearer ${token}`)
      .send(badJob)
      .expect(400);
  });

  // Test GET /api/jobs/:id
  it("should return one job by ID when GET /api/jobs/:id is called", async () => {
    const job = await Job.findOne();
    await api
      .get(`/api/jobs/${job._id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  it("GET /api/jobs should return jobs with virtual id property", async () => {
    const response = await api.get("/api/jobs").expect(200);
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0].id).toBeDefined();
    }
  });

  it("should return 404 for a non-existing job ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await api.get(`/api/jobs/${nonExistentId}`).expect(404);
  });

  // Test PUT /api/jobs/:id
  it("should update one job with partial data when PUT /api/jobs/:id is called", async () => {
    const job = await Job.findOne();
    const updatedJob = {
      description: "Updated description",
      type: "Contract",
    };

    await api
      .put(`/api/jobs/${job._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedJob)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const updatedJobCheck = await Job.findById(job._id);
    expect(updatedJobCheck.description).toBe(updatedJob.description);
    expect(updatedJobCheck.type).toBe(updatedJob.type);
  });

  it("should return 400 for invalid job ID when PUT /api/jobs/:id", async () => {
  const invalidId = "12345";
  await api.put(`/api/jobs/${invalidId}`).set('Authorization', `Bearer ${token}`).send({}).expect(400);
  });

  // Test DELETE /api/jobs/:id
  it("should delete one job by ID when DELETE /api/jobs/:id is called", async () => {
    const job = await Job.findOne();
  await api.delete(`/api/jobs/${job._id}`).set('Authorization', `Bearer ${token}`).expect(204);

    const deletedJobCheck = await Job.findById(job._id);
    expect(deletedJobCheck).toBeNull();
  });

  it("should return 400 for invalid job ID when DELETE /api/jobs/:id", async () => {
    const invalidId = "12345";
    await api.delete(`/api/jobs/${invalidId}`).set('Authorization', `Bearer ${token}`).expect(400);
  });
});