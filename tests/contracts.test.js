const request = require("supertest");
const app = require("../src/app");
const { Profile, Contract, Job } = require("../src/model");

describe("Contracts", () => {
    let profiles;
    let contracts;

    beforeEach(async () => {
      await Profile.sync({ force: true });
      await Contract.sync({ force: true });
      await Job.sync({ force: true });

      profiles = [
        {
          id: 1,
          firstName: "Harry",
          lastName: "Potter",
          profession: "Wizard",
          balance: 1150,
          type: "client",
        },

        {
          id: 2,
          firstName: "Linus",
          lastName: "Torvalds",
          profession: "Programmer",
          balance: 1214,
          type: "contractor",
        },

        {
          id: 3,
          firstName: "test",
          lastName: "user",
          profession: "Programmer",
          balance: 123000,
          type: "contractor",
        },

        {
          id: 4,
          firstName: "John",
          lastName: "Doe",
          profession: "Programmer",
          balance: 123000,
          type: "contractor",
        },
      ];

      contracts = [
        {
          id: 1,
          terms: "bla bla bla",
          status: "terminated",
          ClientId: 1,
          ContractorId: 3,
        },
        {
          id: 2,
          terms: "bla bla bla",
          status: "in_progress",
          ClientId: 1,
          ContractorId: 2,
        },
        {
          id: 3,
          terms: "bla bla bla",
          status: "new",
          ClientId: 1,
          ContractorId: 2,
        },
      ];

      await Promise.all([
        ...profiles.map((profile) => Profile.create(profile)),
        ...contracts.map((contract) => Contract.create(contract)),
      ]);
    });

    describe("GET /contracts/:id", () => {
      it("should return a contract by id when profile_id matches client", async () => {
        const res = await request(app)
          .get("/contracts/1")
          .set("profile_id", contracts[0].ClientId);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject(contracts[0]);
      });

      it("should return a contract by id when profile_id matches contractor", async () => {
        const res = await request(app)
          .get("/contracts/1")
          .set("profile_id", contracts[0].ContractorId);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject(contracts[0]);
      });

      it("should return 404 when profile_id doesn't match client or contractor", async () => {
        await request(app).get("/contracts/1").set("profile_id", 4).expect(404);
      });
      it("should return 404 when contract with id doesn't exist", async () => {
        await request(app)
          .get("/contracts/999")
          .set("profile_id", 1)
          .expect(404);
      });
    });

    describe("GET /contracts", () => {
      it("should return all non terminated arrays", async () => {
        const res = await request(app).get("/contracts").set("profile_id", 1);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining(contracts[1]),
            expect.objectContaining(contracts[2]),
          ])
        );
      });

      it("should not return terminated contracts", async () => {
        const res = await request(app).get("/contracts").set("profile_id", 3);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
      });
    });
});
