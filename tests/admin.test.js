const request = require("supertest");
const app = require("../src/app");
const { Profile, Contract, Job } = require("../src/model");

describe("Admin", () => {
  describe("GET /admin/best-profession?start=<date>&end=<date>", () => {
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
          profession: "Race car driver",
          balance: 1214,
          type: "contractor",
        },

        {
          id: 3,
          firstName: "John",
          lastName: "Doe",
          profession: "Chef",
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
        {
          id: 2,
          terms: "bla bla bla",
          status: "in_progress",
          ClientId: 1,
          ContractorId: 3,
        },
      ];

      jobs = [
        {
          id: 1,
          description: "work",
          price: 200,
          paid: true,
          paymentDate: "2020-08-16T19:11:26.737Z",
          ContractId: 1,
        },
        {
          id: 2,
          description: "work",
          price: 100,
          paid: true,
          paymentDate: "2021-08-16T19:11:26.737Z",
          ContractId: 1,
        },
        {
          id: 3,
          description: "work",
          price: 200,
          paid: true,
          paymentDate: "2022-08-16T19:11:26.737Z",
          ContractId: 2,
        },
      ];

      await Promise.all([
        ...profiles.map((profile) => Profile.create(profile)),
        ...contracts.map((contract) => Contract.create(contract)),
        ...jobs.map((job) => Job.create(job)),
      ]);
    });

    it("should return the best profession", async () => {
      const res = await request(app)
        .get("/admin/best-profession?start=2019-07-16&end=2023-08-16")
        .set("profile_id", profiles[0].id);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        profession: "Race car driver",
      });
    });

    it("should return the best profession for date range", async () => {
      const res = await request(app)
        .get("/admin/best-profession?start=2021-07-16&end=2023-08-16")
        .set("profile_id", profiles[0].id);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        profession: "Chef",
      });
    });

    it("should return 400 if start date is not provided", async () => {
      await request(app)
        .get("/admin/best-profession?end=2023-08-16")
        .set("profile_id", profiles[0].id)
        .expect(400);
    });

    it("should return 400 if end date is not provided", async () => {
      await request(app)
        .get("/admin/best-profession?start=2023-08-16")
        .set("profile_id", profiles[0].id)
        .expect(400);
    });

    it("should return 400 if start date is not a valid date", async () => {
      await request(app)
        .get("/admin/best-profession?start=2023asd-08-16&end=2023-08-16")
        .set("profile_id", profiles[0].id)
        .expect(400);
    });

    it("should return 400 if end date is not a valid date", async () => {
      await request(app)
        .get("/admin/best-profession?start=2023-08-16&end=2023asd-08-16")
        .set("profile_id", profiles[0].id)
        .expect(400);
    });

    it("should return 400 if start date is after end date", async () => {
      await request(app)
        .get("/admin/best-profession?start=2023-08-16&end=2021-08-16")
        .set("profile_id", profiles[0].id)
        .expect(400);
    });

    it("should return 400 if no jobs are found in date range", async () => {
      const res = await request(app)
        .get("/admin/best-profession?start=2010-08-16&end=2011-08-16")
        .set("profile_id", profiles[0].id)
        .expect(400);
    });
  });

  describe("GET /admin/best-profession?start=<date>&end=<date>", () => {
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
          profession: "Race car driver",
          balance: 1214,
          type: "client",
        },

        {
          id: 3,
          firstName: "John",
          lastName: "Doe",
          profession: "Chef",
          balance: 1214,
          type: "contractor",
        },
        {
          id: 4,
          firstName: "Harry2",
          lastName: "Potter2",
          profession: "Wizard",
          balance: 1150,
          type: "client",
        },
      ];

      contracts = [
        {
          id: 1,
          terms: "bla bla bla",
          status: "in_progress",
          ClientId: 1,
          ContractorId: 3,
        },
        {
          id: 2,
          terms: "bla bla bla",
          status: "in_progress",
          ClientId: 2,
          ContractorId: 3,
        },
      ];

      jobs = [
        {
          id: 1,
          description: "work",
          price: 200,
          paid: true,
          paymentDate: "2020-08-16T19:11:26.737Z",
          ContractId: 1,
        },
        {
          id: 2,
          description: "work",
          price: 100,
          paid: true,
          paymentDate: "2021-08-16T19:11:26.737Z",
          ContractId: 1,
        },
        {
          id: 3,
          description: "work",
          price: 400,
          paid: true,
          paymentDate: "2022-08-16T19:11:26.737Z",
          ContractId: 2,
        },
        {
          id: 4,
          description: "work",
          price: 200,
          paid: true,
          paymentDate: "2022-08-16T19:11:26.737Z",
          ContractId: 1,
        },
      ];

      await Promise.all([
        ...profiles.map((profile) => Profile.create(profile)),
        ...contracts.map((contract) => Contract.create(contract)),
        ...jobs.map((job) => Job.create(job)),
      ]);
    });

    it("should return the best clients", async () => {
      const res = await request(app)
        .get("/admin/best-clients?start=2019-07-16&end=2023-08-16")
        .set("profile_id", profiles[0].id);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);

      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fullName: "Harry Potter",
            id: 1,
            paid: 500,
          }),
          expect.objectContaining({
            fullName: "Linus Torvalds",
            id: 2,
            paid: 400,
          }),
        ])
      );
    });

    it("should return max 'limit' clients", async () => {
      const res = await request(app)
        .get("/admin/best-clients?start=2019-07-16&end=2023-08-16&limit=1")
        .set("profile_id", profiles[0].id);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);

      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fullName: "Harry Potter",
            id: 1,
            paid: 500,
          }),
        ])
      );
    });

    it("should return the best clients for date range", async () => {
      const res = await request(app)
        .get("/admin/best-clients?start=2021-07-16&end=2023-08-16")
        .set("profile_id", profiles[0].id);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fullName: "Linus Torvalds",
            id: 2,
            paid: 400,
          }),
          expect.objectContaining({
            fullName: "Harry Potter",
            id: 1,
            paid: 300,
          }),
        ])
      );
    });

    it("should return 400 if start date is not provided", async () => {
      await request(app)
        .get("/admin/best-clients?end=2023-08-16")
        .set("profile_id", profiles[0].id)
        .expect(400);
    });

    it("should return 400 if end date is not provided", async () => {
      await request(app)
        .get("/admin/best-clients?start=2023-08-16")
        .set("profile_id", profiles[0].id)
        .expect(400);
    });

    it("should return 400 if start date is not a valid date", async () => {
      await request(app)
        .get("/admin/best-clients?start=2023asd-08-16&end=2023-08-16")
        .set("profile_id", profiles[0].id)
        .expect(400);
    });

    it("should return 400 if end date is not a valid date", async () => {
      await request(app)
        .get("/admin/best-clients?start=2023-08-16&end=2023asd-08-16")
        .set("profile_id", profiles[0].id)
        .expect(400);
    });

    it("should return 400 if start date is after end date", async () => {
      await request(app)
        .get("/admin/best-clients?start=2023-08-16&end=2021-08-16")
        .set("profile_id", profiles[0].id)
        .expect(400);
    });
  });
});
