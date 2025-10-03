# Self-Assessment

## Example 1: Implementing Authentication with JWT

When we started building our job application backend, the routes were open to anyone, which meant any user could create, edit, or delete jobs without authentication. This posed a major security risk.

To address this, I implemented JWT-based authentication using a combination of `jsonwebtoken`, `bcryptjs`, and Express middleware.

### Original Challenge

We didn't have any authentication in place. All job routes (`/api/jobs`) were unprotected. Anyone could perform any operation via Postman or frontend without logging in.

### What I Implemented

**File: `userControllers.js`**

I created two new routes for user registration and login:

```javascript
const token = generateToken(user._id);
res.status(201).json({ username, token });
```

When a user signs up or logs in, the server returns a JWT token, which is then saved in the browser's `localStorage`.

**File: `requireAuth.js`**

I then wrote a middleware that:

- Extracts the token from the Authorization header
- Verifies it using our server secret
- Adds the authenticated user's ID to the request object

```javascript
const { _id } = jwt.verify(token, process.env.SECRET);
req.user = await User.findOne({ _id }).select('_id');
```

**File: `jobRouter.js`**

Finally, I used the middleware to protect all POST, PUT, and DELETE job routes:

```javascript
router.use(requireAuth); // Apply middleware below
router.post('/', createJob);
router.put('/:jobId', updateJob);
router.delete('/:jobId', deleteJob);
```

### Key Improvements

- **Security**: Job creation, update, and delete routes are now only accessible to authenticated users.
- **Code Reuse**: By calling `router.use(requireAuth)`, I avoided repeating the middleware on every protected route.
- **Error Handling**: I handled missing or invalid tokens gracefully by returning 401 with a helpful error message.
