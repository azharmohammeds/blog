const router = require('express').Router();
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const validId = (id) => mongoose.isValidObjectId(id);

// Public: list all blogs, optional ?search= and ?category=
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ title: rx }, { content: rx }];
  }
  res.json(await Blog.find(filter).populate('author', 'name').sort({ createdAt: -1 }));
});

// Private: only the logged-in user's blogs
router.get('/mine', auth, async (req, res) => {
  res.json(await Blog.find({ author: req.userId }).populate('author', 'name').sort({ createdAt: -1 }));
});

router.get('/:id', async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: 'Blog not found' });
  const blog = await Blog.findById(req.params.id).populate('author', 'name');
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  res.json(blog);
});

router.post('/', auth, async (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });
  res.status(201).json(await Blog.create({ title, content, category: category || 'General', author: req.userId }));
});

router.put('/:id', auth, async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: 'Blog not found' });
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  if (String(blog.author) !== req.userId) return res.status(403).json({ message: 'Not your blog' });
  const { title, content, category } = req.body;
  if (title) blog.title = title;
  if (content) blog.content = content;
  if (category) blog.category = category;
  await blog.save();
  res.json(blog);
});

router.delete('/:id', auth, async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: 'Blog not found' });
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  if (String(blog.author) !== req.userId) return res.status(403).json({ message: 'Not your blog' });
  await blog.deleteOne();
  res.json({ message: 'Blog deleted' });
});

module.exports = router;
