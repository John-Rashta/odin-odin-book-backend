import request from 'supertest';
import app, { storeStuff } from "../util/tesconfig";
import { deleteEverything } from "../util/queries";

const server = app.listen();

const testUUID = "1d9011dc-ca50-46c4-97f3-5837e08bcc22";

afterAll(() => {
  return Promise.all([
    new Promise((resolve) => resolve(storeStuff.shutdown())),
    new Promise((resolve) => resolve(server.close())),
    deleteEverything(),
  ]);
});

describe("Basic API functionality", () => {
  const userOne = request.agent(server);
  const userTwo = request.agent(server);
  const userError = request.agent(server);
  const userGuest = request.agent(server);
  const userTwoInfo: {
    id?: string;
    requestid?: string;
    secondrequestid?: string;
    messageid?: string;
  } = {};
  const userOneInfo: {
    id?: string;
    requestid?: string;
  } = {};

  test("login guest", (done) => {
    userGuest
      .put("/auth")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("id");
        expect(res.body.id).toEqual("guest");
        done();
      });
  });

  test("create User", (done) => {
    userOne
      .post("/auth")
      .send({
        username: "darkMagician",
        password: "12345",
      })
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

  test("create second user", (done) => {
    userTwo
      .post("/auth")
      .send({
        username: "garrosh",
        password: "6789",
      })
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

  ///ERROR TEST
  test("cant create user with same username", (done) => {
    userError
      .post("/auth")
      .send({
        username: "darkMagician",
        password: "klll12",
      })
      .expect("Content-Type", /json/)
      .expect(400, done);
  });

  test("login user", (done) => {
    userOne
      .put("/auth")
      .send({
        username: "darkMagician",
        password: "12345",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("id");
        userOneInfo.id = res.body.id;
        done();
      });
  });

  test("Login second user", (done) => {
    userTwo
      .put("/auth")
      .send({
        username: "garrosh",
        password: "6789",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("id");
        userTwoInfo.id = res.body.id;
        done();
      });
  });

   test("get self info", (done) => {
    userOne
      .get("/users/self")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("user");
        done();
      });
  });

   ///ERROR TEST
  test("cant get user that doesn't exist", (done) => {
    userOne
      .get(`/users/${testUUID}`)
      .expect("Content-Type", /json/)
      .expect({message: "User not found."})
      .expect(400, done);
  });

  ///ERROR TEST
  test("can't update with an invalid icon id", (done) => {
    userOne
      .put(`/users/self`)
      .send({
        icon: 25,
      })
      .expect("Content-Type", /json/)
      .expect({ message: "Invalid Icon Id" })
      .expect(400, done);
  });

  ///ERROR TEST
  test("can't update with an already used username", (done) => {
    userOne
      .put(`/users/self`)
      .send({
        username: "garrosh",
      })
      .expect("Content-Type", /json/)
      .expect({ message: "Invalid Username" })
      .expect(400, done);
  });

  ///ERROR TEST
  test("can't update if one of the passwords is missing", (done) => {
    userOne
      .put(`/users/self`)
      .send({
        password: "123",
      })
      .expect("Content-Type", /json/)
      .expect({ message: "Missing either old or new password" })
      .expect(400, done);
  });

  ///ERROR TEST
  test("can't update if passwords don't match", (done) => {
    userOne
      .put(`/users/self`)
      .send({
        oldPassword: "1235jhh",
        password: "ggg",
      })
      .expect("Content-Type", /json/)
      .expect({ message: "Wrong old password" })
      .expect(400, done);
  });

  ///ERROR TEST
  test("can't send follow request to an user that doesn't exist", (done) => {
    userOne
      .post("/requests")
      .send({
        type: "FOLLOW",
        id: testUUID,
      })
      .expect("Content-Type", /json/)
      .expect(500, done);
  });

  ///ERROR TEST
  test("can't send follow request to himself", (done) => {
    userOne
      .post("/requests")
      .send({
        type: "FOLLOW",
        targetid: userOneInfo.id,
      })
      .expect("Content-Type", /json/)
      .expect(400, done);
  });

  test("get user", (done) => {
    userOne
      .get(`/users/${userTwoInfo.id}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("user");
        done();
      });
  });

  ///ERROR TEST
  test("can't stop followship that doesn't exist", (done) => {
    userOne
      .delete(`/users/${userTwoInfo.id}/follow`)
      .expect("Content-Type", /json/)
      .expect(500, done);
  });

  test("send follow request", (done) => {
    userOne
      .post("/requests")
      .send({
        type: "FOLLOW",
        id: userTwoInfo.id,
      })
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

  ///ERROR TEST
  test("can't send request twice", (done) => {
    userOne
      .post("/requests")
      .send({
        type: "FOLLOW",
        id: userTwoInfo.id,
      })
      .expect("Content-Type", /json/)
      .expect(500, done);
  });

   test("get requests", (done) => {
    userTwo
      .get("/requests")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("received");
        userTwoInfo.requestid = res.body.received[0].id;
        done();
      });
    });

  ///ERROR TEST
  test("can't accept own request", (done) => {
    userOne
      .put(`/requests/${userTwoInfo.requestid}`)
      .expect("Content-Type", /json/)
      .expect(500, done);
  });

  test("get sent requests", (done) => {
    userOne
      .get("/requests/sent")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("sent");
        done();
      });
  });

  test("accept follow request", (done) => {
    userTwo
      .put(`/requests/${userTwoInfo.requestid}`)
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

  test("get follows", (done) => {
        userOne
            .get("/users/self/follows")
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
                expect(res.body).toHaveProperty("follows");
                expect(res.body.follows[0].id).toEqual(userTwoInfo.id);
                done();
            });
    });

    test("get followers", (done) => {
        userTwo
            .get("/users/self/followers")
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
                expect(res.body).toHaveProperty("followers");
                expect(res.body.followers[0].id).toEqual(userOneInfo.id);
                done();
            });
    });

   ///ERROR TEST
  test("Can't send follow request if already follows", (done) => {
    userOne
      .post("/requests")
      .send({
        type: "FOLLOW",
        targetid: userTwoInfo.id,
      })
      .expect("Content-Type", /json/)
      .expect(400, done);
  });

   test("send mutual follow request", (done) => {
    userTwo
      .post("/requests")
      .send({
        type: "FOLLOW",
        id: userOneInfo.id,
      })
      .expect("Content-Type", /json/)
      .expect(200, done);
    });

    test("get requests", (done) => {
    userOne
      .get("/requests")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("received");
        userOneInfo.requestid = res.body.received[0].id;
        done();
      });
    });

     test("accept mutual follow request", (done) => {
    userOne
      .put(`/requests/${userOneInfo.requestid}`)
      .expect("Content-Type", /json/)
      .expect(200, done);
    });

   test("get follows", (done) => {
    userTwo
      .get("/users/self/follows")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("follows");
        expect(res.body.follows[0].id).toEqual(userOneInfo.id);
        done();
      });
  });

    test("get followers", (done) => {
    userOne
      .get("/users/self/followers")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("followers");
        expect(res.body.followers[0].id).toEqual(userTwoInfo.id);
        done();
      });
    });

});
  