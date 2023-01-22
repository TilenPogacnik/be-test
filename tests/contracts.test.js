const request = require("supertest");
const app = require("../src/app");
const { Profile, Contract, Job } = require("../src/model");

describe("Contracts", () => {
  beforeEach(async () => {
    await Profile.sync({ force: true });
    await Contract.sync({ force: true });
    await Job.sync({ force: true });

    await Promise.all([
      Profile.create({
        id: 1,
        firstName: "Harry",
        lastName: "Potter",
        profession: "Wizard",
        balance: 1150,
        type: "client",
      }),
      Profile.create({
        id: 2,
        firstName: "Linus",
        lastName: "Torvalds",
        profession: "Programmer",
        balance: 1214,
        type: "contractor",
      }),
      Profile.create({
        id: 3,
        firstName: "test",
        lastName: "user",
        profession: "Programmer",
        balance: 123000,
        type: "contractor",
      }),
      Contract.create({
        id: 1,
        terms: "bla bla bla",
        status: "terminated",
        ClientId: 1,
        ContractorId: 2,
      }),
    ]);
  });
  describe("GET /contracts/:id", () => {
    it("should return a contract by id when profile_id matches client", async () => {
      const res = await request(app).get("/contracts/1").set("profile_id", 1);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: 1,
        terms: "bla bla bla",
        status: "terminated",
        ClientId: 1,
        ContractorId: 2,
      });
    });

    it("should return a contract by id when profile_id matches contractor", async () => {
      const res = await request(app).get("/contracts/1").set("profile_id", 2);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: 1,
        terms: "bla bla bla",
        status: "terminated",
        ClientId: 1,
        ContractorId: 2,
      });
    });

    it("should return 404 when profile_id doesn't match client or contractor", async () => {
      await request(app).get("/contracts/1").set("profile_id", 3).expect(404);
    });
    it("should return 404 when contract with id doesn't exist", async () => {
      await request(app).get("/contracts/999").set("profile_id", 1).expect(404);
    });
  });
});
