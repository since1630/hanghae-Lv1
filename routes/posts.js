const express = require("express");
const router = express.Router();
const Posts = require("../schemas/posts");

//게시글 전체 조회
router.get("/", async (req, res) => {
  try {
    const posts = await Posts.find({}).sort({ createdAt: -1 });
    const new_posts = posts.map((post) => {
      return {
        postId: post["_id"],
        user: post["user"],
        title: post["title"],
        created_at: post["createdAt"],
      };
    });

    return res.status(200).json({ data: new_posts });
  } catch (err) {
    console.log(err);
  }
});

// 게시글 상세 조회
router.get("/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;
    if (!_postId) {
      // params 받지 못했거나 해당 params에 해당하는 데이터가 없을떄 400 반환. req.body를 체크하려하면 예제랑 다른 결과가 만들어져서 작성x.
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });
    }
    const posts = await Posts.find({ _id: _postId });
    const new_posts = posts.map((post) => {
      return {
        postId: post["_id"],
        user: post["user"],
        title: post["title"],
        created_at: post["createdAt"],
      };
    });

    res.status(200).json({ data: new_posts });
  } catch (err) {
    console.error(err);
  }
});

// 게시글 작성
router.post("/", async (req, res) => {
  try {
    const { user, password, title, content } = req.body; // POST로 넘어온다. body 객체 참조할 것.
    if (
      // Object.keys(req.params).length === 0 ||
      !user ||
      !password ||
      !title ||
      !content
    ) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });
    }
    await Posts.create({ user, password, title, content });
    return res.status(201).json({ message: "게시글을 생성하였습니다" });
  } catch (err) {
    console.error(err);
  }
});

// 게시글 수정
router.put("/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;
    const { password, title, content } = req.body;
    if (_postId || !password || !content) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });
    }

    const posts = await Posts.find({ _id: _postId });

    const db_password = posts.password;
    if (posts && db_password === password) {
      await Posts.updateOne(
        { _id: _postId },
        { $set: { title, content } }
      );
      return res.status(204).json({ message: "게시글을 수정하였습니다" }); // 상태코드 수정 201 -> 204
    } else if (!posts.length) {
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
    }
  } catch (err) {
    console.error(err);
  }
});

// 게시글 삭제
router.delete("/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;
    const { password } = req.body;
    // TODO: 수정
    if (!_postId || !password)
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다." });

    const posts = await Posts.find({ _postId });
    const db_password = posts.password;

    if (posts && password === db_password) await Posts.delete({ _postId });
    else if (!posts.length)
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });

    return res.status(204).json({ message: "게시글을 삭제하였습니다" });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
