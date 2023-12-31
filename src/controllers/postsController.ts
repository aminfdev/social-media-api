import { Request, Response } from "express";
import db from "../models";

export async function getPosts(req: Request, res: Response) {
  try {
    const posts = await db.Posts.findAll({ include: [db.Likes] });
    return res.status(200).json(posts);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something happened wrong. Try again." });
  }
}

export async function getPostById(req: Request, res: Response) {
  const { postId } = req.params;
  try {
    const post = await db.Posts.findByPk(postId, { include: [db.Likes] });
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    } else {
      return res.status(200).json(post);
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something happened wrong. Try again." });
  }
}

export async function getPostsByUserId(req: Request, res: Response) {
  const { userId } = req.params;
  try {
    const user = await db.Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    } else {
      const posts = await db.Posts.findAll({
        where: { UserId: userId },
        include: [db.Likes],
      });
      if (!posts) {
        return res
          .status(404)
          .json({ message: "User not posted anything yet." });
      } else {
        return res.status(200).json(posts);
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something happened wrong. Try again." });
  }
}

export async function createPost(req: Request, res: Response) {
  const post = req.body;
  try {
    post.UserId = req.user.id;
    const response = await db.Posts.create(post);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something happened wrong. Try again." });
  }
}

export async function updatePost(req: Request, res: Response) {
  const newTitle = req.body.title;
  const newBody = req.body.body;
  const userId = req.user.id;
  const { postId } = req.params;
  try {
    const post = await db.Posts.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    } else {
      if (post.UserId !== userId) {
        return res.status(403).json({
          message: "Access denied. Only author of this post can update it.",
        });
      } else {
        await db.Posts.update(
          { title: newTitle, body: newBody },
          { where: { id: postId, UserId: userId } }
        );
        return res
          .status(200)
          .json({ message: "Successfuly updated the post." });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something happened wrong. Try again." });
  }
}

export async function deletePost(req: Request, res: Response) {
  const userId = req.user.id;
  const { postId } = req.params;
  try {
    const post = await db.Posts.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    } else {
      if (post.UserId !== userId) {
        return res.status(403).json({
          message: "Access denied. Only author of this post can delete it.",
        });
      } else {
        await db.Posts.destroy({
          where: { id: postId, UserId: userId },
        });
        return res
          .status(200)
          .json({ message: "Successfuly deleted the post." });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something happened wrong. Try again." });
  }
}
