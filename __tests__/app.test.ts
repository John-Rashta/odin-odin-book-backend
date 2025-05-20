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
    postid?: string;
    notificationid?: string;
    commentid?: string;
    deleteCommentid?: string;
  } = {};
  const userOneInfo: {
    id?: string;
    requestid?: string;
    postid?: string;
    commentid?: string;
    deletePostid?: string;
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

    test("get icons", (done) => {
      userOne
        .get(`/users/icons`)
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty("icons");
          done();
        });
    });

    test("search user by string", (done) => {
    userOne
      .get(`/users/search`)
      .query({ user: "d" })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("users");
        done();
      });
    });

    test("search user by id", (done) => {
    userOne
      .get(`/users/search`)
      .query({ user: userTwoInfo.id })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("users");
        expect(res.body.users[0].username).toEqual("garrosh")
        done();
      });
    });

     test("search user with invalid value", (done) => {
    userOne
      .get(`/users/search`)
      .query({ user: "d   sadsa !!!" })
      .expect("Content-Type", /json/)
      .expect(400, done);
    });

    test("Get users with normal route", (done) => {
      userOne
        .get("/users?skip=5&amount=10")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty("users");
          done();
        });
    });

    test("Get user posts", (done) => {
      userOne
        .get(`/users/${userTwoInfo.id}/posts`)
         .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty("posts");
          done();
        });
    });

     test("update user info", (done) => {
      userOne
      .put(`/users/self`)
      .send({
        username: "blueeyes",
        oldPassword: "12345",
        password: "ggg",
        icon: 2,
        aboutMe: "HELLO WORLD",
      })
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

  test("update aboutme to be empty again", (done) => {
      userOne
      .put(`/users/self`)
      .send({
        aboutMe: "",
      })
      .expect("Content-Type", /json/)
      .expect(200, done);
  });


  test("update profile with custom file", (done) => {
    userOne
      .put("/users/self")
      .set("Content-Type", "multipart/form-data")
      .attach("uploaded_file", "util/pools/testStuff/waldo.png")
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

   ///ERROR TEST
  test("testing if helper delete functions work properly", (done) => {
    userOne
      .put("/users/self")
      .set("Content-Type", "multipart/form-data")
      .field("password", "333")
      .field("oldPassword", "12saSSS")
      .attach("uploaded_file", "util/pools/testStuff/waldo.png")
      .expect("Content-Type", /json/)
      .expect(400, done);
  });

  ///ERROR TEST
  test("fail to update with image too large", (done) => {
    userOne
      .put("/users/self")
      .set("Content-Type", "multipart/form-data")
      .attach("uploaded_file", "util/pools/testStuff/book4troy.webp")
      .expect("Content-Type", /json/)
      .expect(400, done);
  });

    test("update profile back to icon", (done) => {
    userOne
      .put("/users/self")
      .send({
        icon: 1
      })
      .expect("Content-Type", /json/)
      .expect(200, done);
  });


  ///ERROR TEST
  test("Wrong query values", (done) => {
    userOne
      .get("/users?skip=as&amount=10")
      .expect("Content-Type", /json/)
      .expect(400, done);
  });

  test("Get Feed", (done) => {
    userOne
      .get("/users/self/feed")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
          expect(res.body).toHaveProperty("feed");
          done();
      });
  });

  test("Create post", (done) => {
    userOne
      .post("/posts")
      .send({
        content: "my post here"
      })
      .expect(200)
      .then((res) => {
          expect(res.body).toHaveProperty("postid");
          userOneInfo.postid = res.body.postid;
          done();
      });
  });

   test("Create second post with just image", (done) => {
    userOne
      .post("/posts")
      .set("Content-Type", "multipart/form-data")
      .attach("uploaded_file", "util/pools/testStuff/waldo.png")
      .expect(200)
      .then((res) => {
          expect(res.body).toHaveProperty("postid");
          userOneInfo.deletePostid = res.body.postid;
          done();
      });
  });

  ///ERROR TEST
  test("Can't create empty post", (done) => {
    userOne
      .post("/posts")
      .send({
        content: ""
      })
      .expect("Content-Type", /json/)
      .expect({message: "Post can't be empty."})
      .expect(400, done)
  });

  test("Create post with image", (done) => {
    userTwo
      .post("/posts")
      .set("Content-Type", "multipart/form-data")
      .field("content", "hello here")
      .attach("uploaded_file", "util/pools/testStuff/waldo.png")
      .expect(200)
      .then((res) => {
          expect(res.body).toHaveProperty("postid");
          userTwoInfo.postid = res.body.postid;
          done();
      });
  });

  test("Get Post", (done) => {
    userOne
      .get(`/posts/${userOneInfo.postid}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
          expect(res.body).toHaveProperty("post");
          done();
      });
  });

  ///ERROR TEST
  test("Can't get post that doesn't exist", (done) => {
    userOne
      .get(`/posts/${testUUID}`)
      .expect("Content-Type", /json/)
      .expect({ message: "Post not found." })
      .expect(400, done);
  });

  test("Get My Posts", (done) => {
    userOne
      .get(`/posts`)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
          expect(res.body).toHaveProperty("posts");
          done();
      });
  });

  ///ERROR TEST
  test("can't edit post with image to have empty content", (done) => {
    userTwo
      .put(`/posts/${userTwoInfo.postid}`)
      .send({
        content: "",
      })
      .expect("Content-Type", /json/)
      .expect(400, done);
  });

  ///ERROR TEST
  test("can't edit someone else  post", (done) => {
    userOne
      .put(`/posts/${userTwoInfo.postid}`)
      .send({
        content: "asdas",
      })
      .expect("Content-Type", /json/)
      .expect(500, done);
  });

  ///ERROR TEST
   test("can't edit to be empty", (done) => {
    userOne
      .put(`/posts/${userOneInfo.postid}`)
      .send({
        content: "",
      })
      .expect("Content-Type", /json/)
      .expect(400, done);
  });


   test("edit post with different content", (done) => {
    userOne
      .put(`/posts/${userOneInfo.postid}`)
      .send({
        content: "BBB",
      })
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

  ///ERROR TEST
  test("can't like a post that doesn't exist", (done) => {
    userTwo
      .put(`/posts/${testUUID}/likes`)
      .send({
        action: "ADD"
      })
      .expect("Content-Type", /json/)
      .expect(500, done);
  });

  test("like post", (done) => {
    userTwo
      .put(`/posts/${userOneInfo.postid}/likes`)
      .send({
        action: "ADD"
      })
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

  test("deslike post", (done) => {
    userTwo
      .put(`/posts/${userOneInfo.postid}/likes`)
      .send({
        action: "REMOVE"
      })
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

  ///ERROR TEST
  test("can't comment on post that doesn't exist", (done) => {
    userOne
      .post(`/posts/${testUUID}`)
      .send({
        content: "hello"
      })
      .expect("Content-Type", /json/)
      .expect(500, done);
  });


   test("post a comment", (done) => {
    userTwo
      .post(`/posts/${userOneInfo.postid}`)
      .send({
        content: "hello"
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
          expect(res.body).toHaveProperty("comment");
          userTwoInfo.commentid = res.body.comment.id;
          done();
      });
    });

    test("post a comment with image", (done) => {
    userOne
      .post(`/posts/${userTwoInfo.postid}`)
      .set("Content-Type", "multipart/form-data")
      .field("content", "hello")
      .attach("uploaded_file", "util/pools/testStuff/waldo.png")
      .expect(200)
      .then((res) => {
          expect(res.body).toHaveProperty("comment");
          userOneInfo.commentid = res.body.comment.id;
          done();
      });
    });

       ///ERROR TEST
    test("can't like comment that doesn't exist", (done) => {
       userTwo
        .put(`/comments/${testUUID}/likes`)
        .send({
          action: "ADD"
        })
        .expect("Content-Type", /json/)
        .expect(500, done);
    });

    test("like comment", (done) => {
       userTwo
        .put(`/comments/${userOneInfo.commentid}/likes`)
        .send({
          action: "ADD"
        })
        .expect("Content-Type", /json/)
        .expect(200, done);
    });

    test("deslike comment", (done) => {
       userTwo
        .put(`/comments/${userOneInfo.commentid}/likes`)
        .send({
          action: "REMOVE"
        })
        .expect("Content-Type", /json/)
        .expect(200, done);
    });


    test("post a comment on a comment", (done) => {
    userTwo
      .post(`/posts/${userTwoInfo.postid}?comment=${userOneInfo.commentid}`)
      .send({
        content: "hello"
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
          expect(res.body).toHaveProperty("comment");
          done();
      });
    });

    ///ERROR TEST
    test("cant't post on a comment that doesn't exist", (done) => {
    userTwo
      .post(`/posts/${userTwoInfo.postid}?comment=${testUUID}`)
      .send({
        content: "hello"
      })
      .expect("Content-Type", /json/)
      .expect(500, done)
    });

    ///ERROR TEST
    test("cant't update comment to be empty", (done) => {
       userOne
      .put(`/comments/${userOneInfo.commentid}`)
      .send({
        content: ""
      })
      .expect("Content-Type", /json/)
      .expect(400, done)
    });

    ///ERROR TEST
    test("cant't update comment you don't own", (done) => {
       userTwo
      .put(`/comments/${userOneInfo.commentid}`)
      .send({
        content: "asdsa"
      })
      .expect("Content-Type", /json/)
      .expect(500, done)
    });

     test("update comment that has an image", (done) => {
       userOne
      .put(`/comments/${userOneInfo.commentid}`)
      .send({
        content: "bye"
      })
      .expect("Content-Type", /json/)
      .expect(200, done)
    });

     test("update normal comment", (done) => {
       userTwo
      .put(`/comments/${userTwoInfo.commentid}`)
      .send({
        content: "cya"
      })
      .expect("Content-Type", /json/)
      .expect(200, done)
    });

    test("post comment with image on comment", (done) => {
      userTwo
        .post(`/posts/${userOneInfo.postid}?comment=${userTwoInfo.commentid}`)
        .send({
          content: "sad"
        })
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
            expect(res.body).toHaveProperty("comment");
            userTwoInfo.deleteCommentid = res.body.comment.id;
            done();
        });
    });

    ///ERROR TEST
     test("can't delete comment you don't own", (done) => {
      userTwo
        .delete(`/comments/${userOneInfo.commentid}`)
        .expect("Content-Type", /json/)
        .expect(500, done)
    })


    test("delete comment", (done) => {
      userTwo
        .delete(`/comments/${userTwoInfo.deleteCommentid}`)
        .expect("Content-Type", /json/)
        .expect(200, done)
    })

    test("get comment", (done) => {
      userTwo
        .get(`/comments/${userOneInfo.commentid}`)
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
            expect(res.body).toHaveProperty("comment");
            expect(res.body.comment).toHaveProperty("ownComments");
            done();
        });
    });

    test("get notifications", (done) => {
      userTwo
        .get("/notifications")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
            expect(res.body).toHaveProperty("notifications");
            userTwoInfo.notificationid = res.body.notifications[0].id;
            done();
        });
    });

    test("clear notification", (done) => {
      userTwo
        .delete(`/notifications/${userTwoInfo.notificationid}`)
        .expect("Content-Type", /json/)
        .expect(200, done)
    });

    test("clear notifications", (done) => {
      userTwo
        .delete(`/notifications`)
        .expect("Content-Type", /json/)
        .expect(200, done)
    });
  
    ///ERROR TEST
   test("Can't delete post you don't own", (done) => {
    userTwo
      .delete(`/posts/${userOneInfo.postid}`)
      .expect("Content-Type", /json/)
      .expect(500, done);
  })

  test("Delete Post", (done) => {
    userTwo
      .delete(`/posts/${userTwoInfo.postid}`)
      .expect("Content-Type", /json/)
      .expect(200, done);
  })

  test("Delete Other Post", (done) => {
    userOne
      .delete(`/posts/${userOneInfo.deletePostid}`)
      .expect("Content-Type", /json/)
      .expect(200, done);
  })

  test("Stop Following", (done) => {
      userOne
          .delete(`/users/${userTwoInfo.id}/follow`)
          .expect("Content-Type", /json/)
          .expect(200, done)
  });

  test("Stop Following", (done) => {
      userTwo
          .delete(`/users/${userOneInfo.id}/follow`)
          .expect("Content-Type", /json/)
          .expect(200, done)
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

  test("Cancel Request", (done) => {
  userOne
    .delete(`/requests/${userOneInfo.requestid}`)
    .expect("Content-Type", /json/)
    .expect(200, done);
  });

  test("Reject Request", (done) => {
  userOne
    .delete(`/requests/${userTwoInfo.requestid}`)
    .expect("Content-Type", /json/)
    .expect(200, done);
  });
});
  