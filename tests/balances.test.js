const request = require("supertest");
const app = require("../src/app");
const { Profile, Contract, Job } = require("../src/model");

describe("Balances", () => {
  describe("POST /balances/deposit/:id", () => {
    let profiles;
    let contracts;
    let jobs;

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
      ];

      contracts = [
        {
          id: 1,
          terms: "bla bla bla",
          status: "in_progress",
          ClientId: 1,
          ContractorId: 2,
        },
      ];

      jobs = [
        {
          id: 1,
          description: "work",
          price: 200,
          ContractId: 1,
        },
        {
          id: 2,
          description: "work",
          price: 100,
          ContractId: 1,
        },
        {
          id: 3,
          description: "work",
          price: 200,
          paid: true,
          paymentDate: "2020-08-16T19:11:26.737Z",
          ContractId: 1,
        },
      ];

      await Promise.all([
        ...profiles.map((profile) => Profile.create(profile)),
        ...contracts.map((contract) => Contract.create(contract)),
        ...jobs.map((job) => Job.create(job)),
      ]);
    });

    it("should increase profile balance by amount", async () => {
      const res = await request(app)
        .post(`/balances/deposit/${profiles[0].id}`)
        .set("profile_id", profiles[0].id)
        .set("Content-type", "application/json")
        .send({ amount: 10 });

      expect(res.status).toBe(200);

      //expect balance to be updated
      const clientProfile = await Profile.findByPk(profiles[0].id);
      expect(clientProfile.balance).toBe(1160);
    });

    it("should return 403 when attempting to deposit to a contractor", async () => {
      await request(app)
        .post(`/balances/deposit/${profiles[1].id}`)
        .set("profile_id", profiles[1].id)
        .set("Content-type", "application/json")
        .send({ amount: 10 })
        .expect(403);
    });

    it("should return 403 when attempting to deposit to another profile", async () => {
      await request(app)
        .post(`/balances/deposit/${profiles[0].id}`)
        .set("profile_id", profiles[1].id)
        .set("Content-type", "application/json")
        .send({ amount: 10 })
        .expect(403);
    });

    it("should return 400 if no amount is provided", async () => {
      await request(app)
        .post(`/balances/deposit/${profiles[0].id}`)
        .set("profile_id", profiles[0].id)
        .set("Content-type", "application/json")
        .send({ value: 10 })
        .expect(400);

      //expect balance to stay the same
      const clientProfile = await Profile.findByPk(profiles[0].id);
      expect(clientProfile.balance).toBe(profiles[0].balance);
    });

    it("should return 400 if invalid amount is provided", async () => {
      await request(app)
        .post(`/balances/deposit/${profiles[0].id}`)
        .set("profile_id", profiles[0].id)
        .set("Content-type", "application/json")
        .send({ amount: "a lot of money" })
        .expect(400);

      //expect balance to stay the same
      const clientProfile = await Profile.findByPk(profiles[0].id);
      expect(clientProfile.balance).toBe(profiles[0].balance);
    });

    it("should return 400 when attempting to deposit more than 25% of total amount to pay", async () => {
      await request(app)
        .post(`/balances/deposit/${profiles[0].id}`)
        .set("profile_id", profiles[0].id)
        .set("Content-type", "application/json")
        .send({ amount: 300 })
        .expect(400);

      //expect balance to stay the same
      const clientProfile = await Profile.findByPk(profiles[0].id);
      expect(clientProfile.balance).toBe(profiles[0].balance);
    });
  });
});
