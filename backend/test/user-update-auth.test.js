// Tests for the authorization rules on PUT /api/users/:id.
// Run with: npm test  (builds src/ to dist/, then runs node:test over test/)
const test = require("node:test");
const assert = require("node:assert/strict");

process.env.JWT_SECRET = "test-secret";

const { updateUser } = require("../dist/controllers/user.controller");
const { User } = require("../dist/models/User");

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

// Stub the model so no database is needed; records what update was applied.
function stubFindByIdAndUpdate(returnValue) {
  const calls = [];
  User.findByIdAndUpdate = (id, update, options) => {
    calls.push({ id, update, options });
    return {
      select: async () => returnValue,
    };
  };
  return calls;
}

test("updateUser without an authenticated user returns 401", async () => {
  const res = mockRes();
  await updateUser(
    { params: { id: "u1" }, body: { name: "New" }, user: undefined },
    res,
    () => {}
  );
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
});

test("updateUser rejects a non-admin updating someone else with 403", async () => {
  const res = mockRes();
  await updateUser(
    {
      params: { id: "victim" },
      body: { name: "Hacked" },
      user: { userId: "attacker", role: "student" },
    },
    res,
    () => {}
  );
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
});

test("updateUser rejects a non-admin changing a role with 403", async () => {
  const res = mockRes();
  await updateUser(
    {
      params: { id: "u1" },
      body: { role: "admin" },
      user: { userId: "u1", role: "student" },
    },
    res,
    () => {}
  );
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
});

test("updateUser lets a user update their own name and email only", async () => {
  const calls = stubFindByIdAndUpdate({ _id: "u1", name: "New Name" });
  const res = mockRes();
  await updateUser(
    {
      params: { id: "u1" },
      body: { name: "New Name", email: "new@example.com" },
      user: { userId: "u1", role: "student" },
    },
    res,
    () => {}
  );
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].update, { name: "New Name", email: "new@example.com" });
  assert.equal("role" in calls[0].update, false, "self-update must never set role");
});

test("updateUser lets an admin change another user's role", async () => {
  const calls = stubFindByIdAndUpdate({ _id: "u2", role: "lecturer" });
  const res = mockRes();
  await updateUser(
    {
      params: { id: "u2" },
      body: { role: "lecturer" },
      user: { userId: "admin1", role: "admin" },
    },
    res,
    () => {}
  );
  assert.equal(res.statusCode, 200);
  assert.deepEqual(calls[0].update, { role: "lecturer" });
});

test("updateUser ignores body fields that are absent", async () => {
  const calls = stubFindByIdAndUpdate({ _id: "u1", name: "Only Name" });
  const res = mockRes();
  await updateUser(
    {
      params: { id: "u1" },
      body: { name: "Only Name" },
      user: { userId: "u1", role: "student" },
    },
    res,
    () => {}
  );
  assert.equal(res.statusCode, 200);
  assert.deepEqual(calls[0].update, { name: "Only Name" });
});

test("updateUser returns 404 when the target user does not exist", async () => {
  stubFindByIdAndUpdate(null);
  const res = mockRes();
  await updateUser(
    {
      params: { id: "missing" },
      body: { name: "X" },
      user: { userId: "admin1", role: "admin" },
    },
    res,
    () => {}
  );
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
});
