// Tests for the API `success` flag contract in error/success responses.
// Run with: npm test  (builds src/ to dist/, then runs node:test over test/)
const test = require("node:test");
const assert = require("node:assert/strict");

process.env.JWT_SECRET = "test-secret";

const { sendResponse } = require("../dist/utils/responseHandler");
const { authenticate, authorize } = require("../dist/middlewares/auth.middleware");
const jwt = require("jsonwebtoken");

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

test("sendResponse shapes the standard API envelope", () => {
  const res = mockRes();
  sendResponse(res, 200, true, "ok", { a: 1 });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { success: true, message: "ok", data: { a: 1 } });
});

test("authenticate without a token returns 401 with success=false", async () => {
  const res = mockRes();
  let nextCalled = false;
  await authenticate({ headers: {} }, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false, "error responses must carry success=false");
  assert.equal(nextCalled, false);
});

test("authenticate with an invalid token returns 401 with success=false", async () => {
  const res = mockRes();
  let nextCalled = false;
  const req = { headers: { authorization: "Bearer not-a-real-token" } };
  await authenticate(req, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false, "error responses must carry success=false");
  assert.equal(nextCalled, false);
});

test("authenticate with a valid token calls next and sets req.user", async () => {
  const token = jwt.sign({ userId: "u1", role: "student" }, process.env.JWT_SECRET);
  const res = mockRes();
  const req = { headers: { authorization: `Bearer ${token}` } };
  let nextCalled = false;
  await authenticate(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(req.user.userId, "u1");
  assert.equal(req.user.role, "student");
});

test("authorize rejects a missing role with 403 and success=false", () => {
  const res = mockRes();
  let nextCalled = false;
  authorize(["admin"])({ user: { role: "student" } }, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false, "error responses must carry success=false");
  assert.equal(nextCalled, false);
});

test("authorize allows a permitted role", () => {
  const res = mockRes();
  let nextCalled = false;
  authorize(["admin"])({ user: { role: "admin" } }, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null, "no error response should be sent");
});
