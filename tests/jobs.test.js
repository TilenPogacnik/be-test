const request = require("supertest");
const app = require("../src/app");
const { Profile, Contract, Job } = require("../src/model");

describe("Jobs", () => {
  
  describe("GET /jobs/unpaid", () => {
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

        {
          id: 3,
          firstName: "Test",
          lastName: "User",
          profession: "Programmer",
          balance: 1500,
          type: "contractor",
        },
        {
          id: 4,
          firstName: "Test",
          lastName: "User",
          profession: "Programmer",
          balance: 1500,
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
          status: "terminated",
          ClientId: 3,
          ContractorId: 2,
        },
        {
          id: 3,
          terms: "bla bla bla",
          status: "in_progress",
          ClientId: 1,
          ContractorId: 4,
        },
      ];

      jobs = [
        {
          description: "work",
          price: 200,
          ContractId: 1,
        },
        {
          description: "work",
          price: 300,
          ContractId: 1,
        },
        {
          description: "work",
          price: 400,
          paid: true,
          ContractId: 1,
        },
        {
          description: "work",
          price: 500,
          ContractId: 2,
        },
        {
          description: "work",
          price: 500,
          paid: true,
          ContractId: 3,
        },
        {
          description: "work",
          price: 500,
          paid: true,
          ContractId: 3,
        },
      ];

      await Promise.all([
        ...profiles.map((profile) => Profile.create(profile)),
        ...contracts.map((contract) => Contract.create(contract)),
        ...jobs.map((job) => Job.create(job)),
      ]);
    });

    it("should return all unpaid jobs for client", async () => {
      const res = await request(app)
        .get("/jobs/unpaid")
        .set("profile_id", contracts[0].ClientId);

      expect(res.status).toBe(200);

      expect(res.body.length).toBe(2);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining(jobs[0]),
          expect.objectContaining(jobs[1]),
        ])
      );
    });

    it("should return empty array if profile has no active contracts", async () => {
      const res = await request(app)
        .get("/jobs/unpaid")
        .set("profile_id", contracts[1].ClientId);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });

    it("should return empty array if all jobs are paid", async () => {
      const res = await request(app)
        .get("/jobs/unpaid")
        .set("profile_id", contracts[1].ClientId);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });

  describe("POST /jobs/pay/:id", () => {
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
          balance: 1000,
          type: "client",
        },

        {
          id: 2,
          firstName: "Linus",
          lastName: "Torvalds",
          profession: "Programmer",
          balance: 500,
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
      ];

      await Promise.all([
        ...profiles.map((profile) => Profile.create(profile)),
        ...contracts.map((contract) => Contract.create(contract)),
        ...jobs.map((job) => Job.create(job)),
      ]);
    });

    it("should pay job, move money and mark job as paid", async () => {
      const res = await request(app)
        .post(`/jobs/${jobs[0].id}/pay`)
        .set("profile_id", contracts[0].ClientId);

      expect(res.status).toBe(200);

      //expect balance to be updated
      const clientProfile = await Profile.findByPk(contracts[0].ClientId);
      expect(clientProfile.balance).toBe(800);

      const contractorProfile = await Profile.findByPk(
        contracts[0].ContractorId
      );
      expect(contractorProfile.balance).toBe(700);

      const job = await Job.findByPk(jobs[0].id);
      expect(job.paid).toBe(true);
    });

    it("should return 409 if job is already paid", async () => {
      await Job.update({ paid: true }, { where: { id: jobs[0].id } });

      const res = await request(app)
        .post(`/jobs/${jobs[0].id}/pay`)
        .set("profile_id", contracts[0].ClientId);

      expect(res.status).toBe(409);

      //expect balances to be unchanged
      const clientProfile = await Profile.findByPk(contracts[0].ClientId);
      expect(clientProfile.balance).toBe(1000);
      const contractorProfile = await Profile.findByPk(
        contracts[0].ContractorId
      );
      expect(contractorProfile.balance).toBe(500);
      const job = await Job.findByPk(jobs[0].id);
      expect(job.paid).toBe(true);
    });

    it("should return 403 if profile is not client", async () => {
      const res = await request(app)
        .post(`/jobs/${jobs[0].id}/pay`)
        .set("profile_id", contracts[0].ContractorId);

      expect(res.status).toBe(403);

      //expect balances to be unchanged
      const clientProfile = await Profile.findByPk(contracts[0].ClientId);
      expect(clientProfile.balance).toBe(1000);
      const contractorProfile = await Profile.findByPk(
        contracts[0].ContractorId
      );
      expect(contractorProfile.balance).toBe(500);
      const job = await Job.findByPk(jobs[0].id);
      expect(job.paid).not.toBe(true);
    });

    it("should return 400 if client balance is too low", async () => {
      await Profile.update(
        { balance: 100 },
        { where: { id: contracts[0].ClientId } }
      );

      const res = await request(app)
        .post(`/jobs/${jobs[0].id}/pay`)
        .set("profile_id", contracts[0].ClientId);

      expect(res.status).toBe(400);

      //expect balances to be unchanged
      const clientProfile = await Profile.findByPk(contracts[0].ClientId);
      expect(clientProfile.balance).toBe(100);
      const contractorProfile = await Profile.findByPk(
        contracts[0].ContractorId
      );
      expect(contractorProfile.balance).toBe(500);
      const job = await Job.findByPk(jobs[0].id);
      expect(job.paid).not.toBe(true);
    });

    it("should return 404 if job not found", async () => {
      const res = await request(app)
        .post(`/jobs/999/pay`)
        .set("profile_id", contracts[0].ClientId);

      expect(res.status).toBe(404);
    });
  });
});
