const assert = require("chai").assert;
const app = require("../server");
var request = require("supertest");
const UserModel = require("../model-mvc");

const user1 = {
  name: "Raswitha",
  email: "raswitha@albany.edu",
  password: "raswitha@123",
};

beforeEach(async () => {
  await UserModel.deleteOne({ email: "raswitha@albany.edu" });
});

describe("auth API", () => {
  describe("Testing Login", () => {
    it("Login should return with status 200!", (done) => {
      request(app)
        .post("/login")
        .send({ email: "raswitha6666@gmail.com", password: "raswitha@123" })
        .expect(200)
        .end(function (err, res) {
          done();
        });
    });
  });

  describe("Testing Register", () => {
    it("Registration should return with status 200!", (done) => {
      request(app)
        .post("/register")
        .send({
          name: user1.name,
          email: user1.email,
          password: user1.password,
        })
        .expect(200)
        .end(function (err, res) {
          done();
        });
    });
  });
});
