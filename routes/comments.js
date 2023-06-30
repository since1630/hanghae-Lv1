const express = require("express");
const router = express.Router();
const Comments = require("../schemas/comments");

//? 댓글 조회
router.get("/:_postId/comments", async (req, res) => {
  try {
    const comments = await Comments.find({}).sort({ createdAt: -1 });
    const new_comments = comments.map((comment) => {
      return {
        commentId: comment["_id"], //* comment의 기본키(_id)를 CommentId에 담기 위한 작업
        user: comment["user"],
        content: comment["content"],
        createdAt: comment["createdAt"],
      };
    });
    if (Object.keys(req.params).length < 1 || new_comments.length === 0)
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });
    res.status(200).json({ data: new_comments });
  } catch (err) {
    console.error(err);
  }
});

//? 댓글 생성
router.post("/:_postId/comments", async (req, res) => {
  try {
    const { _postId } = req.params;
    const { user, password, content } = req.body; // POST로 넘어온다. body 객체 참조할 것.

    if (Object.keys(req.params).length < 1 || !user || !password)
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });

    if (!content)
      return res.status(400).json({ message: "댓글 내용을 입력해주세요" });

    await Comments.create({ _postId, user, password, content });
    return res.status(200).json({ message: "댓글을 생성하였습니다" });
  } catch (err) {
    console.error(err);
  }
});

//? 댓글 수정
router.put("/:_postId/comments/:_commentId", async (req, res) => {
  try {
    const { _commentId } = req.params;
    const { password, content } = req.body;

    if (!password || Object.keys(req.params).length < 2) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });
    }
    const comments = await Comments.find({ _id: _commentId });

    if (!content) {
      return res.status(400).json({ message: "댓글 내용을 입력해주세요" });
    } else if (!comments.length) {
      return res
        .status(404)
        .json({ message: "{ message: '댓글 조회에 실패하였습니다. }" });
    }
    await Comments.updateOne(
      { _id: _commentId },
      { $set: { content } }
    );
    return res.status(204).json({ message: "댓글을 수정하였습니다" }); // 상태코드 수정 201 -> 204
  } catch (err) {
    console.error(err);
  }
});

//? 댓글 삭제
router.delete("/:_postId/comments/:_commentId", async (req, res) => {
  try {
    const { _commentId } = req.params;
    const { password } = req.body;
    if (!password || Object.keys(req.params).length < 2) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });
    }
    const comments = await Comments.find({ _id: _commentId });

    if (!comments.length)
      // _commentId(자원) 에 해당하는 값을 찾지 못했으므로 404코드.
      return res.status(404).json({ message: "댓글 조회에 실패했습니다" });

    await Comments.deleteOne({ _id: _commentId });
    return res.status(204).json({ message: "댓글을 삭제하였습니다" });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
