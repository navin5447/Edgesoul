# Contributing to EdgeSoul

Thank you for your interest in contributing to EdgeSoul!

## 🤝 Ways to Contribute

- 🐛 Report bugs
- ✨ Suggest features  
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repo!

## 🐛 Reporting Bugs

Use GitHub Issues with the bug template. Include:
- Steps to reproduce
- Expected vs actual behavior  
- Environment (OS, Node/Python versions)
- Screenshots if applicable

## ✨ Feature Requests

Open an issue describing:
- The feature you'd like
- Why it would be useful
- How it should work

## 🔧 Code Contributions

### Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/edgesoul.git
cd edgesoul

# Install dependencies (see SETUP.md)
cd backend && pip install -r requirements.txt
cd ../frontend && npm install
cd ../desktop && npm install
```

### Development Workflow

1. Create a branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test thoroughly
4. Commit with conventional commits:
   - `feat: add new feature`
   - `fix: resolve bug`
   - `docs: update documentation`
5. Push and create Pull Request

### Code Style

**Python:**
- Follow PEP 8
- Use type hints
- Add docstrings
- Format with `black`

**TypeScript:**
- Follow ESLint rules  
- Use TypeScript types
- Format with `prettier`

### Testing

```bash
# Backend
cd backend && pytest

# Frontend  
cd frontend && npm test
```

## 📄 License

By contributing, you agree your contributions will be licensed under MIT License.

## 📧 Questions?

Open a GitHub Discussion or Issue!

Thank you for contributing! 🙏
